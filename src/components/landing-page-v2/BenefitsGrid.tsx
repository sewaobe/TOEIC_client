import { FC } from "react";
import { Box, Container, SvgIconProps, Typography } from "@mui/material";
import PsychologyAltOutlinedIcon from "@mui/icons-material/PsychologyAltOutlined";
import GpsFixedOutlinedIcon from "@mui/icons-material/GpsFixedOutlined";
import HeadphonesOutlinedIcon from "@mui/icons-material/HeadphonesOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";

type Benefit = {
  title: string;
  description: string;
  Icon: FC<SvgIconProps>;
};

const BLUE = "#2563eb";
const DARK = "#111827";
const MUTED = "#64748b";

const benefits: Benefit[] = [
  {
    title: "AI cá nhân hóa",
    description: "Lộ trình được thiết kế riêng theo mục tiêu và năng lực của bạn",
    Icon: PsychologyAltOutlinedIcon,
  },
  {
    title: "Bám sát đề thi thật",
    description: "Nội dung chuẩn ETS, cập nhật liên tục",
    Icon: GpsFixedOutlinedIcon,
  },
  {
    title: "Phân tích chi tiết",
    description: "Báo cáo tiến độ và điểm yếu rõ ràng",
    Icon: HeadphonesOutlinedIcon,
  },
  {
    title: "Luyện mọi kỹ năng",
    description: "Listening, Reading, Speaking, Writing",
    Icon: ForumOutlinedIcon,
  },
  {
    title: "Tiết kiệm thời gian",
    description: "Học tập linh hoạt, hiệu quả tối đa",
    Icon: TimerOutlinedIcon,
  },
];

const BenefitsGrid: FC = () => {
  return (
    <Box
      component="section"
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
        <Box textAlign="center" sx={{ mb: { xs: 4, sm: 5, lg: 6 } }}>
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
            Học thông minh – Hiệu quả tối ưu
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
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
            gap: { xs: 2.2, sm: 2.6, lg: 3, xl: 3.4 },
            alignItems: "stretch",
          }}
        >
          {benefits.map(({ title, description, Icon }) => (
            <Box
              key={title}
              sx={{
                minHeight: { xs: 230, sm: 260, lg: 300, xl: 330 },
                px: { xs: 3, sm: 3.4, lg: 3.2, xl: 4 },
                py: { xs: 4, sm: 4.6, lg: 5, xl: 5.6 },
                borderRadius: 3,
                bgcolor: "rgba(255, 255, 255, 0.94)",
                border: "1px solid rgba(226, 232, 240, 0.92)",
                boxShadow:
                  "0 20px 56px rgba(15, 23, 42, 0.045), inset 0 1px 0 rgba(255,255,255,0.95)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                transition:
                  "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                "&:hover": {
                  transform: { md: "translateY(-4px)" },
                  borderColor: "rgba(37, 99, 235, 0.22)",
                  boxShadow: "0 26px 66px rgba(37, 99, 235, 0.09)",
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 78, sm: 86, lg: 92, xl: 104 },
                  height: { xs: 78, sm: 86, lg: 92, xl: 104 },
                  borderRadius: "50%",
                  border: "3px solid rgba(37, 99, 235, 0.08)",
                  bgcolor: "rgba(248, 251, 255, 0.78)",
                  color: BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: { xs: 2.7, lg: 3.2 },
                }}
              >
                <Icon
                  sx={{
                    fontSize: { xs: 38, sm: 42, lg: 46, xl: 52 },
                    strokeWidth: 1.4,
                  }}
                />
              </Box>

              <Typography
                component="h3"
                sx={{
                  color: DARK,
                  fontSize: { xs: 17, sm: 18, lg: 18, xl: 20 },
                  fontWeight: 800,
                  lineHeight: 1.35,
                  mb: { xs: 1.7, lg: 2 },
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  color: MUTED,
                  fontSize: { xs: 15, sm: 15.5, lg: 15, xl: 17 },
                  fontWeight: 600,
                  lineHeight: { xs: 1.8, lg: 1.85 },
                  maxWidth: { xs: 270, sm: 220, lg: 190, xl: 230 },
                }}
              >
                {description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default BenefitsGrid;
