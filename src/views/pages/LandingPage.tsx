import { FC } from 'react';
import { useLandingViewModel } from '../../viewmodels/useLandingViewModel';
import Hero from '../../components/sections/Hero';
import Benefits from '../../components/sections/Benefits';
import CTA from '../../components/sections/CTA';
import SmartRoadmap from '../../components/sections/SmartRoadmap';
import Testimonials from '../../components/sections/Testimonials';
import { Box } from '@mui/material';
import ScrollToTopButton from '../../components/ScrollToTopButton';
import MainLayout from '../layouts/MainLayout';

const LandingPage: FC = () => {
  const vm = useLandingViewModel();

  const handleRegister = () => {
    console.log('Đăng ký ngay');
  };

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <Hero />
        <SmartRoadmap />
        <Benefits benefits={vm.benefits} />
        <Testimonials />
        <CTA onRegister={handleRegister} />
        <ScrollToTopButton scrollThreshold={1000} />
      </Box>
    </MainLayout>
  );
};

export default LandingPage;
