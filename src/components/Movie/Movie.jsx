import React from 'react';
import { Typography, Grid, Grow, Tooltip, Rating, IconButton, Box, Chip } from '@mui/material';
import { RemoveCircleOutline } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useStyles from './styles';

const Movie = ({ movie, i, onRemoveMovie, removeLabel, mediaType }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { genreIdOrCategoryName } = useSelector((state) => state.currentGenreOrCategory);
  const isTvContext = typeof genreIdOrCategoryName === 'string' && (
    genreIdOrCategoryName.startsWith('tv/')
    || genreIdOrCategoryName.startsWith('tvg:')
    || genreIdOrCategoryName.startsWith('animeg:')
    || genreIdOrCategoryName === 'anime'
  );
  const inferredMediaType = mediaType
    || movie.media_type
    || (isTvContext ? 'tv' : 'movie');
  const mediaBadgeLabel = inferredMediaType === 'tv' ? t('movie.mediaTv') : t('movie.mediaMovie');
  const title = movie.title || movie.name;

  return (
    <Grid item xs={12} sm={6} md={4} lg={3} xl={2} className={classes.movie}>
      <Grow in key={i} timeout={(i + 1) * 250}>
        <Link className={classes.links} to={`/${inferredMediaType}/${movie.id}`}>
          <Box sx={{ position: 'relative' }}>
            <img
              alt={title}
              className={classes.image}
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : 'https://www.fillmurray.com/200/300'}
            />
            {onRemoveMovie && (
              <IconButton
                aria-label={removeLabel || t('movie.removeAria')}
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveMovie(movie.id);
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <RemoveCircleOutline fontSize="small" />
              </IconButton>
            )}
            <Chip
              label={mediaBadgeLabel}
              size="small"
              sx={{
                position: 'absolute',
                left: 8,
                top: 8,
                height: 22,
                fontSize: '0.66rem',
                fontWeight: 700,
                color: '#fff',
                bgcolor: inferredMediaType === 'tv' ? 'rgba(41,121,255,0.85)' : 'rgba(198,40,40,0.85)',
                '& .MuiChip-label': { px: 0.9 },
              }}
            />
          </Box>
          <Typography className={classes.title} variant="h5">{title}</Typography>
          {!!removeLabel && (
            <Typography variant="caption" color="textSecondary">
              {removeLabel}
            </Typography>
          )}
          <Tooltip disableTouchListener title={`${movie.vote_average} / 10`}>
            <div>
              <Rating readOnly value={movie.vote_average / 2} precision={0.1} />
            </div>
          </Tooltip>
        </Link>
      </Grow>
    </Grid>
  );
};

export default Movie;
