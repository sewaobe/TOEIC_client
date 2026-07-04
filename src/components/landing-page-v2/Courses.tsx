import { FC } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import CheckIcon from "@mui/icons-material/Check";

const BLUE = "#2563eb";
const DARK = "#111827";
const MUTED = "#64748b";

const courses = [
  {
    level: "Khởi động",
    score: "0 - 350+",
    subtitle: "Dành cho người mới bắt đầu",
    features: [
      "Nắm vững kiến thức nền tảng",
      "Làm quen cấu trúc đề thi TOEIC",
      "Xây dựng thói quen học đều mỗi ngày",
    ],
    image: "/landing-page-images/character-1.webp",
  },
  {
    level: "Củng cố",
    score: "350 - 550+",
    subtitle: "Xây nền vững cho từng phần thi",
    features: [
      "Lấp lỗ hổng ngữ pháp và từ vựng",
      "Củng cố Listening và Reading theo Part",
      "Luyện bài theo điểm yếu được hệ thống phát hiện",
    ],
    image: "/landing-page-images/character-2.webp",
  },
  {
    level: "Tăng tốc",
    score: "550 - 750+",
    subtitle: "Bứt phá lên band điểm cao hơn",
    features: [
      "Tập trung vào dạng bài còn mất điểm",
      "Rèn chiến lược làm bài theo thời gian",
      "Theo dõi tiến độ và điều chỉnh lộ trình",
    ],
    image: "/landing-page-images/character-3.webp",
  },
  {
    level: "Tối ưu",
    score: "750 - 990",
    subtitle: "Hướng đến mục tiêu 850+",
    features: [
      "Luyện đề sát đề thi thật",
      "Tối ưu tốc độ và độ chính xác",
      "Chốt điểm yếu trước ngày thi",
    ],
    image: "/landing-page-images/character-4.webp",
  },
];

const Courses: FC = () => {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "rgba(255, 255, 255, 0.76)",
        py: { xs: 5.5, sm: 6.5, lg: 7, xl: 8 },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1500,
          px: { xs: 2.5, sm: 4, md: 6, lg: 7 },
        }}
      >
        <Box textAlign="center" sx={{ mb: { xs: 3.6, md: 4.8, xl: 5.6 } }}>
          <Typography
            component="h2"
            sx={{
              color: "#151b31",
              fontFamily: "'Montserrat', 'Inter', sans-serif",
              fontSize: { xs: 23, sm: 28, md: 32, lg: 35 },
              fontWeight: 800,
              letterSpacing: 0,
              lineHeight: 1.2,
              textTransform: "uppercase",
              mb: { xs: 2.2, lg: 2.6 },
            }}
          >
            Lộ trình TOEIC cá nhân hóa theo mục tiêu của bạn
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
                  minHeight: { xs: 400, sm: 425, lg: 420, xl: 510 },
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
                        fontSize: { xs: 24, lg: 24, xl: 30 },
                        fontWeight: 750,
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
                        fontSize: { xs: 15.5, lg: 15, xl: 18 },
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
                    decoding="async"
                    fetchPriority="low"
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
                      fontSize: { xs: 14, lg: 13.25, xl: 17 },
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
                            fontSize: { xs: 16, xl: 18 },
                            color: BLUE,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            color: MUTED,
                            fontSize: { xs: 13.5, lg: 13, xl: 15 },
                            fontWeight: 600,
                            lineHeight: 1.55,
                          }}
                        >
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" sx={{ mt: { xs: 4.5, lg: 5.5 } }}>
          <Button
            variant="outlined"
            onClick={() => {
              window.location.href = "/overview-test?type=entry-test";
            }}
            sx={{
              minWidth: { xs: 220, sm: 260 },
              height: { xs: 50, lg: 54 },
              borderRadius: 2,
              px: 4,
              fontWeight: 800,
              fontSize: { xs: 14.5, lg: 15.5 },
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
            Tạo lộ trình cá nhân hóa
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Courses;
