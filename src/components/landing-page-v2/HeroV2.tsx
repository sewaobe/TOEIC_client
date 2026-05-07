import { FC } from "react";
import { Box, Button, Container, Stack, Typography } from "@mui/material";

interface HeroV2Props {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

const BLUE = "#1f5eea";
const DARK = "#080f21";
const MUTED = "#5f6f89";
const PALE_BLUE = "#edf4ff";

const progressData = [
  { label: "Tuần 1", part: "Part 1 - 2", width: 82 },
  { label: "Tuần 2", part: "Part 3 - 4", width: 58 },
  { label: "Tuần 3", part: "Part 5 - 6", width: 45 },
];

const Avatar = ({ src, index }: { src: string; index: number }) => (
  <Box
    component="img"
    src={src}
    alt=""
    sx={{
      width: 34,
      height: 34,
      borderRadius: "50%",
      objectFit: "cover",
      border: "3px solid #fff",
      ml: index === 0 ? 0 : -1.1,
      boxShadow: "0 7px 16px rgba(15, 23, 42, 0.12)",
      flexShrink: 0,
    }}
  />
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 21v-1.4c0-2.28-1.85-4.13-4.13-4.13H8.13A4.13 4.13 0 0 0 4 19.6V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 11.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.4 7.2A8.6 8.6 0 0 0 5.2 6M3.6 3.5V8h4.5M3.6 16.8A8.6 8.6 0 0 0 18.8 18m1.6 2.5V16h-4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeroV2: FC<HeroV2Props> = ({ onPrimaryClick, onSecondaryClick }) => {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "#fff",
        minHeight: { xs: "auto", lg: 640 },
        py: { xs: 5, sm: 6, md: 7, lg: 7.2 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.82) 46%, rgba(239,246,255,0.5) 100%)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: { lg: 60 },
          right: { lg: 70, xl: 118 },
          width: 118,
          height: 118,
          backgroundImage:
            "radial-gradient(circle, rgba(37, 99, 235, 0.2) 1.1px, transparent 1.1px)",
          backgroundSize: "13px 13px",
          opacity: 0.7,
          display: { xs: "none", lg: "block" },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 64,
          left: "50.5%",
          width: 92,
          height: 120,
          borderRadius: "60px 60px 16px 16px",
          bgcolor: "rgba(37, 99, 235, 0.055)",
          display: { xs: "none", lg: "block" },
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 294,
          left: "47%",
          width: 22,
          height: 22,
          border: "4px solid rgba(37, 99, 235, 0.1)",
          transform: "rotate(45deg)",
          display: { xs: "none", lg: "block" },
        }}
      />

      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1700,
          px: { xs: 2.5, sm: 5, md: 7, lg: 5, xl: 6.5 },
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems="center"
          sx={{
            minHeight: { lg: 540 },
            "@media (min-width:1200px) and (max-width:1279.95px)": {
              flexDirection: "column",
            },
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", lg: "56%" },
              maxWidth: { xs: 720, lg: 720, xl: 860 },
              pt: { lg: 0 },
              textAlign: { xs: "center", lg: "left" },
              "@media (min-width:1200px) and (max-width:1279.95px)": {
                width: "100%",
                textAlign: "center",
              },
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 2,
                height: { xs: 30, sm: 32, lg: 34 },
                mb: { xs: 2.5, lg: 3 },
                borderRadius: 999,
                bgcolor: "rgba(37, 99, 235, 0.1)",
                color: BLUE,
                fontSize: { xs: 12, sm: 13, lg: 14, xl: 15 },
                fontWeight: 800,
                letterSpacing: 0,
                textTransform: "uppercase",
                boxShadow: "0 14px 30px rgba(37, 99, 235, 0.1)",
              }}
            >
              Smart Learning for Smarter You
            </Box>

            <Typography
              component="h1"
              sx={{
                maxWidth: { xs: 720, lg: 720, xl: 860 },
                fontFamily: "'Montserrat', 'Inter', sans-serif",
                color: DARK,
                fontWeight: 700,
                letterSpacing: 0,
                lineHeight: { xs: 1.12, sm: 1.14, lg: 1.16 },
                fontSize: { xs: 38, sm: 48, md: 54, lg: 50, xl: 60 },
                mb: { xs: 2.2, lg: 2.8 },
                textShadow: "0 0 0.25px currentColor",
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "block",
                  fontWeight: "inherit",
                  whiteSpace: { sm: "nowrap" },
                }}
              >
                TOEIC không khó
              </Box>
              <Box
                component="span"
                sx={{
                  display: "block",
                  fontWeight: "inherit",
                  whiteSpace: { sm: "nowrap" },
                }}
              >
                khi có{" "}
                <Box
                  component="span"
                  sx={{ color: BLUE, fontWeight: "inherit" }}
                >
                  phương pháp đúng
                </Box>
              </Box>
            </Typography>

            <Typography
              sx={{
                color: MUTED,
                fontSize: { xs: 15, sm: 16, lg: 17, xl: 18 },
                fontWeight: 600,
                lineHeight: { xs: 1.75, sm: 1.85, lg: 1.9 },
                maxWidth: { xs: 620, xl: 660 },
                mx: { xs: "auto", lg: 0 },
                mb: { xs: 3.2, lg: 4.2 },
                "@media (min-width:1200px) and (max-width:1279.95px)": {
                  mx: "auto",
                },
              }}
            >
              Toeic Smart giúp bạn học đúng trọng tâm, luyện đúng dạng bài, đạt
              điểm TOEIC mục tiêu trong thời gian ngắn nhất.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.5, sm: 2, lg: 2.4 }}
              justifyContent={{ xs: "center", lg: "flex-start" }}
              sx={{
                mb: { xs: 4, lg: 5.1 },
                "@media (min-width:1200px) and (max-width:1279.95px)": {
                  justifyContent: "center",
                },
              }}
            >
              <Button
                onClick={onPrimaryClick}
                variant="contained"
                disableElevation
                sx={{
                  width: { xs: "100%", sm: 255, xl: 275 },
                  maxWidth: { xs: 320, sm: "none" },
                  height: { xs: 52, sm: 56, xl: 58 },
                  borderRadius: 2,
                  bgcolor: BLUE,
                  color: "#fff",
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: { xs: 15, sm: 16, xl: 17 },
                  whiteSpace: "nowrap",
                  boxShadow: "0 16px 28px rgba(37, 99, 235, 0.24)",
                  "&:hover": {
                    bgcolor: "#174dcc",
                    boxShadow: "0 18px 32px rgba(37, 99, 235, 0.3)",
                  },
                }}
              >
                Học thử 7 ngày miễn phí
              </Button>

              <Button
                onClick={onSecondaryClick}
                variant="outlined"
                sx={{
                  width: { xs: "100%", sm: 190, xl: 205 },
                  maxWidth: { xs: 320, sm: "none" },
                  height: { xs: 52, sm: 56, xl: 58 },
                  borderRadius: 2,
                  borderColor: "rgba(37, 99, 235, 0.55)",
                  color: BLUE,
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: { xs: 15, sm: 16, xl: 17 },
                  whiteSpace: "nowrap",
                  bgcolor: "rgba(255,255,255,0.76)",
                  "&:hover": {
                    borderColor: BLUE,
                    bgcolor: "rgba(37, 99, 235, 0.05)",
                  },
                }}
              >
                Khám phá ngay
              </Button>
            </Stack>

            <Typography
              sx={{
                color: "#53647d",
                fontSize: { xs: 13, sm: 14 },
                fontWeight: 700,
                mb: 2.1,
              }}
            >
              Hơn 50.000+ học viên đã tin tưởng Toeic Smart
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              justifyContent={{ xs: "center", lg: "flex-start" }}
              gap={{ xs: 2, lg: 4, xl: 6 }}
              sx={{
                "@media (min-width:1200px) and (max-width:1279.95px)": {
                  justifyContent: "center",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {[
                  "/landing-page-images/character-1.webp",
                  "/landing-page-images/character-2.webp",
                  "/landing-page-images/character-3.webp",
                  "/landing-page-images/character-4.webp",
                ].map((src, index) => (
                  <Avatar key={src} src={src} index={index} />
                ))}
              </Box>

              <Stack
                direction="row"
                alignItems="center"
                flexWrap="wrap"
                justifyContent={{ xs: "center", lg: "flex-start" }}
                gap={{ xs: 2.1, sm: 3, lg: 3.5, xl: 5.4 }}
                sx={{
                  "@media (min-width:1200px) and (max-width:1279.95px)": {
                    justifyContent: "center",
                  },
                }}
              >
                {["€ ETS.", "BRITISH COUNCIL", "idp", "OXFORD"].map((brand) => (
                  <Typography
                    key={brand}
                    sx={{
                      color: "#0c1b51",
                      fontWeight: 900,
                      fontSize: { xs: 13, sm: 14, lg: 17, xl: 20 },
                      letterSpacing: brand === "idp" ? -0.5 : 0.6,
                      lineHeight: 1,
                      opacity: 0.94,
                    }}
                  >
                    {brand}
                  </Typography>
                ))}
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              position: "relative",
              width: { xs: "100%", lg: "44%" },
              maxWidth: { xs: 760, lg: "none" },
              height: { xs: 430, sm: 500, md: 540, lg: 500 },
              mt: { xs: 5, md: 6, lg: 0 },
              mx: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "@media (min-width:1200px) and (max-width:1279.95px)": {
                width: "100%",
                maxWidth: 760,
                mt: 6,
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: {
                  xs: "min(100%, 390px)",
                  sm: "min(100%, 600px)",
                  md: "min(100%, 720px)",
                  lg: "clamp(540px, 42vw, 640px)",
                  xl: "clamp(680px, 44vw, 760px)",
                },
                aspectRatio: "760 / 500",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: { xs: "0%", lg: "2%" },
                  left: { xs: "44%", lg: "19%", xl: "25%" },
                  transform: { xs: "translateX(-50%)", lg: "none" },
                  width: { xs: "92%", sm: "62%", lg: "64%", xl: "58%" },
                  maxWidth: { lg: 390, xl: 438 },
                  aspectRatio: "438 / 350",
                  borderRadius: 4,
                  bgcolor: "rgba(255, 255, 255, 0.82)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.9) 0 52px, rgba(255,255,255,0.58) 53px 100%)",
                  border: "1px solid rgba(203, 213, 225, 0.86)",
                  boxShadow:
                    "0 26px 70px rgba(37, 99, 235, 0.16), inset 0 1px 0 rgba(255,255,255,0.95)",
                  backdropFilter: "blur(16px)",
                  overflow: "hidden",
                  zIndex: 2,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 52,
                    right: 0,
                    height: 1,
                  }}
                />
                <Box
                  sx={{ position: "absolute", top: 20, left: 27, color: BLUE }}
                >
                  <UserIcon />
                </Box>
                <Box
                  sx={{ position: "absolute", top: 20, right: 27, color: BLUE }}
                >
                  <RefreshIcon />
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    top: 15,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 116,
                    height: 32,
                    borderRadius: 999,
                    bgcolor: "rgba(255,255,255,0.75)",
                    boxShadow: "0 14px 34px rgba(148, 163, 184, 0.1)",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    left: { xs: 20, lg: 20, xl: 28 },
                    right: { xs: 20, lg: 20, xl: 28 },
                    top: { xs: 50, lg: 46, xl: 50 },
                    height: { xs: 150, lg: 124, xl: 150 },
                    borderRadius: 2.4,
                    bgcolor: "rgba(255, 255, 255, 0.96)",
                    border: "0.5px solid rgba(226, 232, 240, 0.92)",
                    boxShadow: "0 18px 42px rgba(15, 23, 42, 0.07)",
                  }}
                >
                  <Typography
                    sx={{
                      position: "absolute",
                      top: { xs: 31, lg: 25, xl: 31 },
                      left: { xs: 29, lg: 20, xl: 29 },
                      color: "#66758f",
                      fontSize: { xs: 13, lg: 10, xl: 13 },
                      fontWeight: 700,
                    }}
                  >
                    Overall Score
                  </Typography>
                  <Typography
                    sx={{
                      position: "absolute",
                      left: { xs: 29, lg: 20, xl: 29 },
                      bottom: { xs: 25, lg: 23, xl: 25 },
                      color: DARK,
                      fontWeight: 900,
                      fontSize: { xs: 50, sm: 54, lg: 35, xl: 64 },
                      lineHeight: 0.9,
                      letterSpacing: 0,
                    }}
                  >
                    860
                  </Typography>

                  <Box
                    sx={{
                      position: "absolute",
                      top: { xs: 19, lg: 18, xl: 19 },
                      right: { xs: 26, lg: 20, xl: 26 },
                      width: { xs: 150, lg: 112, xl: 150 },
                      height: { xs: 39, lg: 32, xl: 39 },
                      borderRadius: 1.4,
                      bgcolor: BLUE,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: { xs: 14, lg: 10, xl: 14 },
                      fontWeight: 900,
                      boxShadow: "0 12px 24px rgba(37, 99, 235, 0.22)",
                    }}
                  >
                    Overall Score
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1.2}
                    sx={{
                      position: "absolute",
                      right: { xs: 28, lg: 20, xl: 28 },
                      top: { xs: 67, lg: 58, xl: 67 },
                    }}
                  >
                    {[
                      { label: "Listening", score: "445" },
                      { label: "Reading", score: "415" },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          width: { xs: 69, lg: 50, xl: 69 },
                          height: { xs: 62, lg: 50, xl: 62 },
                          borderRadius: 1.5,
                          bgcolor: "rgba(248, 250, 252, 0.92)",
                          border: "1px solid rgba(226, 232, 240, 0.8)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#66758f",
                            fontSize: { xs: 12, lg: 9.5, xl: 12 },
                            fontWeight: 700,
                            mb: 0.8,
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          sx={{
                            color: DARK,
                            fontSize: { xs: 18, lg: 14, xl: 18 },
                            fontWeight: 900,
                            lineHeight: 1,
                          }}
                        >
                          {item.score}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  top: { xs: "38%", sm: "39%", lg: "43%", xl: "42%" },
                  left: { xs: "50%", lg: "7%", xl: "8%" },
                  transform: { xs: "translateX(-50%)", lg: "none" },
                  width: { xs: "88%", sm: "66%", lg: "58%", xl: "62%" },
                  maxWidth: { lg: 380, xl: 468 },
                  borderRadius: 3.2,
                  bgcolor: "rgba(255, 255, 255, 0.94)",
                  border: "1px solid rgba(226, 232, 240, 0.95)",
                  boxShadow:
                    "0 24px 54px rgba(15, 23, 42, 0.13), inset 0 1px 0 rgba(255,255,255,0.95)",
                  backdropFilter: "blur(14px)",
                  zIndex: 5,
                  px: { xs: 2.2, sm: 3, lg: 3.2, xl: 5 },
                  py: { xs: 2.8, sm: 3.6, lg: 3, xl: 5 },
                }}
              >
                <Typography
                  sx={{
                    color: DARK,
                    fontSize: { xs: 15, lg: 12, xl: 15 },
                    fontWeight: 900,
                    mb: { xs: 1.75, lg: 1.2, xl: 1.75 },
                  }}
                >
                  Tiến độ học tập
                </Typography>

                <Stack spacing={{ xs: 1.35, lg: 0.85, xl: 1.35 }}>
                  {progressData.map((item) => (
                    <Stack
                      key={item.label}
                      direction="row"
                      alignItems="center"
                      sx={{ minWidth: 0 }}
                    >
                      <Typography
                        sx={{
                            width: { xs: 66, lg: 50, xl: 66 },
                          flexShrink: 0,
                          color: DARK,
                            fontSize: { xs: 14, lg: 11, xl: 14 },
                          fontWeight: 900,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                            width: { xs: 84, lg: 64, xl: 84 },
                          flexShrink: 0,
                          color: "#8396b2",
                            fontSize: { xs: 12, lg: 10, xl: 12 },
                          fontWeight: 800,
                        }}
                      >
                        {item.part}
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                            height: { xs: 8, lg: 6, xl: 8 },
                          borderRadius: 999,
                          bgcolor: "rgba(37, 99, 235, 0.09)",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${item.width}%`,
                            height: "100%",
                            borderRadius: 999,
                            bgcolor: BLUE,
                          }}
                        />
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Box
                component="img"
                src="/landing-page-images/anh-tai-nghe-cuon-sach.webp"
                alt="Tai nghe và cuốn sách TOEIC"
                loading="eager"
                sx={{
                  position: "absolute",
                  top: { xs: "65%", sm: "61%", lg: "45%", xl: "40%" },
                  left: { xs: "38%", lg: "33%", xl: "34%" },
                  transform: { xs: "translateX(-50%)", lg: "none" },
                  width: { xs: "92%", sm: "64%", lg: "60%", xl: "66%" },
                  maxWidth: { lg: 380, xl: 500 },
                  height: "auto",
                  zIndex: 4,
                  mixBlendMode: "multiply",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  right: { lg: "-2%", xl: "-8%" },
                  top: { lg: "39%", xl: "38%" },
                  width: { lg: 86, xl: 118 },
                  height: { lg: 86, xl: 118 },
                  borderRadius: "50%",
                  bgcolor: PALE_BLUE,
                  display: { xs: "none", lg: "block" },
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default HeroV2;
