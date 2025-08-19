import { FC } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Container,
  alpha,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface CTAProps {
  onRegister: () => void;
}

const containerVariants = {
  offscreen: { opacity: 0, y: 50 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', bounce: 0.4, duration: 1 },
  },
} as const;

const CTA: FC<CTAProps> = ({ onRegister }) => {
  const theme = useTheme();

  return (
    <Box
      component={motion.section}
      initial='offscreen'
      whileInView='onscreen'
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      sx={{
        bgcolor: 'primary.main',
        py: { xs: 8, md: 12 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          bgcolor: alpha(theme.palette.primary.contrastText, 0.05),
          borderRadius: '50%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          right: -70,
          width: 250,
          height: 250,
          border: `20px solid ${alpha(
            theme.palette.primary.contrastText,
            0.05,
          )}`,
          borderRadius: '50%',
        }}
      />
      <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant='h3'
          component='h2'
          sx={{
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '2.2rem', sm: '2.8rem' },
            color: 'primary.contrastText',
          }}
        >
          Sẵn sàng chinh phục band điểm mơ ước?
        </Typography>
        <Typography
          variant='h6'
          component='p'
          sx={{
            mb: 4,
            fontWeight: 400,
            color: alpha(theme.palette.primary.contrastText, 0.85),
            maxWidth: '700px',
            mx: 'auto',
          }}
        >
          Tài khoản miễn phí đang chờ bạn. Chỉ một cú nhấp chuột để bắt đầu.
        </Typography>
        <Stack direction='row' justifyContent='center'>
          <Button
            variant='contained'
            color='secondary'
            size='large'
            endIcon={<ArrowForwardIcon />}
            onClick={onRegister}
            sx={{
              py: 1.5,
              px: 5,
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'transform 0.2s ease-in-out, background-color 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                backgroundColor: 'secondary.dark',
              },
            }}
          >
            Bắt Đầu Luyện Thi Miễn Phí
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default CTA;
