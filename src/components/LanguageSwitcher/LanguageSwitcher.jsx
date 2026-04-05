import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { tmdbApi } from '../../services/TMDB';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();

  const current = i18n.language?.startsWith('tr') ? 'tr' : 'en';

  const handleChange = async (_event, value) => {
    if (value) {
      await i18n.changeLanguage(value);
      dispatch(tmdbApi.util.resetApiState());
    }
  };

  return (
    <Tooltip title={t('nav.language')}>
      <ToggleButtonGroup
        value={current}
        exclusive
        onChange={handleChange}
        size="small"
        aria-label={t('nav.language')}
        sx={{
          ml: 0.5,
          '& .MuiToggleButton-root': {
            color: 'rgba(255,255,255,0.92)',
            borderColor: 'rgba(255,255,255,0.35)',
            px: 1.1,
            py: 0.35,
            fontSize: '0.72rem',
            fontWeight: 700,
            lineHeight: 1.2,
          },
          '& .MuiToggleButton-root.Mui-selected': {
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.22)',
            borderColor: 'rgba(255,255,255,0.55)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
          },
        }}
      >
        <ToggleButton value="en">EN</ToggleButton>
        <ToggleButton value="tr">TR</ToggleButton>
      </ToggleButtonGroup>
    </Tooltip>
  );
};

export default LanguageSwitcher;
