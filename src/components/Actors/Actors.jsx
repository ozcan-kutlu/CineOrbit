import React, { useState } from 'react';
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '@mui/icons-material';

import useStyles from './styles';
import { useGetActorsDetailsQuery, useGetMoviesByActorIdQuery } from '../../services/TMDB';
import MovieList from '../MovieList/MovieList';
import Pagination from '../Pagination/Pagination';

const Actors = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const history = useHistory();
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const { data, isFetching, error } = useGetActorsDetailsQuery(id);
  const { data: credits, isFetching: isCreditsFetching } = useGetMoviesByActorIdQuery(id);
  const isGuestLikeCharacter = (character = '') => {
    const normalized = character.toLowerCase();
    return normalized.includes('guest')
      || normalized.includes('self')
      || normalized.includes('himself')
      || normalized.includes('herself')
      || normalized.includes('host')
      || normalized.includes('cameo');
  };
  const isPrimaryRole = (item) => {
    if (!item?.character || isGuestLikeCharacter(item.character)) return false;
    if (item.media_type === 'movie') {
      // Lower `order` values mean higher billing on TMDB.
      return typeof item.order === 'number' ? item.order <= 6 : true;
    }
    if (item.media_type === 'tv') {
      // For TV, use episode count to separate main vs guest-style roles.
      return (item.episode_count || 0) >= 4;
    }
    return false;
  };
  const combinedResults = (credits?.cast || [])
    .filter((item) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
    .filter((item) => isPrimaryRole(item))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const totalPages = Math.max(1, Math.ceil(combinedResults.length / PAGE_SIZE));
  const paginatedResults = combinedResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isFetching || isCreditsFetching) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size="8rem" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <Button startIcon={<ArrowBack />} onClick={() => history.goBack()} color="primary">
          {t('actors.goBack')}
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item lg={5} xl={4}>
          <img
            className={classes.image}
            src={`https://image.tmdb.org/t/p/w780/${data?.profile_path}`}
            alt={data.name}
          />
        </Grid>
        <Grid item lg={7} xl={8} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
          <Typography variant="h2" gutterBottom>
            {data?.name}
          </Typography>
          <Typography variant="h5" gutterBottom>
            {t('actors.born', {
              date: data?.birthday
                ? new Date(data.birthday).toLocaleDateString(i18n.language?.startsWith('tr') ? 'tr-TR' : 'en-US')
                : '',
            })}
          </Typography>
          <Typography variant="body1" align="justify" paragraph>
            {data?.biography || t('actors.noBio')}
          </Typography>
          <Box marginTop="2rem" display="flex" justifyContent="space-around">
            <Button variant="contained" color="primary" target="_blank" href={`https://www.imdb.com/name/${data?.imdb_id}`}>
              IMDB
            </Button>
            <Button startIcon={<ArrowBack />} onClick={() => history.goBack()} color="primary">
              {t('actors.back')}
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Box margin="2rem 0">
        <Typography variant="h2" gutterBottom align="center">{t('actors.moviesTv')}</Typography>
        <MovieList movies={{ results: paginatedResults }} numberOfMovies={PAGE_SIZE} />
        <Pagination currentPage={page} setPage={setPage} totalPages={totalPages} />
      </Box>
    </>
  );
};

export default Actors;
