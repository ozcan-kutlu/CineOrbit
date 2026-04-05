import React from 'react';
import { Grid } from '@mui/material';

import useStyles from './styles';
import Movie from '../Movie/Movie';

const MovieList = ({ movies, numberOfMovies, onRemoveMovie, removeLabel, mediaType }) => {
  const classes = useStyles();
  const filteredResults = (movies?.results || []).filter((item) => !item.media_type || item.media_type === 'movie' || item.media_type === 'tv');

  return (
    <Grid container className={classes.moviesContainer}>
      {filteredResults.slice(0, numberOfMovies).map((movie, i) => (
        <Movie
          key={i}
          movie={movie}
          i={i}
          onRemoveMovie={onRemoveMovie}
          removeLabel={removeLabel}
          mediaType={mediaType}
        />
      ))}
    </Grid>
  );
};

export default MovieList;
