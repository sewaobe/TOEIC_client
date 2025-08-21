import { FC, lazy, Suspense, useEffect, useState } from 'react';
import { Box, Typography, Container, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
const LazyLottieAnimation = lazy(() => import('../LottieAnimation.tsx'));

const DelayedLottie = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      // trì hoãn tới khi browser rảnh
      (window as any).requestIdleCallback(() => setShouldLoad(true));
    } else {
      // fallback nếu trình duyệt không hỗ trợ
      setTimeout(() => setShouldLoad(true), 2000);
    }
  }, []);

  return shouldLoad ? (
    <Suspense fallback={<div>Loading animation...</div>}>
      <LazyLottieAnimation />
    </Suspense>
  ) : null;
};

const SmartRoadmap: FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        color: 'text.primary',
        py: { xs: 8, md: 12 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '766px',
          height: '80%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          background:
            'radial-gradient(40% 60% at 50% 50%, #fae9e4 0, hsla(13,75%,94%,.3) 10%, hsla(0,0%,100%,0) 100%)',
        },
      }}
    >
      <Container maxWidth='lg'>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Typography
            variant='h3'
            component='h2'
            fontWeight='bold'
            sx={{ mb: 2 }}
            className='text-title'
          >
            Lộ Trình Của Bạn Bắt Đầu Từ Đây
          </Typography>
          <Typography
            variant='h6'
            sx={{
              mb: 6,
              maxWidth: '700px',
              mx: 'auto',
              color: alpha(theme.palette.text.primary, 0.7),
            }}
          >
            Hệ thống phân tích điểm yếu và tự động xây dựng một con đường học
            tập hiệu quả nhất dành riêng cho bạn.
          </Typography>
          <div className='h-[594px]'>
            <DelayedLottie />
          </div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SmartRoadmap;
