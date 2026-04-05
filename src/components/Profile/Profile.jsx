import React from 'react';
import { Typography, Button, Box, CircularProgress } from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import MovieList from '../MovieList/MovieList';
import {
  useGetFavoriteMoviesQuery,
  useGetWatchlistMoviesQuery,
  useMarkAsFavoriteMutation,
  useAddToWatchlistMutation,
} from '../../services/TMDB';
import { STORAGE_KEYS, getStorageItem, removeStorageItems } from '../../utils/storage';

const Profile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const accountId = id || getStorageItem(STORAGE_KEYS.ACCOUNT_ID);
  const sessionId = getStorageItem(STORAGE_KEYS.SESSION_ID);

  const { data: favoriteMovies, isFetching: isFavoriteFetching } = useGetFavoriteMoviesQuery(
    { accountId, sessionId },
    { skip: !accountId || !sessionId },
  );
  const { data: watchlistMovies, isFetching: isWatchlistFetching } = useGetWatchlistMoviesQuery(
    { accountId, sessionId },
    { skip: !accountId || !sessionId },
  );
  const [markAsFavorite] = useMarkAsFavoriteMutation();
  const [addToWatchlist] = useAddToWatchlistMutation();

  const isLoading = isFavoriteFetching || isWatchlistFetching;
  const hasFavoriteMovies = Boolean(favoriteMovies?.results?.length);
  const hasWatchlistMovies = Boolean(watchlistMovies?.results?.length);
  const storageKeysToClear = [
    STORAGE_KEYS.SESSION_ID,
    STORAGE_KEYS.REQUEST_TOKEN,
    STORAGE_KEYS.ACCOUNT_ID,
    STORAGE_KEYS.THEME_MODE,
  ];

  const logout = () => {
    removeStorageItems(storageKeysToClear);
    window.location.href = '/';
  };

  const removeFromFavorites = async (movieId) => {
    if (!accountId || !sessionId) return;
    await markAsFavorite({
      accountId,
      sessionId,
      movieId,
      favorite: false,
    });
  };

  const removeFromWatchlist = async (movieId) => {
    if (!accountId || !sessionId) return;
    await addToWatchlist({
      accountId,
      sessionId,
      movieId,
      watchlist: false,
    });
  };

  return (
    <div>
      <Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h4" gutterBottom>{t('profile.title')}</Typography>
          <Button color="inherit" onClick={logout}>
            {t('profile.logout')} &nbsp; <ExitToApp />
          </Button>
        </Box>
        {isLoading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && !hasFavoriteMovies && !hasWatchlistMovies && (
          <Typography variant="h5">{t('profile.empty')}</Typography>
        )}

        {!isLoading && hasFavoriteMovies && (
          <Box mt={2}>
            <Typography variant="h5" gutterBottom>{t('profile.favorites')}</Typography>
            <MovieList
              movies={favoriteMovies}
              numberOfMovies={20}
              onRemoveMovie={removeFromFavorites}
              removeLabel={t('profile.removeFav')}
              mediaType="movie"
            />
          </Box>
        )}

        {!isLoading && hasWatchlistMovies && (
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>{t('profile.watchlist')}</Typography>
            <MovieList
              movies={watchlistMovies}
              numberOfMovies={20}
              onRemoveMovie={removeFromWatchlist}
              removeLabel={t('profile.removeWl')}
              mediaType="movie"
            />
          </Box>
        )}
      </Box>
    </div>
  );
};

export default Profile;
