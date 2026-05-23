import { FC } from "react";
import { Box, Container, SvgIconProps, Typography } from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

type Step = {
  title: string;
  description: string;
  Icon: FC<SvgIconProps>;
  tone?: "blue" | "gold";
};

const BLUE = "#2563eb";
const GOLD = "#f59e0b";
const DARK = "#111827";
const MUTED = "#64748b";

const steps: Step[] = [
  {
    title: "Đánh giá năng lực",
    description: "Test đầu vào chuẩn xác",
    Icon: AssignmentTurnedInOutlinedIcon,
  },
  {
    title: "Lên kế hoạch học tập",
    description: "Xây dựng mục tiêu cụ thể",
    Icon: TrackChangesOutlinedIcon,
  },
  {
    title: "Học tập thông minh",
    description: "Hệ thống bài học đa dạng",
    Icon: AutoAwesomeOutlinedIcon,
  },
  {
    title: "Luyện đề & theo dõi",
    description: "Cải thiện điểm số liên tục",
    Icon: MapOutlinedIcon,
  },
  {
    title: "Đạt điểm mục tiêu",
    description: "Tự tin chinh phục TOEIC",
    Icon: EmojiEventsIcon,
    tone: "gold",
  },
];

const RoadmapTimeline: FC = () => {
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
            Lộ trình học tối ưu
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
            position: "relative",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
              lg: "repeat(5, minmax(0, 1fr))",
            },
            gap: { xs: 2.2, sm: 3, md: 3.6, lg: 2.4, xl: 4 },
            alignItems: "start",
            pt: { lg: 1 },
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            sx={{
              position: "absolute",
              left: "6.6%",
              right: "6.6%",
              top: { lg: 14, xl: 16 },
              width: "86.8%",
              height: { lg: 92, xl: 104 },
              display: { xs: "none", lg: "block" },
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <path
              d="M0 58 C90 24 150 24 240 58 C330 92 390 92 480 58 C570 24 630 24 720 58 C810 92 870 92 960 58 C1050 24 1110 24 1200 58"
              fill="none"
              stroke="rgba(37, 99, 235, 0.16)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </Box>

          {steps.map(({ title, description, Icon, tone }) => {
            const color = tone === "gold" ? GOLD : BLUE;

            return (
              <Box
                key={title}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  minHeight: { xs: 168, sm: 190, lg: 220, xl: 245 },
                  px: { xs: 3, sm: 2.5, lg: 1.5 },
                  py: { xs: 3, sm: 3.5, lg: 0 },
                  borderRadius: { xs: 3, lg: 0 },
                  border: {
                    xs: "1px solid rgba(226, 232, 240, 0.92)",
                    lg: "none",
                  },
                  bgcolor: { xs: "rgba(255,255,255,0.96)", lg: "transparent" },
                  boxShadow: {
                    xs: "0 18px 42px rgba(15, 23, 42, 0.045)",
                    lg: "none",
                  },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 78, sm: 86, lg: 96, xl: 108 },
                    height: { xs: 78, sm: 86, lg: 96, xl: 108 },
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    border: "3px solid rgba(37, 99, 235, 0.08)",
                    color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: { xs: 2.2, lg: 3.2 },
                    boxShadow:
                      "0 14px 34px rgba(37, 99, 235, 0.055), inset 0 1px 0 rgba(255,255,255,0.96)",
                  }}
                >
                  <Icon sx={{ fontSize: { xs: 36, sm: 40, lg: 48, xl: 56 } }} />
                </Box>

                <Typography
                  component="h3"
                  sx={{
                    color: DARK,
                    fontSize: { xs: 16, sm: 17, lg: 17, xl: 19 },
                    fontWeight: 800,
                    lineHeight: 1.35,
                    mb: { xs: 1, xl: 1.2 },
                  }}
                >
                  {title}
                </Typography>

                <Typography
                  sx={{
                    color: MUTED,
                    fontSize: { xs: 14, sm: 14.5, lg: 14, xl: 16 },
                    fontWeight: 600,
                    lineHeight: 1.65,
                  }}
                >
                  {description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default RoadmapTimeline;
