import { FC, lazy, Suspense, useCallback } from "react";
import { Box } from "@mui/material";
import LandingLayout from "../layouts/LandingLayout";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";
import HeroV2 from "../../components/landing-page-v2/HeroV2";
import BenefitsGrid from "../../components/landing-page-v2/BenefitsGrid";
import RoadmapTimeline from "../../components/landing-page-v2/RoadmapTimeline";
import Courses from "../../components/landing-page-v2/Courses";
import TestimonialsV2 from "../../components/landing-page-v2/TestimonialsV2";
import StatsStrip from "../../components/landing-page-v2/StatsStrip";
import FinalCTA from "../../components/landing-page-v2/FinalCTA";

const AnnouncementModal = lazy(
  () => import("../../components/modals/AnnouncementModal"),
);

const LandingPageV2: FC = () => {
  const handleStartNow = useCallback(() => {
    window.location.href = "/overview-test?type=entry-test";
  }, []);

  const handleExploreNow = useCallback(() => {
    const target = document.getElementById("courses");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleFinalCta = useCallback(() => {
    window.location.href = "/login";
  }, []);

  return (
    <LandingLayout>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <HeroV2
          onPrimaryClick={handleStartNow}
          onSecondaryClick={handleExploreNow}
        />
        <BenefitsGrid />
        <RoadmapTimeline />
        <Courses />
        <TestimonialsV2 />
        <StatsStrip />
        <FinalCTA onPrimaryClick={handleFinalCta} />
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

export default LandingPageV2;
