import { FC } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";

const BLUE = "#2563eb";
const DARK = "#111827";
const MUTED = "#64748b";

const courses = [
  {
    level: "Starter",
    score: "0 - 350+",
    subtitle: "Dành cho người mới bắt đầu",
    features: [
      "Nắm vững kiến thức nền tảng",
      "Làm quen với cấu trúc đề thi",
      "Xây dựng thói quen học tập",
    ],
    image: "/landing-page-images/character-1.webp",
  },
  {
    level: "500+",
    score: "350 - 550+",
    subtitle: "Xây dựng nền tảng vững chắc",
    features: [
      "Tăng tốc từ 350 - 550+",
      "Củng cố cả 4 kỹ năng",
      "Luyện đề theo từng Part",
    ],
    image: "/landing-page-images/character-2.webp",
  },
  {
    level: "700+",
    score: "550 - 750+",
    subtitle: "Bứt phá chinh phục 700+",
    features: [
      "Nâng cao kỹ năng",
      "Chiến lược làm bài hiệu quả",
      "Đạt mục tiêu 700+",
    ],
    image: "/landing-page-images/character-3.webp",
  },
  {
    level: "850+",
    score: "750 - 990",
    subtitle: "Hướng đến điểm số cao nhất",
    features: [
      "Luyện đề sát đề thi thật",
      "Tối ưu thời gian làm bài",
      "Đạt mục tiêu 850 - 990",
    ],
    image: "/landing-page-images/character-4.webp",
  },
];

const Courses: FC = () => {
  return (
    <Box
      component="section"
      id="courses"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "#fff",
        py: { xs: 7, sm: 8, lg: 9, xl: 10 },
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
            Khóa học phù hợp với bạn
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

        <Grid container spacing={{ xs: 2.6, sm: 3, lg: 3.2, xl: 3.6 }}>
          {courses.map((course) => (
            <Grid key={course.level} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box
                sx={{
                  height: "100%",
                  minHeight: { xs: 430, sm: 455, lg: 470, xl: 520 },
                  borderRadius: 3,
                  bgcolor: "#fff",
                  border: "1px solid rgba(226, 232, 240, 0.92)",
                  boxShadow:
                    "0 20px 56px rgba(15, 23, 42, 0.045), inset 0 1px 0 rgba(255,255,255,0.95)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition:
                    "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                  "&:hover": {
                    transform: { md: "translateY(-4px)" },
                    borderColor: "rgba(37, 99, 235, 0.22)",
                    boxShadow: "0 28px 70px rgba(37, 99, 235, 0.1)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 210, sm: 230, lg: 225, xl: 270 },
                    flexShrink: 0,
                    overflow: "hidden",
                    background:
                      "linear-gradient(135deg, #f5f9ff 0%, #eaf2ff 100%)",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: { xs: 26, xl: 34 },
                      left: { xs: 24, xl: 32 },
                      zIndex: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        color: BLUE,
                        fontFamily: "'Montserrat', 'Inter', sans-serif",
                        fontSize: { xs: 28, lg: 27, xl: 34 },
                        fontWeight: 800,
                        lineHeight: 1.08,
                        mb: { xs: 1.5, xl: 2 },
                      }}
                    >
                      TOEIC
                      <br />
                      {course.level}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#26334d",
                        fontSize: { xs: 17, lg: 16, xl: 20 },
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {course.score}
                    </Typography>
                  </Box>

                  <Box
                    component="img"
                    src={course.image}
                    alt={`TOEIC ${course.level}`}
                    loading="lazy"
                    sx={{
                      position: "absolute",
                      right: { xs: -10, lg: -18, xl: -12 },
                      bottom: { xs: -58, sm: -66, lg: -60, xl: -78 },
                      width: { xs: "62%", sm: "65%", lg: "68%", xl: "66%" },
                      height: "auto",
                      maxHeight: "170%",
                      objectFit: "contain",
                      objectPosition: "bottom right",
                      mixBlendMode: "multiply",
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    px: { xs: 3, lg: 2.8, xl: 3.8 },
                    py: { xs: 3, lg: 2.8, xl: 3.8 },
                  }}
                >
                  <Typography
                    sx={{
                      color: DARK,
                      fontSize: { xs: 16, lg: 15, xl: 18 },
                      fontWeight: 800,
                      lineHeight: 1.45,
                      mb: { xs: 2.1, xl: 2.4 },
                    }}
                  >
                    {course.subtitle}
                  </Typography>

                  <Stack spacing={{ xs: 1.35, xl: 1.65 }} sx={{ flex: 1 }}>
                    {course.features.map((item) => (
                      <Stack
                        key={item}
                        direction="row"
                        spacing={{ xs: 1.1, xl: 1.3 }}
                        alignItems="flex-start"
                      >
                        <CheckIcon
                          sx={{
                            mt: "2px",
                            fontSize: { xs: 17, xl: 19 },
                            color: BLUE,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            color: MUTED,
                            fontSize: { xs: 14, lg: 13.5, xl: 16 },
                            fontWeight: 600,
                            lineHeight: 1.55,
                          }}
                        >
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button
                    variant="outlined"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 17 }} />}
                    fullWidth
                    sx={{
                      mt: { xs: 3, xl: 3.5 },
                      height: { xs: 48, xl: 54 },
                      borderRadius: 2,
                      borderColor: "rgba(37, 99, 235, 0.16)",
                      bgcolor: "rgba(248, 250, 252, 0.78)",
                      color: BLUE,
                      fontWeight: 800,
                      fontSize: { xs: 15, lg: 14.5, xl: 17 },
                      textTransform: "none",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                      "&:hover": {
                        borderColor: "rgba(37, 99, 235, 0.36)",
                        bgcolor: "rgba(37, 99, 235, 0.04)",
                      },
                    }}
                  >
                    Tìm hiểu thêm
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" sx={{ mt: { xs: 4.5, lg: 5.5 } }}>
          <Button
            variant="outlined"
            sx={{
              minWidth: { xs: 220, sm: 260 },
              height: { xs: 50, lg: 54 },
              borderRadius: 2,
              px: 4,
              fontWeight: 800,
              fontSize: { xs: 15, lg: 16 },
              textTransform: "none",
              borderColor: "rgba(37, 99, 235, 0.38)",
              color: BLUE,
              bgcolor: "#fff",
              boxShadow: "0 8px 22px rgba(37, 99, 235, 0.05)",
              "&:hover": {
                borderColor: BLUE,
                bgcolor: "rgba(37, 99, 235, 0.04)",
              },
            }}
          >
            Xem tất cả khóa học
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Courses;
