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
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          px: { xs: 1, sm: 3, md: 5 },
          backgroundColor: "#fbfdff",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: { xs: 64, lg: 90 },
              right: { xs: -90, md: -24, xl: 70 },
              width: { xs: 220, md: 260, xl: 310 },
              height: { xs: 220, md: 260, xl: 310 },
              backgroundImage:
                "radial-gradient(circle, rgba(37, 99, 235, 0.22) 1.2px, transparent 1.3px)",
              backgroundSize: "16px 16px",
              opacity: 0.48,
              maskImage: "radial-gradient(circle, black 24%, transparent 72%)",
              WebkitMaskImage:
                "radial-gradient(circle, black 24%, transparent 72%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: { xs: 210, lg: 180 },
              right: { xs: -140, lg: 28 },
              width: { xs: 420, lg: 640 },
              height: { xs: 420, lg: 640 },
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(96, 165, 250, 0.04) 42%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: { xs: 860, lg: 1020 },
              left: { xs: -160, lg: -110 },
              width: { xs: 390, lg: 540 },
              height: { xs: 390, lg: 540 },
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(14, 165, 233, 0.065) 0%, rgba(147, 197, 253, 0.03) 46%, transparent 72%)",
              filter: "blur(6px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: { xs: 1500, lg: 1660 },
              right: { xs: -120, lg: 90 },
              width: { xs: 180, lg: 230 },
              height: { xs: 180, lg: 230 },
              backgroundImage:
                "radial-gradient(circle, rgba(37, 99, 235, 0.18) 1.1px, transparent 1.2px)",
              backgroundSize: "15px 15px",
              opacity: 0.38,
              maskImage: "radial-gradient(circle, black 22%, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(circle, black 22%, transparent 70%)",
            }}
          />
        </Box>

        <Box sx={{ position: "relative", zIndex: 1 }}>
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
