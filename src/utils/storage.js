export const STORAGE_KEYS = {
  SESSION_ID: 'session_id',
  REQUEST_TOKEN: 'request_token',
  ACCOUNT_ID: 'accountId',
  THEME_MODE: 'theme_mode',
};

export const getStorageItem = (key) => localStorage.getItem(key);

export const setStorageItem = (key, value) => localStorage.setItem(key, value);

export const removeStorageItems = (keys) => {
  keys.forEach((key) => localStorage.removeItem(key));
};
