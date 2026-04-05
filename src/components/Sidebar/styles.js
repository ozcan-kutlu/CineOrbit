import { makeStyles } from '@mui/styles';

export default makeStyles((theme) => ({
  container: {
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  imageLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px',
    paddingTop: '16px',
    paddingBottom: '4px',
  },
  image: {
    width: '100%',
  },
  links: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
  },
  categoryTabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    margin: '6px 0 10px',
  },
  categoryButton: {
    borderRadius: '999px !important',
    border: '1px solid',
    textTransform: 'none !important',
    fontWeight: '700 !important',
    fontSize: '0.8rem !important',
    padding: '6px 10px !important',
    transition: 'all 180ms ease !important',
    '&:hover': {
      transform: 'translateY(-1px)',
    },
  },
  listItem: {
    borderRadius: '10px',
    margin: '2px 8px',
    transition: 'background-color 180ms ease',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(198,40,40,0.08)',
    },
  },
  genreImages: {
    filter: theme.palette.mode === 'dark'
      ? 'brightness(0) invert(1)'
      : 'brightness(0) saturate(100%)',
    opacity: theme.palette.mode === 'dark' ? 0.92 : 0.86,
  },
}));
