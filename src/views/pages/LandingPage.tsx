import { FC, lazy, Suspense, useEffect, useState } from 'react';
import Hero from '../../components/sections/Hero';
import { Box } from '@mui/material';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import LandingLayout from '../layouts/LandingLayout';
import { benefits } from '../../models/Benefit';

const SmartRoadmap = lazy(() => import('../../components/sections/SmartRoadmap'));
const Benefits = lazy(() => import('../../components/sections/Benefits'));
const Testimonials = lazy(() => import('../../components/sections/Testimonials'));
const CTA = lazy(() => import('../../components/sections/CTA'));
const AnnouncementModal = lazy(
  () => import('../../components/modals/AnnouncementModal'),
);

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const SectionFallback: FC<{ minHeight: number }> = ({ minHeight }) => (
  <Box sx={{ minHeight }} />
);

const LandingPage: FC = () => {
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD) {
      return;
    }

    const idleWindow = window as IdleWindow;
    let timeoutId: number | null = null;
    let idleHandle: number | null = null;

    const openAnnouncement = () => {
      setIsAnnouncementOpen(true);
    };

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(openAnnouncement, {
        timeout: 2500,
      });
    } else {
      timeoutId = window.setTimeout(openAnnouncement, 1200);
    }

    return () => {
      if (idleHandle !== null && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <LandingLayout>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <Hero />
        <Suspense fallback={<SectionFallback minHeight={700} />}>
          <SmartRoadmap />
        </Suspense>
        <Suspense fallback={<SectionFallback minHeight={1200} />}>
          <Benefits benefits={benefits} />
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
          <AnnouncementModal
            open={isAnnouncementOpen}
            onClose={() => setIsAnnouncementOpen(false)}
          />
        </Suspense>
      )}
    </LandingLayout>
  );
};

export default LandingPage;
