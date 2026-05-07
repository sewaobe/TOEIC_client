import { FC } from "react";
import { Box, Container, SvgIconProps, Typography } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

type Stat = {
  label: string;
  value: string;
  Icon: FC<SvgIconProps>;
};

const BLUE = "#2563eb";
const DARK = "#111827";

const stats: Stat[] = [
  {
    label: "Học viên đã tin tưởng",
    value: "50.000+",
    Icon: PeopleAltOutlinedIcon,
  },
  {
    label: "Đánh giá trung bình",
    value: "4.8/5",
    Icon: StarBorderRoundedIcon,
  },
  {
    label: "Học viên cải thiện điểm số",
    value: "95%",
    Icon: RateReviewOutlinedIcon,
  },
  {
    label: "Đề thi & bài học chất lượng",
    value: "500+",
    Icon: MenuBookOutlinedIcon,
  },
];

const StatsStrip: FC = () => {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#fff",
        pt: { xs: 2, lg: 3 },
        pb: { xs: 7, sm: 8, lg: 9, xl: 10 },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1500,
          px: { xs: 2.5, sm: 4, md: 6, lg: 7 },
        }}
      >
        <Box
          sx={{
            borderRadius: { xs: 3, lg: 4 },
            bgcolor: "#f4f7ff",
            px: { xs: 2.5, sm: 4, lg: 5, xl: 6.5 },
            py: { xs: 3, sm: 4, lg: 4.2, xl: 5 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              columnGap: { xs: 2.5, sm: 3, lg: 4, xl: 5 },
              rowGap: { xs: 2.6, sm: 3.2 },
              alignItems: "center",
            }}
          >
            {stats.map(({ label, value, Icon }) => (
              <Box
                key={label}
                sx={{
                  minHeight: { xs: 64, lg: 76, xl: 86 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: { xs: 2, lg: 2.1, xl: 2.6 },
                  maxWidth: { xs: 360, sm: "none" },
                  mx: { xs: "auto", sm: 0 },
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 52, lg: 54, xl: 68 },
                    height: { xs: 52, lg: 54, xl: 68 },
                    borderRadius: 2.4,
                    bgcolor: "#fff",
                    border: "1px solid rgba(37, 99, 235, 0.13)",
                    color: BLUE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow:
                      "0 12px 30px rgba(37, 99, 235, 0.055), inset 0 1px 0 rgba(255,255,255,0.92)",
                  }}
                >
                  <Icon sx={{ fontSize: { xs: 29, lg: 30, xl: 40 } }} />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: BLUE,
                      fontSize: { xs: 26, lg: 28, xl: 36 },
                      fontWeight: 900,
                      lineHeight: 1,
                      mb: { xs: 0.65, xl: 1 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    {value}
                  </Typography>
                  <Typography
                    sx={{
                      color: DARK,
                      fontSize: { xs: 13, lg: 13.5, xl: 17 },
                      fontWeight: 800,
                      lineHeight: 1.25,
                      maxWidth: { xs: 230, lg: 155, xl: 220 },
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default StatsStrip;
