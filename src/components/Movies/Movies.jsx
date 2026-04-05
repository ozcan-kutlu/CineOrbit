import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { useGetMoviesQuery } from '../../services/TMDB';
import MovieList from '../MovieList/MovieList';
import Pagination from '../Pagination/Pagination';

const Movies = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { genreIdOrCategoryName, searchQuery } = useSelector((state) => state.currentGenreOrCategory);
  const { data, error, isFetching } = useGetMoviesQuery({ genreIdOrCategoryName, page, searchQuery });
  const filteredResults = (data?.results || []).filter((item) => !item.media_type || item.media_type === 'movie' || item.media_type === 'tv');
  const totalPages = data?.total_pages || 0;

  useEffect(() => {
    setPage(1);
  }, [genreIdOrCategoryName, searchQuery]);

  if (isFetching) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size="4rem" />
      </Box>
    );
  }

  if (!filteredResults.length) {
    return (
      <Box display="flex" alignItems="center" mt="20px">
        <Typography variant="h4">
          {t('movies.noMatch')}
          <br />
          {t('movies.tryElse')}
        </Typography>
      </Box>
    );
  }

  if (error) return t('movies.error');

  return (
    <div>
      <MovieList movies={{ ...data, results: filteredResults }} />
      <Pagination currentPage={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
};

export default Movies;
