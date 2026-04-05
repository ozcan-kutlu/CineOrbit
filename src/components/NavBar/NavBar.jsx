import React, { useState, useEffect } from 'react';
import { AppBar, IconButton, Toolbar, Drawer, Button, Avatar, useMediaQuery } from '@mui/material';
import { Menu, AccountCircle, Brightness4, Brightness7 } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { setUser, userSelector } from '../../features/auth';
import Sidebar from '../Sidebar/Sidebar';
import Search from '../Search/Search';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { fetchToken, createSessionId, moviesApi } from '../../utils';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../../utils/storage';
import useStyles from './styles';

const NavBar = ({ toggleColorMode }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector(userSelector);
  const [mobileOpen, setMobileOpen] = useState(false);
  const classes = useStyles();
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();

  const token = getStorageItem(STORAGE_KEYS.REQUEST_TOKEN);
  const sessionIdFromLocalStorage = getStorageItem(STORAGE_KEYS.SESSION_ID);
  const handleLogin = async () => {
    await fetchToken();
  };

  useEffect(() => {
    const logInUser = async () => {
      if (!token || location.pathname === '/approved') {
        return;
      }

      try {
        const sessionId = sessionIdFromLocalStorage || await createSessionId();
        if (!sessionId) {
          return;
        }

        const { data: userData } = await moviesApi.get(`/account?session_id=${sessionId}`);
        setStorageItem(STORAGE_KEYS.ACCOUNT_ID, userData.id);
        dispatch(setUser({ ...userData, sessionId }));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      }
    };

    logInUser();
  }, [dispatch, location.pathname, sessionIdFromLocalStorage, token]);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(90deg, #121212 0%, #1e1e1e 100%)'
            : 'linear-gradient(90deg, #b71c1c 0%, #c62828 52%, #d32f2f 100%)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 2px 12px rgba(0,0,0,0.45)'
            : '0 3px 14px rgba(198,40,40,0.35)',
        }}
      >
        <Toolbar className={classes.toolbar}>
          {isMobile && (
            <IconButton color="inherit" edge="start" style={{ outline: 'none' }} onClick={() => setMobileOpen((prevMobileOpen) => !prevMobileOpen)} className={classes.menuButton}>
              <Menu />
            </IconButton>
          )}
          <IconButton color="inherit" sx={{ ml: 1 }} onClick={toggleColorMode}>
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <LanguageSwitcher />
          {!isMobile && <Search />}

          <div>
            {!isAuthenticated ? (
              <Button
                onClick={handleLogin}
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '999px',
                  px: 2,
                  py: 0.7,
                  border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255,255,255,0.25)'
                    : '1px solid rgba(255,235,238,0.7)',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, rgba(255,23,68,0.22), rgba(41,121,255,0.24))'
                    : 'linear-gradient(90deg, rgba(255,235,238,0.24), rgba(255,255,255,0.18))',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 0 10px rgba(255,23,68,0.2)'
                    : '0 0 10px rgba(255,235,238,0.28)',
                  transition: 'all 220ms ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    borderColor: '#fff',
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(90deg, rgba(255,23,68,0.38), rgba(41,121,255,0.36))'
                      : 'linear-gradient(90deg, rgba(255,235,238,0.35), rgba(255,255,255,0.26))',
                  },
                }}
              >
                {t('nav.login')} &nbsp; <AccountCircle />
              </Button>
            ) : (
              <Button
                component={Link}
                to={`/profile/${user.id}`}
                className={classes.linkButton}
                onClick={() => {}}
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '999px',
                  px: 1.4,
                  py: 0.6,
                  border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255,255,255,0.25)'
                    : '1px solid rgba(255,235,238,0.7)',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, rgba(255,23,68,0.18), rgba(41,121,255,0.2))'
                    : 'linear-gradient(90deg, rgba(255,235,238,0.22), rgba(255,255,255,0.16))',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 0 10px rgba(41,121,255,0.2)'
                    : '0 0 10px rgba(255,235,238,0.25)',
                  transition: 'all 220ms ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    borderColor: '#fff',
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(90deg, rgba(255,23,68,0.34), rgba(41,121,255,0.34))'
                      : 'linear-gradient(90deg, rgba(255,235,238,0.34), rgba(255,255,255,0.24))',
                  },
                }}
              >
                {!isMobile && <>{t('nav.myMovies')} &nbsp;</>}
                <Avatar
                  style={{ width: 30, height: 30 }}
                  sx={{
                    border: theme.palette.mode === 'dark'
                      ? '1px solid rgba(144,202,249,0.65)'
                      : '1px solid rgba(255,235,238,0.75)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 0 7px rgba(144,202,249,0.22)'
                      : '0 0 6px rgba(255,235,238,0.28)',
                  }}
                  alt={t('nav.profileAlt')}
                  src="https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
                />
              </Button>
            )}
          </div>
          {isMobile && <Search />}
        </Toolbar>
      </AppBar>
      <div>
        <nav className={classes.drawer}>
          {isMobile ? (
            <Drawer variant="temporary" anchor="right" open={mobileOpen} onClose={() => setMobileOpen((prevMobileOpen) => !prevMobileOpen)} classes={{ paper: classes.drawerPaper }} ModalProps={{ keepMounted: true }}>
              <Sidebar setMobileOpen={setMobileOpen} />
            </Drawer>
          ) : (
            <Drawer classes={{ paper: classes.drawerPaper }} variant="permanent" open>
              <Sidebar setMobileOpen={setMobileOpen} />
            </Drawer>
          )}
        </nav>
      </div>

    </>
  );
};

export default NavBar;
