import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const tmdbApiKey = process.env.REACT_APP_TMDB_KEY;
const getTmdbLanguage = () => {
  if (typeof window === 'undefined') return 'en-US';
  const saved = window.localStorage.getItem('cineorbit_language');
  const raw = saved || window.navigator.language || 'en';
  return raw.toLowerCase().startsWith('tr') ? 'tr-TR' : 'en-US';
};

const appendLanguage = (url) => {
  if (!url) return url;
  if (/[?&]language=/.test(url)) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}language=${getTmdbLanguage()}`;
};

const rawBaseQuery = fetchBaseQuery({ baseUrl: 'https://api.themoviedb.org/3' });
const baseQueryWithLanguage = async (args, api, extraOptions) => {
  const preparedArgs = typeof args === 'string'
    ? appendLanguage(args)
    : { ...args, url: appendLanguage(args.url) };
  return rawBaseQuery(preparedArgs, api, extraOptions);
};

export const tmdbApi = createApi({
  reducerPath: 'tmdbApi',
  tagTypes: ['MovieAccountStates', 'FavoriteMovies', 'WatchlistMovies'],
  baseQuery: baseQueryWithLanguage,
  endpoints: (builder) => ({
    //* Get Genres
    getGenres: builder.query({
      query: () => `/genre/movie/list?api_key=${tmdbApiKey}`,
    }),
    getTvGenres: builder.query({
      query: () => `/genre/tv/list?api_key=${tmdbApiKey}`,
    }),
    //* Get Movies by [Type]
    getMovies: builder.query({
      query: ({ genreIdOrCategoryName, page, searchQuery }) => {
        //* Get Movies by Search
        if (searchQuery) {
          return `/search/multi?query=${searchQuery}&page=${page}&api_key=${tmdbApiKey}`;
        }

        //* All (Movies + TV)
        if (genreIdOrCategoryName === 'all/trending') {
          return `trending/all/week?page=${page}&api_key=${tmdbApiKey}`;
        }

        //* Anime (mostly TV anime)
        if (genreIdOrCategoryName === 'anime') {
          return `discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}&api_key=${tmdbApiKey}`;
        }

        //* Anime by sub-genre (keeps anime-only filter)
        if (genreIdOrCategoryName && typeof genreIdOrCategoryName === 'string' && genreIdOrCategoryName.startsWith('animeg:')) {
          const genreId = genreIdOrCategoryName.replace('animeg:', '');
          return `discover/tv?with_genres=16,${genreId}&with_original_language=ja&sort_by=popularity.desc&page=${page}&api_key=${tmdbApiKey}`;
        }

        //* TV by Genre
        if (genreIdOrCategoryName && typeof genreIdOrCategoryName === 'string' && genreIdOrCategoryName.startsWith('tvg:')) {
          const genreId = genreIdOrCategoryName.replace('tvg:', '');
          return `discover/tv?with_genres=${genreId}&sort_by=popularity.desc&page=${page}&api_key=${tmdbApiKey}`;
        }

        //* Get TV by Category
        if (genreIdOrCategoryName && typeof genreIdOrCategoryName === 'string' && genreIdOrCategoryName.startsWith('tv/')) {
          return `discover/tv?sort_by=popularity.desc&page=${page}&api_key=${tmdbApiKey}`;
        }

        //* Get Movie by Category (explicit)
        if (genreIdOrCategoryName && typeof genreIdOrCategoryName === 'string' && genreIdOrCategoryName.startsWith('movie/')) {
          return `discover/movie?sort_by=popularity.desc&page=${page}&api_key=${tmdbApiKey}`;
        }

        //* Get Movies by Genre
        if (genreIdOrCategoryName && typeof genreIdOrCategoryName === 'number') {
          return `discover/movie?with_genres=${genreIdOrCategoryName}&sort_by=popularity.desc&page=${page}&api_key=${tmdbApiKey}`;
        }

        //* Get Popular Movies
        return `discover/movie?sort_by=popularity.desc&page=${page}&api_key=${tmdbApiKey}`;
      },
    }),

    //* Get Movie
    getMovie: builder.query({
      query: (id) => `/movie/${id}?append_to_response=videos,credits&api_key=${tmdbApiKey}`,
    }),
    getTvShow: builder.query({
      query: (id) => `/tv/${id}?append_to_response=videos,credits,external_ids&api_key=${tmdbApiKey}`,
    }),
    getMovieAccountStates: builder.query({
      query: ({ movieId, sessionId }) => `/movie/${movieId}/account_states?session_id=${sessionId}&api_key=${tmdbApiKey}`,
      providesTags: (result, error, arg) => [{ type: 'MovieAccountStates', id: String(arg.movieId) }],
    }),
    markAsFavorite: builder.mutation({
      query: ({ accountId, sessionId, movieId, favorite }) => ({
        url: `/account/${accountId}/favorite?session_id=${sessionId}&api_key=${tmdbApiKey}`,
        method: 'POST',
        body: {
          media_type: 'movie',
          media_id: Number(movieId),
          favorite,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'MovieAccountStates', id: String(arg.movieId) },
        { type: 'FavoriteMovies', id: String(arg.accountId) },
      ],
    }),
    addToWatchlist: builder.mutation({
      query: ({ accountId, sessionId, movieId, watchlist }) => ({
        url: `/account/${accountId}/watchlist?session_id=${sessionId}&api_key=${tmdbApiKey}`,
        method: 'POST',
        body: {
          media_type: 'movie',
          media_id: Number(movieId),
          watchlist,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'MovieAccountStates', id: String(arg.movieId) },
        { type: 'WatchlistMovies', id: String(arg.accountId) },
      ],
    }),
    getFavoriteMovies: builder.query({
      query: ({ accountId, sessionId }) => `/account/${accountId}/favorite/movies?session_id=${sessionId}&api_key=${tmdbApiKey}`,
      providesTags: (result, error, arg) => [{ type: 'FavoriteMovies', id: String(arg.accountId) }],
    }),
    getWatchlistMovies: builder.query({
      query: ({ accountId, sessionId }) => `/account/${accountId}/watchlist/movies?session_id=${sessionId}&api_key=${tmdbApiKey}`,
      providesTags: (result, error, arg) => [{ type: 'WatchlistMovies', id: String(arg.accountId) }],
    }),
    //* Get Related Movies
    getRecommendations: builder.query({
      query: (movieId) => `/movie/${movieId}/recommendations?api_key=${tmdbApiKey}`,
    }),
    getSimilarMovies: builder.query({
      query: (movieId) => `/movie/${movieId}/similar?api_key=${tmdbApiKey}`,
    }),
    getTvRecommendations: builder.query({
      query: (tvId) => `/tv/${tvId}/recommendations?api_key=${tmdbApiKey}`,
    }),
    getSimilarTvShows: builder.query({
      query: (tvId) => `/tv/${tvId}/similar?api_key=${tmdbApiKey}`,
    }),

    getActorsDetails: builder.query({
      query: (id) => `person/${id}?api_key=${tmdbApiKey}`,
    }),

    getMoviesByActorId: builder.query({
      query: (id) => `/person/${id}/combined_credits?api_key=${tmdbApiKey}`,
    }),
    getSearchSuggestions: builder.query({
      query: (query) => `/search/multi?query=${encodeURIComponent(query)}&page=1&api_key=${tmdbApiKey}`,
    }),
  }),
});

export const {
  useGetGenresQuery,
  useGetTvGenresQuery,
  useGetMoviesQuery,
  useGetMovieQuery,
  useGetTvShowQuery,
  useGetMovieAccountStatesQuery,
  useMarkAsFavoriteMutation,
  useAddToWatchlistMutation,
  useGetFavoriteMoviesQuery,
  useGetWatchlistMoviesQuery,
  useGetRecommendationsQuery,
  useGetTvRecommendationsQuery,
  useGetSimilarMoviesQuery,
  useGetSimilarTvShowsQuery,
  useGetActorsDetailsQuery,
  useGetMoviesByActorIdQuery,
  useLazyGetSearchSuggestionsQuery,
} = tmdbApi;
