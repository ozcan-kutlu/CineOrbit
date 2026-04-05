import React, { useEffect } from 'react';
import { CssBaseline } from '@mui/material';
import { Route, Switch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import useStyles from './styles';

import Actors from './Actors/Actors';
import MovieInformation from './MovieInformation/MovieInformation';
import TVInformation from './TVInformation/TVInformation';
import Home from './Home/Home';
import Movies from './Movies/Movies';
import NavBar from './NavBar/NavBar';
import Profile from './Profile/Profile';
import Approved from './Approved/Approved';
import VoiceAssistant from './VoiceAssistant/VoiceAssistant';

const HtmlLangSync = () => {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18n.language.startsWith('tr') ? 'tr' : 'en';
  }, [i18n.language]);
  return null;
};

const App = ({ toggleColorMode }) => {
  const classes = useStyles();

  return (

    <div className={classes.root}>
      <HtmlLangSync />
      <CssBaseline />
      <NavBar toggleColorMode={toggleColorMode} />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Switch>
          <Route exact path="/movie/:id">
            <MovieInformation />
          </Route>
          <Route exact path="/tv/:id">
            <TVInformation />
          </Route>
          <Route exact path="/actors/:id">
            <Actors />
          </Route>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/browse">
            <Movies />
          </Route>
          <Route exact path="/profile/:id">
            <Profile />
          </Route>
          <Route exact path="/approved">
            <Approved />
          </Route>
        </Switch>
      </main>
      <VoiceAssistant />
    </div>

  );
};

export default App;
