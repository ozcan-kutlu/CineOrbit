import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { setUser } from '../../features/auth';
import { createSessionId, moviesApi } from '../../utils';
import { STORAGE_KEYS, setStorageItem } from '../../utils/storage';

const Approved = () => {
  const { t } = useTranslation();
  const [errorKey, setErrorKey] = useState('');
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const completeAuth = async () => {
      const query = new URLSearchParams(location.search);
      const approved = query.get('approved');
      const requestToken = query.get('request_token');

      if (requestToken) {
        setStorageItem(STORAGE_KEYS.REQUEST_TOKEN, requestToken);
      }

      if (approved === 'false') {
        setErrorKey('cancelled');
        return;
      }

      if (!requestToken) {
        setErrorKey('noToken');
        return;
      }

      const sessionId = await createSessionId(requestToken);

      if (!sessionId) {
        setErrorKey('sessionFail');
        return;
      }

      try {
        const { data: userData } = await moviesApi.get(`/account?session_id=${sessionId}`);
        setStorageItem(STORAGE_KEYS.ACCOUNT_ID, userData.id);
        dispatch(setUser({ ...userData, sessionId }));
        window.location.href = '/';
      } catch (e) {
        setErrorKey('accountFail');
      }
    };

    completeAuth();
  }, [dispatch, location.search]);

  if (errorKey) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh" gap={2}>
        <Typography variant="h5">{t(`approved.${errorKey}`)}</Typography>
        <Button component={Link} to="/" variant="contained" color="primary">
          {t('approved.goHome')}
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh" gap={2}>
      <CircularProgress />
      <Typography variant="h6">{t('approved.completing')}</Typography>
    </Box>
  );
};

export default Approved;
