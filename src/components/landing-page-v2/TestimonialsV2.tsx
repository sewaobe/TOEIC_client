import { FC, useEffect, useRef, useState } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";

const BLUE = "#2563eb";
const DARK = "#111827";
const MUTED = "#64748b";
const STAR = "#fbbf24";

const testimonials = [
  {
    quote:
      "Nhờ lộ trình học rõ ràng và tài liệu chất lượng, mình tăng từ 550 lên 825 chỉ sau 3 tháng. Cảm ơn Toeic Smart rất nhiều!",
    name: "Minh Anh",
    result: "Đạt 825 TOEIC",
    avatar: "/landing-page-images/character-2.webp",
  },
  {
    quote:
      "Giảng viên hỗ trợ rất nhiệt tình, giải thích dễ hiểu. Học có đâu cũng tiện, mình tranh thủ mọi lúc mọi nơi.",
    name: "Quốc Bảo",
    result: "Đạt 750 TOEIC",
    avatar: "/landing-page-images/character-1.webp",
  },
  {
    quote:
      "Đề thi sát thực tế, luyện nhiều nên khi thi không bị bất ngờ. Highly recommend!",
    name: "Thảo Vy",
    result: "Đạt 905 TOEIC",
    avatar: "/landing-page-images/character-4.webp",
  },
];

const testimonialGroups = [testimonials, testimonials];

const TestimonialsV2: FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;

    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setShouldAnimate(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldAnimate(true);
        observer.disconnect();
      },
      { rootMargin: "120px 0px", threshold: 0.12 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={sectionRef}
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "#fff",
        pt: { xs: 7, sm: 8, lg: 9, xl: 10 },
        pb: { xs: 4.5, lg: 5.5 },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1500,
          px: { xs: 2.5, sm: 4, md: 6, lg: 7 },
        }}
      >
        <Box textAlign="center" sx={{ mb: { xs: 4.5, md: 6, xl: 7 } }}>
          <Typography
            component="h2"
            sx={{
              color: "#151b31",
              fontFamily: "'Montserrat', 'Inter', sans-serif",
              fontSize: { xs: 24, sm: 30, md: 34, lg: 38 },
              fontWeight: 800,
              letterSpacing: 0,
              lineHeight: 1.2,
              textTransform: "uppercase",
              mb: { xs: 2.2, lg: 2.6 },
            }}
          >
            Học viên nói gì về TOEIC Smart
          </Typography>
          <Box
            sx={{
              width: { xs: 48, md: 58 },
              height: 4,
              bgcolor: BLUE,
              mx: "auto",
              borderRadius: 999,
              boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28)",
            }}
          />
        </Box>

        <Box
          sx={{
            overflow: "hidden",
            mx: { xs: -2.5, sm: -4, md: -6, lg: -7 },
            px: { xs: 2.5, sm: 4, md: 6, lg: 7 },
            maskImage:
              "linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "max-content",
              animation: shouldAnimate
                ? "testimonialsMarquee 28s linear infinite"
                : "none",
              willChange: "transform",
              "&:hover": {
                animationPlayState: "paused",
              },
              "@keyframes testimonialsMarquee": {
                "0%": { transform: "translateX(0)" },
                "100%": { transform: "translateX(-50%)" },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
                transform: "none",
              },
            }}
          >
            {testimonialGroups.map((group, groupIndex) => (
              <Box
                key={groupIndex}
                sx={{
                  display: "flex",
                  gap: { xs: 2.5, md: 3.4, xl: 4 },
                  pr: { xs: 2.5, md: 3.4, xl: 4 },
                }}
                aria-hidden={groupIndex === 1 ? true : undefined}
              >
                {group.map((item) => (
                  <Box
                    key={`${item.name}-${groupIndex}`}
                    sx={{
                      flex: "0 0 auto",
                      width: {
                        xs: "min(78vw, 300px)",
                        sm: 320,
                        md: 360,
                        xl: 400,
                      },
                      minHeight: { xs: 260, md: 285, xl: 315 },
                      p: { xs: 2.8, sm: 3.2, lg: 3.6, xl: 4.2 },
                      borderRadius: 3,
                      bgcolor: "#fff",
                      border: "1px solid rgba(226, 232, 240, 0.92)",
                      boxShadow:
                        "0 22px 58px rgba(15, 23, 42, 0.045), inset 0 1px 0 rgba(255,255,255,0.95)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <FormatQuoteRoundedIcon
                      sx={{
                        color: BLUE,
                        fontSize: { xs: 36, lg: 42, xl: 50 },
                        lineHeight: 1,
                        mb: { xs: 1.2, xl: 1.5 },
                      }}
                    />

                    <Typography
                      sx={{
                        color: "#40506a",
                        fontSize: { xs: 14.5, lg: 15, xl: 17 },
                        fontWeight: 700,
                        lineHeight: { xs: 1.75, xl: 1.85 },
                        mb: { xs: 2.4, xl: 3.2 },
                        flex: 1,
                      }}
                    >
                      {item.quote}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.7}
                      sx={{ mb: { xs: 2.4, xl: 3.2 } }}
                    >
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <StarIcon
                          key={idx}
                          sx={{ color: STAR, fontSize: { xs: 19, xl: 23 } }}
                        />
                      ))}
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        component="img"
                        src={item.avatar}
                        alt={item.name}
                        loading="lazy"
                        sx={{
                          width: { xs: 46, xl: 54 },
                          height: { xs: 46, xl: 54 },
                          borderRadius: "50%",
                          objectFit: "cover",
                          objectPosition: "top center",
                          bgcolor: "#edf4ff",
                          border: "3px solid #fff",
                          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
                        }}
                      />
                      <Box>
                        <Typography
                          sx={{
                            color: DARK,
                            fontSize: { xs: 16, xl: 18 },
                            fontWeight: 800,
                            lineHeight: 1.25,
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: MUTED,
                            fontSize: { xs: 13, xl: 14.5 },
                            fontWeight: 700,
                            mt: 0.5,
                          }}
                        >
                          {item.result}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2.2}
          sx={{ mt: { xs: 3.8, xl: 4.5 } }}
        >
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#dbe5f5" }} />
          <Box
            sx={{
              width: 34,
              height: 10,
              borderRadius: 999,
              bgcolor: BLUE,
              boxShadow: "0 6px 16px rgba(37, 99, 235, 0.32)",
            }}
          />
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#dbe5f5" }} />
        </Stack>
      </Container>
    </Box>
  );
};

export default TestimonialsV2;
