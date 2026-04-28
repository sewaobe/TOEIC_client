import { FC, lazy, Suspense } from 'react';
import Hero from '../../components/sections/Hero';
import { Box } from '@mui/material';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import LandingLayout from '../layouts/LandingLayout';

const SmartRoadmap = lazy(() => import('../../components/sections/SmartRoadmap'));
const Benefits = lazy(() => import('../../components/sections/Benefits'));
const Testimonials = lazy(() => import('../../components/sections/Testimonials'));
const CTA = lazy(() => import('../../components/sections/CTA'));
const AnnouncementModal = lazy(
  () => import('../../components/modals/AnnouncementModal'),
);

const SectionFallback: FC<{ minHeight: number }> = ({ minHeight }) => (
  <Box sx={{ minHeight }} />
);

const LandingPage: FC = () => {

  return (
    <LandingLayout>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <Hero />
        <Suspense fallback={<SectionFallback minHeight={700} />}>
          <SmartRoadmap />
        </Suspense>
        <Suspense fallback={<SectionFallback minHeight={1200} />}>
          <Benefits />
        </Suspense>
        <Suspense fallback={<SectionFallback minHeight={640} />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <CTA />
        </Suspense>
        <ScrollToTopButton scrollThreshold={1000} />
      </Box>
      {import.meta.env.PROD && (
        <Suspense fallback={null}>
          <AnnouncementModal />
        </Suspense>
      )}
    </LandingLayout>
  );
};

export default LandingPage;
