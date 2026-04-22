import {
  Box,
  CircularProgress,
  Fade,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';

interface RouteLoadingFallbackProps {
  message?: string;
  delayMs?: number;
}

const RouteLoadingFallback = ({
  message = 'Loading...',
  delayMs = 220,
}: RouteLoadingFallbackProps) => {
  const [visible, setVisible] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) {
      setVisible(true);
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!visible) {
    return null;
  }

  return (
    <Fade in timeout={180}>
      <Box
        role='status'
        aria-live='polite'
        aria-busy='true'
        sx={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          px: 2,
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.92),
          backgroundImage: (theme) =>
            `radial-gradient(circle at 20% 15%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 45%), radial-gradient(circle at 80% 0%, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 35%)`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <CircularProgress size={36} thickness={4.5} aria-label={message} />
          <Typography
            variant='body1'
            fontWeight={600}
            color='text.secondary'
            sx={{ fontSize: { xs: '1rem', sm: '1.05rem' } }}
          >
            {message}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default RouteLoadingFallback;