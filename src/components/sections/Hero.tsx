import { FC } from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { motion } from 'framer-motion';

// Import các icon cần thiết từ thư viện MUI
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';

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

const Hero: FC = () => {
  const navigate = useNavigate();
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
        <Typography
          variant="h1"
          component="h1"
          className="text-center text-title !font-bold !text-[2.5rem] sm:!text-[3.5rem] !leading-[1.2] text-[#2563eb]"
        >
          Chinh phục TOEIC với
          <br /> {/* Ép xuống dòng ngay sau chữ với */}
          <span className="bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#6366f1] bg-clip-text text-transparent">
            TOEIC Smart
          </span>
        </Typography>
        {/* Keep motion for non-LCP elements to preserve UX polish without delaying title paint. */}
        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 4 }}
          justifyContent="center"
          sx={{ mt: 3, mb: 3 }}
          className="opacity-0 animate-fade-up" // Container cũng có thể animation nếu muốn
          style={{ animationDelay: '0.5s' }}    // DelayChildren: 0.5s
        >
          {keyBenefits.map((benefit, index) => (
            <Stack
              key={benefit.text}
              direction="row"
              alignItems="center"
              spacing={1}
              className="opacity-0 animate-fade-up"
              style={{
                // StaggerChildren: 0.2s mỗi item
                animationDelay: `${0.5 + (index * 0.2)}s`
              }}
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
          <Button
            variant='contained'
            size='large'
            onClick={() => navigate('/overview-test?type=entry-test')}
          >
            Bắt đầu ngay
          </Button>
          <Button variant='outlined' size='large' color='secondary'>
            Xem chương trình học
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default Hero;
