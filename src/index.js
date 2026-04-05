import './i18n/config';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';

import App from './components/App';
import store from './app/store';

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const Root = () => {
  const [mode, setMode] = React.useState(localStorage.getItem('theme_mode') || 'light');

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme_mode', nextMode);
          return nextMode;
        });
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () => createTheme({
      palette: {
        mode,
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarWidth: 'thin',
              scrollbarColor: mode === 'dark' ? '#6d6d6d transparent' : '#c62828 transparent',
            },
            '*::-webkit-scrollbar': {
              width: '10px',
              height: '10px',
            },
            '*::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '*::-webkit-scrollbar-thumb': {
              borderRadius: '999px',
              border: mode === 'dark' ? '2px solid rgba(0,0,0,0.15)' : '2px solid rgba(255,255,255,0.35)',
              background: mode === 'dark'
                ? 'linear-gradient(180deg, rgba(255,23,68,0.85), rgba(41,121,255,0.9))'
                : 'linear-gradient(180deg, rgba(198,40,40,0.9), rgba(255,138,101,0.85))',
              boxShadow: mode === 'dark'
                ? '0 0 8px rgba(41,121,255,0.35), 0 0 12px rgba(255,23,68,0.2)'
                : '0 0 6px rgba(198,40,40,0.25)',
            },
            '*::-webkit-scrollbar-thumb:hover': {
              background: mode === 'dark'
                ? 'linear-gradient(180deg, rgba(255,23,68,1), rgba(41,121,255,1))'
                : 'linear-gradient(180deg, rgba(183,28,28,0.96), rgba(255,112,67,0.9))',
            },
          },
        },
      },
    }),
    [mode],
  );

  return (
    <Provider store={store}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <App toggleColorMode={colorMode.toggleColorMode} />
          </BrowserRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Provider>
  );
};

// eslint-disable-next-line react/no-deprecated
ReactDOM.render(
  <Root />,

  document.getElementById('root'),
);
