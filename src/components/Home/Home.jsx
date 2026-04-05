import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Container,
  useTheme,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  LocalFireDepartment,
  Movie,
  LiveTv,
  Animation,
  Explore,
} from '@mui/icons-material';

import { selectGenreOrCategory } from '../../features/currentGenreOrCategory';
import { useGetMoviesQuery } from '../../services/TMDB';
import MovieList from '../MovieList/MovieList';

const Home = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();

  const categoryChips = useMemo(() => [
    { labelKey: 'home.chipAllTrending', value: 'all/trending', icon: TrendingUp },
    { labelKey: 'home.chipMovies', value: 'movie/popular', icon: Movie },
    { labelKey: 'home.chipTv', value: 'tv/popular', icon: LiveTv },
    { labelKey: 'home.chipAnime', value: 'anime', icon: Animation },
  ], []);

  const { data: trending, isFetching: loadingTrending } = useGetMoviesQuery({
    genreIdOrCategoryName: 'all/trending',
    page: 1,
    searchQuery: '',
  });

  const { data: popularMovies, isFetching: loadingPopular } = useGetMoviesQuery({
    genreIdOrCategoryName: 'movie/popular',
    page: 1,
    searchQuery: '',
  });

  const { data: popularTv, isFetching: loadingTv } = useGetMoviesQuery({
    genreIdOrCategoryName: 'tv/popular',
    page: 1,
    searchQuery: '',
  });

  const heroBackdrop = trending?.results?.find((item) => item?.backdrop_path)?.backdrop_path;
  const heroTitle = trending?.results?.[0]?.title || trending?.results?.[0]?.name;

  const goBrowse = (value) => {
    dispatch(selectGenreOrCategory(value));
  };

  const isInitialLoading = loadingTrending && !trending;

  if (isInitialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size="4rem" />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          minHeight: { xs: 280, md: 360 },
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #121212 50%, #1e1e2e 100%)'
            : 'linear-gradient(135deg, #ffebee 0%, #fff8f8 45%, #fce4ec 100%)',
        }}
      >
        {heroBackdrop && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.2) 100%), url(https://image.tmdb.org/t/p/w1280/${heroBackdrop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          />
        )}
        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            py: { xs: 4, md: 6 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 4,
              color: heroBackdrop ? 'rgba(255,255,255,0.85)' : 'text.secondary',
              fontWeight: 700,
            }}
          >
            CineOrbit
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mt: 1,
              mb: 1.5,
              fontWeight: 800,
              maxWidth: 720,
              color: heroBackdrop ? '#fff' : 'text.primary',
              textShadow: heroBackdrop ? '0 2px 24px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {t('home.heroTitle')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              maxWidth: 560,
              color: heroBackdrop ? 'rgba(255,255,255,0.88)' : 'text.secondary',
              lineHeight: 1.7,
            }}
          >
            {heroTitle
              ? t('home.heroWithTitle', { title: heroTitle })
              : t('home.heroNoTitle')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Button
              component={Link}
              to="/browse"
              variant="contained"
              size="large"
              startIcon={<Explore />}
              onClick={() => goBrowse('all/trending')}
              sx={{
                borderRadius: '999px',
                px: 3,
                py: 1.2,
                fontWeight: 700,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(41,121,255,0.35)'
                  : '0 8px 24px rgba(198,40,40,0.28)',
              }}
            >
              {t('home.explore')}
            </Button>
            <Button
              component={Link}
              to="/browse"
              variant="outlined"
              size="large"
              onClick={() => goBrowse('movie/popular')}
              sx={{ borderRadius: '999px', px: 2.5, fontWeight: 600 }}
            >
              {t('home.popularMovies')}
            </Button>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 3 }}>
            {categoryChips.map(({ labelKey, value, icon: Icon }) => (
              <Chip
                key={value}
                component={Link}
                to="/browse"
                clickable
                icon={<Icon sx={{ fontSize: '1.1rem !important' }} />}
                label={t(labelKey)}
                onClick={() => goBrowse(value)}
                sx={{
                  borderRadius: '999px',
                  fontWeight: 600,
                  borderColor: heroBackdrop ? 'rgba(255,255,255,0.4)' : undefined,
                  color: heroBackdrop ? '#fff' : undefined,
                  '& .MuiChip-icon': { color: heroBackdrop ? '#fff' : undefined },
                }}
                variant={heroBackdrop ? 'outlined' : 'filled'}
              />
            ))}
          </Stack>
        </Container>
      </Box>

      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUp color="primary" /> {t('home.trendingWeek')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('home.trendingSub')}
      </Typography>
      {loadingTrending ? (
        <Box py={2} display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <MovieList movies={trending} numberOfMovies={12} />
      )}

      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalFireDepartment color="primary" /> {t('home.popularMoviesSection')}
      </Typography>
      {loadingPopular ? (
        <Box py={2} display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <MovieList movies={popularMovies} numberOfMovies={12} mediaType="movie" />
      )}

      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LiveTv color="primary" /> {t('home.popularTv')}
      </Typography>
      {loadingTv ? (
        <Box py={2} display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <MovieList movies={popularTv} numberOfMovies={12} mediaType="tv" />
      )}

      <Box
        sx={{
          mt: 6,
          mb: 2,
          p: 3,
          borderRadius: 3,
          textAlign: 'center',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(90deg, rgba(255,23,68,0.12), rgba(41,121,255,0.12))'
            : 'linear-gradient(90deg, rgba(255,235,238,0.6), rgba(255,245,245,0.9))',
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {t('home.ctaTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('home.ctaBody')}
        </Typography>
        <Button
          component={Link}
          to="/browse"
          variant="contained"
          onClick={() => goBrowse('all/trending')}
          sx={{ borderRadius: '999px', px: 4, fontWeight: 700 }}
        >
          {t('home.ctaButton')}
        </Button>
      </Box>
    </Box>
  );
};

export default Home;
