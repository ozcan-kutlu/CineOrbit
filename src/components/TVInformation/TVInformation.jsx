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
import { Movie as MovieIcon, Theaters, Language, ArrowBack, Close } from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { selectGenreOrCategory } from '../../features/currentGenreOrCategory';
import useStyles from '../MovieInformation/styles';
import {
  useGetTvShowQuery,
  useGetTvRecommendationsQuery,
  useGetSimilarTvShowsQuery,
} from '../../services/TMDB';
import genreIcons from '../../assets/genres';
import MovieList from '../MovieList/MovieList';
import { createPillButtonSx } from '../Detail/helpers';

const TVInformation = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data, isFetching, error } = useGetTvShowQuery(id);
  const { data: recommendations } = useGetTvRecommendationsQuery(id);
  const { data: similarShows } = useGetSimilarTvShowsQuery(id);
  const relatedShows = recommendations?.results?.length ? recommendations : similarShows;
  const classes = useStyles();
  const theme = useTheme();
  const trailerDialogFullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const hasTrailer = Boolean(data?.videos?.results?.length > 0);
  const topCast = (data?.credits?.cast || []).filter((character) => character?.profile_path).slice(0, 6);
  // Prefer season array totals; this avoids mismatch from special/metadata fields.
  const regularSeasons = (data?.seasons || []).filter((season) => season?.season_number > 0);
  const seasonsCount = regularSeasons.length || data?.number_of_seasons || 0;
  const episodesCount = regularSeasons.reduce((sum, season) => sum + (season?.episode_count || 0), 0)
    || data?.number_of_episodes
    || 0;
  const lastAired = data?.last_episode_to_air;
  const airedEpisodesCount = (() => {
    if (lastAired?.season_number > 0 && lastAired?.episode_number > 0) {
      const previousSeasonsTotal = regularSeasons
        .filter((season) => season.season_number < lastAired.season_number)
        .reduce((sum, season) => sum + (season?.episode_count || 0), 0);
      return previousSeasonsTotal + lastAired.episode_number;
    }
    return Math.min(episodesCount, data?.number_of_episodes || 0);
  })();

  const externalBtnSx = createPillButtonSx(theme);

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
        <Link to="/browse">{t('tvDetail.errorBack')}</Link>
      </Box>
    );
  }

  return (
    <Grid container className={classes.containerSpaceAround}>
      <Grid item sm={12} lg={4}>
        <img className={classes.poster} src={`https://image.tmdb.org/t/p/w500/${data?.poster_path}`} alt={data?.name} />
      </Grid>
      <Grid item container direction="column" lg="7">
        <Typography variant="h3" align="center" gutterBottom>
          {data?.name} ({(data?.first_air_date || '').split('-')[0]})
        </Typography>
        <Typography variant="h5" align="center" gutterBottom>
          {data?.tagline}
        </Typography>
        <Grid item className={classes.containerSpaceAround}>
          <Box display="flex" align="center">
            <Rating readOnly value={(data?.vote_average || 0) / 2} />
            <Typography variant="subtitle1" gutterBottom style={{ marginLeft: '10px' }}>
              {data?.vote_average} /10
            </Typography>
          </Box>
          <Typography variant="h6" align="center" gutterBottom>
            {t('tvDetail.seasonsEpisodes', {
              seasons: seasonsCount,
              episodes: episodesCount,
            })}
          </Typography>
          {airedEpisodesCount > 0 && airedEpisodesCount !== episodesCount && (
            <Typography variant="subtitle2" align="center" color="text.secondary">
              {t('tvDetail.airedEpisodes', { count: airedEpisodesCount })}
            </Typography>
          )}
        </Grid>
        <Grid item className={classes.genresContainer}>
          {data?.genres?.map((genre) => (
            <Link key={genre.name} className={classes.links} to="/browse" onClick={() => dispatch(selectGenreOrCategory(genre.id))}>
              <img src={genreIcons[genre.name.toLowerCase()]} className={classes.genreImage} height={30} alt={genre.name} />
              <Typography color="textPrimary" variant="subtitle1">
                {genre?.name}
              </Typography>
            </Link>
          ))}
        </Grid>
        <Typography variant="h5" gutterBottom style={{ marginTop: '10px' }}>
          {t('tvDetail.overview')}
        </Typography>
        <Typography style={{ marginBottom: '2rem' }}>
          {data?.overview}
        </Typography>
        {topCast.length > 0 && (
          <>
            <Typography variant="h5" gutterBottom>{t('tvDetail.topCast')}</Typography>
            <Grid item container spacing={2}>
              {topCast.map((character, i) => (
                <Grid key={i} item xs={4} md={2} component={Link} to={`/actors/${character.id}`} style={{ textDecoration: 'none' }}>
                  <img className={classes.castImage} src={`https://image.tmdb.org/t/p/w500/${character.profile_path}`} alt={character.name} />
                  <Typography color="textPrimary">{character?.name}</Typography>
                  <Typography color="textSecondary">
                    {character.character?.split('/')?.[0]}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        <Grid item container style={{ marginTop: '1rem' }}>
          <div className={classes.buttonsContainer}>
            <Grid item xs={12} className={classes.buttonsContainer}>
              <ButtonGroup size="small" variant="outlined">
                <Button
                  target="_blank"
                  rel="noopener noreferrer"
                  href={data?.homepage}
                  disabled={!data?.homepage}
                  endIcon={<Language />}
                  sx={externalBtnSx}
                >
                  {t('tvDetail.officialSite')}
                </Button>
                <Button
                  target="_blank"
                  rel="noopener noreferrer"
                  href={data?.external_ids?.imdb_id ? `https://www.imdb.com/title/${data.external_ids.imdb_id}` : undefined}
                  disabled={!data?.external_ids?.imdb_id}
                  endIcon={<MovieIcon />}
                  sx={externalBtnSx}
                >
                  {t('tvDetail.imdb')}
                </Button>
                <Button onClick={() => setOpen(true)} disabled={!hasTrailer} endIcon={<Theaters />} sx={externalBtnSx}>
                  {t('tvDetail.trailer')}
                </Button>
                <Button endIcon={<ArrowBack />} component={Link} to="/browse" sx={externalBtnSx}>
                  {t('tvDetail.back')}
                </Button>
              </ButtonGroup>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <Box marginTop="5rem" width="100%">
        <Typography variant="h3" gutterBottom align="center">
          {t('tvDetail.youMightLike')}
        </Typography>
        {relatedShows?.results?.length
          ? <MovieList movies={relatedShows} numberOfMovies={12} mediaType="tv" />
          : <Box>{t('tvDetail.nothingFound')}</Box>}
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
        fullScreen={trailerDialogFullScreen}
        scroll="paper"
        aria-labelledby="tv-trailer-dialog-title"
      >
        <DialogTitle
          id="tv-trailer-dialog-title"
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
            {t('tvDetail.trailer')}
            {data?.name ? ` — ${data.name}` : ''}
          </Typography>
          <IconButton
            type="button"
            aria-label={t('tvDetail.closeTrailer')}
            onClick={() => setOpen(false)}
            edge="end"
            size="small"
            sx={{ flexShrink: 0 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {hasTrailer ? (
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
                title={t('tvDetail.trailer')}
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
              {t('tvDetail.noTrailer')}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default TVInformation;
