import { FC } from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { motion } from 'framer-motion';

// Import các icon cần thiết từ thư viện MUI
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// 1. Tách dữ liệu ra để dễ quản lý và cập nhật
const keyBenefits = [
  {
    Icon: CheckCircleOutlineIcon,
    text: 'Hoàn toàn miễn phí',
  },
  {
    Icon: AutoGraphIcon,
    text: 'Lộ trình cá nhân hóa',
  },
  {
    Icon: MenuBookIcon,
    text: 'Kho đề thi chất lượng',
  },
];

// Animation variants cho thanh lợi ích
const benefitsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.5, // Bắt đầu animation sau khi text chính hiện ra
      staggerChildren: 0.2, // Các item con xuất hiện nối đuôi nhau
    },
  },
};

const benefitItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
} as const;

const Hero: FC = () => {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
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
            'radial-gradient(40% 60% at 50% 50%, #fae9e4 0, hsla(13,75%,94%,.775) 10%, hsla(0,0%,100%,0) 100%)',
        },
      }}
    >
      <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant='h2'
            component='h1'
            fontWeight='bold'
            textAlign='center'
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem' },
              color: 'text.primary',
            }}
            className='text-title'
          >
            Chinh phục TOEIC với TOEIC Master
          </Typography>
          {/* 2. Thêm "Thanh Lợi Ích Chính" ở đây */}
          <Stack
            component={motion.div}
            variants={benefitsContainerVariants}
            initial='hidden'
            animate='visible'
            direction='row'
            spacing={{ xs: 2, sm: 4 }}
            justifyContent='center'
            sx={{ mt: 3, mb: 3 }} // Tạo khoảng cách với các nút bấm
          >
            {keyBenefits.map((benefit) => (
              <Stack
                key={benefit.text}
                component={motion.div}
                variants={benefitItemVariants}
                direction='row'
                alignItems='center'
                spacing={1}
              >
                <benefit.Icon
                  sx={{ color: 'success.main', fontSize: '1.25rem' }}
                />
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ fontWeight: 500 }}
                >
                  {benefit.text}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Stack direction='row' spacing={2} justifyContent='center'>
            <Button variant='contained' size='large'>
              Bắt đầu ngay
            </Button>
            <Button variant='outlined' size='large' color='secondary'>
              Xem chương trình học
            </Button>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Hero;
