import axios from 'axios';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from './storage';

export const moviesApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.REACT_APP_TMDB_KEY,
  },
});

export const fetchToken = async ({ redirect = true } = {}) => {
  try {
    const { data } = await moviesApi.get('/authentication/token/new');

    const token = data.request_token;
    const redirectUri = process.env.REACT_APP_TMDB_REDIRECT_URL || 'http://localhost:3000/approved';

    if (data.success) {
      setStorageItem(STORAGE_KEYS.REQUEST_TOKEN, token);
      const authUrl = `https://www.themoviedb.org/authenticate/${token}?redirect_to=${encodeURIComponent(redirectUri)}`;

      if (redirect) {
        window.location.href = authUrl;
      }

      return authUrl;
    }
  } catch (error) {
    return null;
  }
  return null;
};

export const createSessionId = async (tokenOverride) => {
  const token = tokenOverride || getStorageItem(STORAGE_KEYS.REQUEST_TOKEN);

  if (token) {
    try {
      const { data: { session_id: sessionId } } = await moviesApi.post('authentication/session/new', {
        request_token: token,
      });

      setStorageItem(STORAGE_KEYS.SESSION_ID, sessionId);

      return sessionId;
    } catch (error) {
      return null;
    }
  }
  return null;
};
