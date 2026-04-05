import React, { useEffect, useState } from 'react';
import {
  TextField, InputAdornment, CircularProgress, Box, Typography, Paper, List, ListItemButton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useHistory, useLocation } from 'react-router-dom';

import { searchMovie } from '../../features/currentGenreOrCategory';
import { useLazyGetSearchSuggestionsQuery } from '../../services/TMDB';
import useStyles from './styles';

const Search = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.currentGenreOrCategory.searchQuery);
  const [triggerSearchSuggestions] = useLazyGetSearchSuggestionsQuery();
  const theme = useTheme();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    setQuery(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/browse') {
      setQuery('');
      setOptions([]);
      if (searchQuery) {
        dispatch(searchMovie(''));
      }
    }
  }, [location.pathname, dispatch, searchQuery]);

  useEffect(() => {
    let active = true;
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setOptions([]);
      setLoading(false);
      return () => {};
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await triggerSearchSuggestions(normalizedQuery).unwrap();
        const mapped = (data?.results || [])
          .filter((item) => item && (item.media_type === 'movie' || item.media_type === 'tv'))
          .slice(0, 8)
          .map((item) => ({
            id: item.id,
            mediaType: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
            title: item.title || item.name || 'Unknown',
            year: (item.release_date || item.first_air_date || '').slice(0, 4),
            posterPath: item.poster_path || '',
          }));
        if (active) {
          setOptions(mapped);
        }
      } catch (e) {
        if (active) {
          setOptions([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 320);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const submitSearch = (rawValue) => {
    const normalizedQuery = (rawValue || '').trim();
    if (!normalizedQuery) return;
    dispatch(searchMovie(normalizedQuery));
    history.push('/browse');
  };

  return (
    <div className={classes.searchContainer}>
      <TextField
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            submitSearch(query);
          }
        }}
        value={query}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        onChange={(e) => setQuery(e.target.value)}
        variant="outlined"
        placeholder={t('search.placeholder')}
        size="small"
        sx={{
          width: { xs: '100%', sm: 260 },
          transition: 'width 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
          '&:focus-within': {
            width: { xs: '100%', sm: 330 },
            transform: 'translateY(-1px)',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '999px',
            color: '#fff',
            background: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,255,255,0.22)',
            backdropFilter: 'blur(3px)',
            '& fieldset': {
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.28)'
                : 'rgba(255,235,238,0.7)',
            },
            '&:hover fieldset': {
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.55)'
                : 'rgba(255,255,255,0.95)',
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.mode === 'dark' ? '#90caf9' : '#ffebee',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 0 10px rgba(144,202,249,0.35)'
                : '0 0 10px rgba(255,235,238,0.45)',
            },
          },
        }}
        InputProps={{
          className: classes.input,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: theme.palette.mode === 'dark' ? '#90caf9' : '#ffebee' }} />
            </InputAdornment>
          ),
          endAdornment: loading ? <CircularProgress color="inherit" size={16} /> : null,
        }}
      />
      {isFocused && query.trim().length >= 2 && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 1500,
            borderRadius: 2,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {options.length ? (
            <List dense>
              {options.map((option) => (
                <ListItemButton
                  key={`${option.mediaType}-${option.id}`}
                  onClick={() => {
                    setQuery('');
                    setOptions([]);
                    dispatch(searchMovie(''));
                    history.push(`/${option.mediaType}/${option.id}`);
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%" gap={1.2}>
                    <Box
                      component="img"
                      src={option.posterPath ? `https://image.tmdb.org/t/p/w92${option.posterPath}` : 'https://via.placeholder.com/46x68?text=%20'}
                      alt={option.title}
                      sx={{
                        width: 30,
                        height: 45,
                        borderRadius: 0.7,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.12)',
                        bgcolor: 'rgba(255,255,255,0.06)',
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" width="100%" gap={1.5}>
                      <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {option.title}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.75, flexShrink: 0 }}>
                        {option.mediaType.toUpperCase()}
                        {option.year ? ` - ${option.year}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          ) : (
            !loading && (
              <Typography variant="caption" sx={{ display: 'block', p: 1.5, opacity: 0.8 }}>
                {t('search.noResults')}
              </Typography>
            )
          )}
        </Paper>
      )}
    </div>
  );
};

export default Search;
