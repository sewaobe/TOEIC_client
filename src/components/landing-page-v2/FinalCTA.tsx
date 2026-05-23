import { FC } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";

interface FinalCTAProps {
  onPrimaryClick: () => void;
}

const FinalCTA: FC<FinalCTAProps> = ({ onPrimaryClick }) => {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#fff",
        py: { xs: 5, sm: 7, lg: 8, xl: 9 },
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
            position: "relative",
            overflow: "hidden",
            borderRadius: { xs: 3, sm: 4 },
            minHeight: { xs: 360, sm: 380, md: 360, lg: 390, xl: 430 },
            color: "#fff",
            backgroundImage: {
              xs: "linear-gradient(145deg, #1f55f3 0%, #1245e9 58%, #4f46e5 100%)",
              sm: "url(/landing-page-images/banner-last-cta.webp)",
            },
            backgroundSize: "cover",
            backgroundPosition: {
              sm: "62% center",
              md: "center center",
            },
            boxShadow: "0 24px 70px rgba(37, 99, 235, 0.16)",
            px: { xs: 2.6, sm: 5, md: 7, lg: 8, xl: 10 },
            py: { xs: 4, sm: 5.5, md: 6, xl: 7 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at 10% 22%, rgba(255,255,255,0.13) 0 76px, transparent 77px), radial-gradient(circle at 86% 88%, rgba(255,255,255,0.12) 0 92px, transparent 93px)",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              width: { xs: "100%", md: "68%", lg: "64%" },
              maxWidth: { xs: 560, md: 720, lg: 790 },
              textAlign: "center",
              mx: "auto",
            }}
          >
            <Typography
              component="h2"
              sx={{
                fontFamily: "'Montserrat', 'Inter', sans-serif",
                fontSize: { xs: 28, sm: 38, md: 32, lg: 38, xl: 45 },
                fontWeight: 800,
                lineHeight: { xs: 1.18, sm: 1.15 },
                letterSpacing: 0,
                mb: { xs: 1.6, lg: 2.2 },
                textShadow: "0 10px 28px rgba(0,0,0,0.12)",
              }}
            >
              Sẵn sàng chinh phục TOEIC?
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 17, sm: 22, md: 24, lg: 28, xl: 32 },
                fontWeight: 600,
                lineHeight: 1.45,
                opacity: 0.96,
                mb: { xs: 2.6, lg: 4 },
              }}
            >
              Học thử miễn phí ngay hôm nay!
            </Typography>

            <Button
              variant="contained"
              endIcon={
                <ArrowForwardIcon sx={{ fontSize: { xs: 20, xl: 24 } }} />
              }
              onClick={onPrimaryClick}
              sx={{
                minWidth: { xs: 0, sm: 290, xl: 340 },
                width: { xs: "100%", sm: "auto" },
                maxWidth: { xs: 270, sm: "none" },
                height: { xs: 52, sm: 62, xl: 72 },
                px: { xs: 2.6, sm: 4, xl: 5 },
                borderRadius: 2.2,
                bgcolor: "#facc15",
                color: "#1f2937",
                fontWeight: 900,
                fontSize: { xs: 15, sm: 17, xl: 20 },
                textTransform: "none",
                boxShadow: "0 18px 34px rgba(250, 204, 21, 0.28)",
                "&:hover": {
                  bgcolor: "#fbbf24",
                  boxShadow: "0 20px 38px rgba(250, 204, 21, 0.34)",
                },
              }}
            >
              Bắt đầu học miễn phí
            </Button>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.5, sm: 4, xl: 6 }}
              justifyContent="center"
              alignItems="center"
              sx={{ mt: { xs: 2.6, lg: 4.2 } }}
            >
              {["Không cần thẻ thanh toán", "Truy cập ngay lập tức"].map(
                (item) => (
                  <Stack
                    key={item}
                    direction="row"
                    spacing={1.1}
                    alignItems="center"
                    sx={{ color: "rgba(255,255,255,0.92)" }}
                  >
                    <CheckIcon sx={{ fontSize: { xs: 18, xl: 22 } }} />
                    <Typography
                      sx={{
                        fontSize: { xs: 14, sm: 15, xl: 18 },
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}
                    >
                      {item}
                    </Typography>
                  </Stack>
                ),
              )}
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FinalCTA;
