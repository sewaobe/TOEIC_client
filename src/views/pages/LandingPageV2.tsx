import {
  FC,
  ReactNode,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box } from "@mui/material";
import LandingLayout from "../layouts/LandingLayout";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";
import HeroV2 from "../../components/landing-page-v2/HeroV2";

const BenefitsGrid = lazy(
  () => import("../../components/landing-page-v2/BenefitsGrid"),
);
const RoadmapTimeline = lazy(
  () => import("../../components/landing-page-v2/RoadmapTimeline"),
);
const Courses = lazy(() => import("../../components/landing-page-v2/Courses"));
const TestimonialsV2 = lazy(
  () => import("../../components/landing-page-v2/TestimonialsV2"),
);
const StatsStrip = lazy(
  () => import("../../components/landing-page-v2/StatsStrip"),
);
const FinalCTA = lazy(
  () => import("../../components/landing-page-v2/FinalCTA"),
);

const AnnouncementModal = lazy(
  () => import("../../components/modals/AnnouncementModal"),
);

const SectionFallback: FC<{ minHeight: number }> = ({ minHeight }) => (
  <Box sx={{ minHeight }} />
);

interface LazySectionProps {
  children: ReactNode;
  id?: string;
  minHeight: number;
}

const LazySection: FC<LazySectionProps> = ({ children, id, minHeight }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: "900px 0px", threshold: 0.01 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Box id={id} ref={containerRef} sx={{ minHeight: shouldRender ? 0 : minHeight }}>
      {shouldRender ? (
        <Suspense fallback={<SectionFallback minHeight={minHeight} />}>
          {children}
        </Suspense>
      ) : null}
    </Box>
  );
};

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
          <LazySection minHeight={620}>
            <BenefitsGrid />
          </LazySection>
          <LazySection minHeight={520}>
            <RoadmapTimeline />
          </LazySection>
          <LazySection id="courses" minHeight={560}>
            <Courses />
          </LazySection>
          <LazySection minHeight={440}>
            <TestimonialsV2 />
          </LazySection>
          <LazySection minHeight={240}>
            <StatsStrip />
          </LazySection>
          <LazySection minHeight={360}>
            <FinalCTA onPrimaryClick={handleFinalCta} />
          </LazySection>
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
