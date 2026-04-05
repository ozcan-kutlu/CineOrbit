import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  ButtonGroup,
  Grid,
  Box,
  CircularProgress,
  Rating,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { Movie as MovieIcon, Theaters, Language, PlusOne, Favorite, FavoriteBorderOutlined, Remove, ArrowBack, Close } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { userSelector } from '../../features/auth';
import { selectGenreOrCategory } from '../../features/currentGenreOrCategory';
import useStyles from './styles';
import {
  useGetRecommendationsQuery,
  useGetSimilarMoviesQuery,
  useGetMovieQuery,
  useGetMovieAccountStatesQuery,
  useMarkAsFavoriteMutation,
  useAddToWatchlistMutation,
} from '../../services/TMDB';
import genreIcons from '../../assets/genres';
import MovieList from '../MovieList/MovieList';
import { createPillButtonSx } from '../Detail/helpers';
import { STORAGE_KEYS, getStorageItem } from '../../utils/storage';

const MovieInformation = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data, isFetching, error } = useGetMovieQuery(id);
  const classes = useStyles();
  const theme = useTheme();
  const trailerDialogFullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const { user } = useSelector(userSelector);
  const [open, setOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const accountId = user?.id || getStorageItem(STORAGE_KEYS.ACCOUNT_ID);
  const sessionId = getStorageItem(STORAGE_KEYS.SESSION_ID);

  const { data: recommendations } = useGetRecommendationsQuery(id);
  const { data: similarMovies } = useGetSimilarMoviesQuery(id);
  const {
    data: accountStates,
    refetch: refetchAccountStates,
  } = useGetMovieAccountStatesQuery(
    { movieId: id, sessionId },
    { skip: !sessionId },
  );
  const [markAsFavorite, { isLoading: isFavoriteLoading }] = useMarkAsFavoriteMutation();
  const [addToWatchlist, { isLoading: isWatchlistLoading }] = useAddToWatchlistMutation();

  const isMovieFavorited = Boolean(accountStates?.favorite);
  const isMovieWatchlisted = Boolean(accountStates?.watchlist);
  const relatedMovies = recommendations?.results?.length ? recommendations : similarMovies;
  const hasTrailer = Boolean(data?.videos?.results?.length > 0);
  const topCast = (data?.credits?.cast || []).filter((character) => character?.profile_path).slice(0, 6);
  const externalBtnSx = createPillButtonSx(theme);
  const actionBtnSx = createPillButtonSx(theme);

  const addToFavorites = async () => {
    if (!sessionId || !accountId) {
      setActionMessage(t('movieDetail.signInFav'));
      return;
    }
    try {
      await markAsFavorite({
        accountId,
        sessionId,
        movieId: id,
        favorite: !isMovieFavorited,
      }).unwrap();
      await refetchAccountStates();
      setActionMessage(isMovieFavorited ? t('movieDetail.removedFav') : t('movieDetail.addedFav'));
    } catch (e) {
      setActionMessage(t('movieDetail.favError'));
    }
  };

  const addMovieToWatchlist = async () => {
    if (!sessionId || !accountId) {
      setActionMessage(t('movieDetail.signInWl'));
      return;
    }
    try {
      await addToWatchlist({
        accountId,
        sessionId,
        movieId: id,
        watchlist: !isMovieWatchlisted,
      }).unwrap();
      await refetchAccountStates();
      setActionMessage(isMovieWatchlisted ? t('movieDetail.removedWl') : t('movieDetail.addedWl'));
    } catch (e) {
      setActionMessage(t('movieDetail.wlError'));
    }
  };

  if (isFetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress size="8rem" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <Link to="/browse">{t('movieDetail.errorBack')}</Link>
      </Box>
    );
  }

  return (
    <Grid container className={classes.containerSpaceAround}>
      <Grid item sm={12} lg={4}>
        <img className={classes.poster} src={`https://image.tmdb.org/t/p/w500/${data?.poster_path}`} alt={data?.title} />
      </Grid>
      <Grid item container direction="column" lg="7">
        <Typography variant="h3" align="center" gutterBottom>
          {data?.title} ({(data.release_date.split('-')[0])})
        </Typography>
        <Typography variant="h5" align="center" gutterBottom>
          {data?.tagline}
        </Typography>
        <Grid item className={classes.containerSpaceAround}>
          <Box display="flex" align="center">
            <Rating readOnly value={data.vote_average / 2} />
            <Typography variant="subtitle1" gutterBottom style={{ marginLeft: '10px' }}>
              {data?.vote_average} /10
            </Typography>
          </Box>
          <Typography variant="h6" align="center" gutterBottom>
            {data?.runtime}min {data?.spoken_languages.length > 0 ? `/ ${data?.spoken_languages[0].name}` : ''}
          </Typography>
        </Grid>
        <Grid item className={classes.genresContainer}>
          {data?.genres?.map((genre) => (
            <Link key={genre.name} className={classes.links} to="/browse" onClick={() => dispatch(selectGenreOrCategory(genre.id))}>
              <img src={genreIcons[genre.name.toLowerCase()]} className={classes.genreImage} height={30} />
              <Typography color="textPrimary" variant="subtitle1">
                {genre?.name}
              </Typography>
            </Link>
          ))}
        </Grid>
        <Typography variant="h5" gutterBottom style={{ marginTop: '10px' }}>
          {t('movieDetail.overview')}
        </Typography>
        <Typography style={{ marginBottom: '2rem' }}>
          {data?.overview}
        </Typography>
        {!!actionMessage && (
          <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>
            {actionMessage}
          </Typography>
        )}
        {topCast.length > 0 && (
          <>
            <Typography variant="h5" gutterBottom>{t('movieDetail.topCast')}</Typography>
            <Grid item container spacing={2}>
              {topCast.map((character, i) => (
                <Grid key={i} item xs={4} md={2} component={Link} to={`/actors/${character.id}`} style={{ textDecoration: 'none' }}>
                  <img className={classes.castImage} src={`https://image.tmdb.org/t/p/w500/${character.profile_path}`} alt={character.name} />
                  <Typography color="textPrimary">{character?.name}</Typography>
                  <Typography color="textSecondary">
                    {character.character.split('/')[0]}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        <Grid item container style={{ marginTop: '2rem' }}>
          <div className={classes.buttonsContainer}>
            <Grid item xs={12} sm={6} className={classes.buttonsContainer}>
              <ButtonGroup size="small" variant="outlined">
                <Button
                  target="_blank"
                  rel="noopener noreferrer"
                  href={data?.homepage}
                  disabled={!data?.homepage}
                  endIcon={<Language />}
                  sx={externalBtnSx}
                >
                  {t('movieDetail.officialSite')}
                </Button>
                <Button
                  target="_blank"
                  rel="noopener noreferrer"
                  href={data?.imdb_id ? `https://www.imdb.com/title/${data.imdb_id}` : undefined}
                  disabled={!data?.imdb_id}
                  endIcon={<MovieIcon />}
                  sx={externalBtnSx}
                >
                  {t('movieDetail.imdb')}
                </Button>
                <Button onClick={() => setOpen(true)} disabled={!hasTrailer} endIcon={<Theaters />} sx={externalBtnSx}>
                  {t('movieDetail.trailer')}
                </Button>
              </ButtonGroup>
            </Grid>
            <Grid item xs={12} sm={6} className={classes.buttonsContainer}>
              <ButtonGroup size="medium" variant="outlined">
                <Button
                  disabled={isFavoriteLoading}
                  onClick={addToFavorites}
                  endIcon={isMovieFavorited ? <FavoriteBorderOutlined /> : <Favorite />}
                  sx={actionBtnSx}
                >
                  {isMovieFavorited ? t('movieDetail.unfavorite') : t('movieDetail.favorite')}
                </Button>
                <Button
                  disabled={isWatchlistLoading}
                  onClick={addMovieToWatchlist}
                  endIcon={isMovieWatchlisted ? <Remove /> : <PlusOne />}
                  sx={actionBtnSx}
                >
                  {isMovieWatchlisted ? t('movieDetail.removeWatchlist') : t('movieDetail.watchlist')}
                </Button>
                <Button endIcon={<ArrowBack />} sx={actionBtnSx}>
                  <Typography style={{ textDecoration: 'none' }} component={Link} to="/browse" color="inherit" variant="subtitle2">
                    {t('movieDetail.back')}
                  </Typography>
                </Button>
              </ButtonGroup>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <Box marginTop="5rem" width="100%">
        <Typography variant="h3" gutterBottom align="center">
          {t('movieDetail.youMightLike')}
        </Typography>
        {relatedMovies?.results?.length
          ? <MovieList movies={relatedMovies} numberOfMovies={12} mediaType="movie" />
          : <Box>{t('movieDetail.nothingFound')}</Box>}
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
        fullScreen={trailerDialogFullScreen}
        scroll="paper"
        aria-labelledby="trailer-dialog-title"
      >
        <DialogTitle
          id="trailer-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            py: 1.25,
            pr: 1,
          }}
        >
          <Typography component="span" variant="subtitle1" noWrap sx={{ flex: 1 }}>
            {t('movieDetail.trailer')}
            {data?.title ? ` — ${data.title}` : ''}
          </Typography>
          <IconButton
            type="button"
            aria-label={t('movieDetail.closeTrailer')}
            onClick={() => setOpen(false)}
            edge="end"
            size="small"
            sx={{ flexShrink: 0 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {data?.videos?.results?.length > 0 ? (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                bgcolor: '#000',
              }}
            >
              <iframe
                className={classes.video}
                title={t('movieDetail.trailer')}
                src={
                  open && data.videos.results[0]?.key
                    ? `https://www.youtube.com/embed/${data.videos.results[0].key}?autoplay=1`
                    : 'about:blank'
                }
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </Box>
          ) : (
            <Typography variant="h6" color="textPrimary" sx={{ p: 2 }}>
              {t('movieDetail.noTrailer')}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default MovieInformation;
