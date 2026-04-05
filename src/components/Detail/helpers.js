export const createPillButtonSx = (theme) => ({
  borderRadius: '999px',
  px: 1.3,
  py: 0.45,
  fontSize: { xs: '0.72rem', sm: '0.79rem' },
  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(198,40,40,0.5)',
  color: theme.palette.mode === 'dark' ? '#fff' : '#8e1a1a',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(90deg, rgba(255,23,68,0.14), rgba(41,121,255,0.16))'
    : 'linear-gradient(90deg, rgba(255,235,238,0.85), rgba(255,245,245,0.95))',
  transition: 'all 180ms ease',
  '&:hover': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(198,40,40,0.75)',
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(90deg, rgba(255,23,68,0.28), rgba(41,121,255,0.3))'
      : 'linear-gradient(90deg, rgba(255,235,238,1), rgba(255,245,245,1))',
    transform: 'translateY(-1px)',
  },
});
