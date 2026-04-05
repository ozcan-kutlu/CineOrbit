import React, { useMemo } from 'react';
import {
  Divider, Box, Button, List, ListItem, ListItemText, ListSubheader, ListItemIcon, CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { selectGenreOrCategory, searchMovie } from '../../features/currentGenreOrCategory';
import { useGetGenresQuery, useGetTvGenresQuery } from '../../services/TMDB';
import genreIcons from '../../assets/genres';
import useStyles from './styles';

const redLogo = '/cineorbit-red.svg';

const Sidebar = () => {
  const { t } = useTranslation();
  const categories = useMemo(() => [
    { labelKey: 'sidebar.catAll', value: 'all/trending' },
    { labelKey: 'sidebar.catMovies', value: 'movie/popular' },
    { labelKey: 'sidebar.catTvSeries', value: 'tv/popular' },
    { labelKey: 'sidebar.catAnime', value: 'anime' },
  ], []);
  const theme = useTheme();
  const classes = useStyles();
  const { data: movieGenres, isFetching: isMovieGenresFetching } = useGetGenresQuery();
  const { data: tvGenres, isFetching: isTvGenresFetching } = useGetTvGenresQuery();
  const dispatch = useDispatch();
  const { genreIdOrCategoryName } = useSelector((state) => state.currentGenreOrCategory);
  const isDark = theme.palette.mode === 'dark';
  const isTvContext = typeof genreIdOrCategoryName === 'string'
    && (genreIdOrCategoryName.startsWith('tv/') || genreIdOrCategoryName === 'anime' || genreIdOrCategoryName.startsWith('tvg:'));
  const isAnimeContext = genreIdOrCategoryName === 'anime'
    || (typeof genreIdOrCategoryName === 'string' && genreIdOrCategoryName.startsWith('animeg:'));
  const animeGenreIds = [16, 10759, 18, 35, 9648, 10765, 10762, 10751];
  const animeGenres = (tvGenres?.genres || []).filter((genre) => animeGenreIds.includes(genre.id));
  let genresToShow = movieGenres?.genres;
  if (isTvContext) genresToShow = tvGenres?.genres;
  if (isAnimeContext) genresToShow = animeGenres;
  const isGenresFetching = (isTvContext || isAnimeContext) ? isTvGenresFetching : isMovieGenresFetching;
  const getCategorySx = (value) => {
    const isActive = genreIdOrCategoryName === value;
    const activeBackground = isDark
      ? 'linear-gradient(90deg, rgba(255,23,68,0.34), rgba(41,121,255,0.34))'
      : 'linear-gradient(90deg, rgba(255,235,238,0.95), rgba(255,245,245,0.98))';
    const passiveBackground = isDark
      ? 'rgba(255,255,255,0.03)'
      : 'rgba(255,255,255,0.66)';

    return {
      color: isDark ? '#fff' : '#8e1a1a',
      borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(198,40,40,0.42)',
      background: isActive ? activeBackground : passiveBackground,
    };
  };
  const dividerSx = {
    mx: 2,
    my: 1.25,
    borderColor: 'transparent',
    height: '2px',
    borderRadius: '999px',
    background: isDark
      ? 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,23,68,0.95) 28%, rgba(41,121,255,1) 50%, rgba(255,23,68,0.95) 72%, rgba(0,0,0,0) 100%)'
      : 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(198,40,40,0.9) 35%, rgba(255,138,101,0.92) 50%, rgba(198,40,40,0.9) 65%, rgba(0,0,0,0) 100%)',
    boxShadow: isDark
      ? '0 0 12px rgba(41,121,255,0.75), 0 0 18px rgba(255,23,68,0.6), 0 0 26px rgba(41,121,255,0.45)'
      : '0 0 8px rgba(198,40,40,0.3), 0 0 14px rgba(255,138,101,0.22)',
  };
  let genresTitle = t('sidebar.movieGenres');
  if (isTvContext) genresTitle = t('sidebar.tvGenres');
  if (isAnimeContext) genresTitle = t('sidebar.animeGenres');
  const getGenreCategoryValue = (id) => {
    if (isAnimeContext) return `animeg:${id}`;
    if (isTvContext) return `tvg:${id}`;
    return id;
  };
  return (
    <div className={classes.container}>
      <>
        <Link
          to="/"
          className={classes.imageLink}
          onClick={() => {
            dispatch(searchMovie(''));
            dispatch(selectGenreOrCategory(''));
          }}
        >
          <img className={classes.image} src={redLogo} alt={t('sidebar.logoAlt')} />
        </Link>
        <Divider sx={dividerSx} />
        <Box px={1.5} pb={0.5}>
          <Box sx={{ px: 1, pb: 0.6, color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(142,26,26,0.8)', fontSize: '0.78rem', fontWeight: 700 }}>
            {t('sidebar.categories')}
          </Box>
          <Box className={classes.categoryTabs}>
            {categories.map(({ labelKey, value }) => (
              <Button
                key={value}
                component={Link}
                to="/browse"
                onClick={() => dispatch(selectGenreOrCategory(value))}
                className={classes.categoryButton}
                sx={getCategorySx(value)}
              >
                {t(labelKey)}
              </Button>
            ))}
          </Box>
        </Box>
        <Divider sx={dividerSx} />
        <List>
          <ListSubheader>{genresTitle}</ListSubheader>
          {isGenresFetching ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : genresToShow?.map(({ name, id }) => (
            <Link key={name} className={classes.links} to="/browse">
              <ListItem
                className={classes.listItem}
                onClick={() => dispatch(selectGenreOrCategory(getGenreCategoryValue(id)))}
                button
              >
                <ListItemIcon>
                  <img src={genreIcons[name.toLowerCase()] || genreIcons.popular} className={classes.genreImages} height={30} alt={name} />
                </ListItemIcon>
                <ListItemText primary={name} />
              </ListItem>
            </Link>
          ))}
        </List>
      </>
    </div>
  );
};

export default Sidebar;
