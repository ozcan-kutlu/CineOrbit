import React, {
  useMemo, useRef, useState, useEffect, useCallback,
} from 'react';
import {
  Fab,
  Paper,
  Typography,
  Box,
  TextField,
  IconButton,
  Stack,
} from '@mui/material';
import { Mic, SmartToy, Send, Chat } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { searchMovie, selectGenreOrCategory } from '../../features/currentGenreOrCategory';
import { useGetGenresQuery } from '../../services/TMDB';

const VoiceAssistant = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const { data: genresData } = useGetGenresQuery();
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([{ role: 'assistant', text: t('voice.welcome') }]);
  }, [t, i18n.language]);

  const genreMap = useMemo(() => {
    const map = {};
    (genresData?.genres || []).forEach((genre) => {
      map[genre.name.toLowerCase()] = genre.id;
    });
    return map;
  }, [genresData]);

  const pushMessage = useCallback((role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  }, []);

  const extractQuery = useCallback((text) => {
    let s = text.toLowerCase().replace(/[.,!?]/g, ' ');
    if (i18n.language.startsWith('tr')) {
      s = s.replace(/\b(lutfen|lütfen|film|filmi|dizi|diziyi|ara|arat|bul|ac|aç|izle)\b/g, ' ');
    } else {
      s = s.replace(/\b(please|movie|movies|film|films|tv|show|shows|series|search|find|open|watch|for)\b/g, ' ');
    }
    return s.replace(/\s+/g, ' ').trim();
  }, [i18n.language]);

  const handleIntent = useCallback((rawText) => {
    const text = rawText.toLowerCase();
    const tr = i18n.language.startsWith('tr');

    const hasPopular = text.includes('popular') || text.includes('popüler');
    const hasTrending = text.includes('trending');
    const hasTv = text.includes('tv') || text.includes('dizi') || text.includes('series');

    if (hasPopular && hasTv) {
      dispatch(selectGenreOrCategory('tv/popular'));
      history.push('/browse');
      return t('voice.openedPopularTv');
    }

    if (hasPopular || hasTrending) {
      dispatch(selectGenreOrCategory('all/trending'));
      history.push('/browse');
      return t('voice.openedTrending');
    }

    if (text.includes('top rated') || text.includes('best rated') || (tr && text.includes('en iyi'))) {
      dispatch(selectGenreOrCategory('movie/top_rated'));
      history.push('/browse');
      return t('voice.openedTopRated');
    }

    if (text.includes('upcoming') || (tr && (text.includes('yakında') || text.includes('yakinda')))) {
      dispatch(selectGenreOrCategory('movie/upcoming'));
      history.push('/browse');
      return t('voice.openedUpcoming');
    }

    if (text.includes('tv show') || text.includes('tv series') || /\btv\b/.test(text) || (tr && text.includes('dizi'))) {
      dispatch(selectGenreOrCategory('tv/popular'));
      history.push('/browse');
      return t('voice.openedPopularTv');
    }

    if (text.includes('anime')) {
      dispatch(selectGenreOrCategory('anime'));
      history.push('/browse');
      return t('voice.openedAnime');
    }

    const matchedGenreName = Object.keys(genreMap).find((name) => text.includes(name));
    if (matchedGenreName) {
      dispatch(selectGenreOrCategory(genreMap[matchedGenreName]));
      history.push('/browse');
      return t('voice.openedGenre', { name: matchedGenreName });
    }

    const query = extractQuery(rawText);
    if (query) {
      dispatch(searchMovie(query));
      history.push('/browse');
      return t('voice.searching', { query });
    }

    return t('voice.fallback');
  }, [dispatch, extractQuery, genreMap, history, i18n.language, t]);

  const handleChatSubmit = () => {
    const text = input.trim();
    if (!text) return;
    pushMessage('user', text);
    setInput('');
    const response = handleIntent(text);
    pushMessage('assistant', response);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      pushMessage('assistant', t('voice.noSpeechApi'));
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language.startsWith('tr') ? 'tr-TR' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      pushMessage('assistant', t('voice.listening'));
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      pushMessage('user', transcript);
      const response = handleIntent(transcript);
      pushMessage('assistant', response);
    };

    recognition.onerror = () => {
      pushMessage('assistant', t('voice.speechError'));
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      {chatOpen && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            right: 24,
            bottom: 96,
            zIndex: 1400,
            width: 340,
            maxWidth: '90vw',
            borderRadius: 2,
            p: 1.5,
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <SmartToy fontSize="small" />
            <Typography variant="subtitle2">{t('voice.title')}</Typography>
          </Box>
          <Stack spacing={1} sx={{ maxHeight: 260, overflowY: 'auto', mb: 1 }}>
            {messages.map((msg, idx) => (
              <Paper
                key={`${msg.role}-${idx}`}
                variant="outlined"
                sx={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  px: 1,
                  py: 0.5,
                  maxWidth: '88%',
                }}
              >
                <Typography variant="caption">{msg.text}</Typography>
              </Paper>
            ))}
          </Stack>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              size="small"
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('voice.placeholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleChatSubmit();
              }}
            />
            <IconButton color="primary" onClick={handleChatSubmit}>
              <Send />
            </IconButton>
            <IconButton color={listening ? 'secondary' : 'primary'} onClick={startListening}>
              <Mic />
            </IconButton>
          </Box>
        </Paper>
      )}

      <Fab
        color={chatOpen ? 'secondary' : 'primary'}
        aria-label="assistant-chat"
        onClick={() => setChatOpen((prev) => !prev)}
        sx={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 1500,
        }}
      >
        <Chat />
      </Fab>
    </>
  );
};

export default VoiceAssistant;
