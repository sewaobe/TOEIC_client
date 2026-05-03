import React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Alarm, PlayArrow, StarBorder, VolumeUp } from "@mui/icons-material";
import { reviewStats } from "./mockData";
import MemoryStatusCard from "./MemoryStatusCard";
import ReviewScheduleCard from "./ReviewScheduleCard";
import SuggestedVocabularySection from "./SuggestedVocabularySection";

const totalDue = 28;

const HeroFlashcardPreview = () => (
  <Box
    sx={{
      width: { xs: "100%", md: 330 },
      minWidth: 0,
      height: { xs: 132, sm: 150 },
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      mt: { xs: 1, md: 0 },
    }}
  >
    {[2, 1, 0].map((offset) => (
      <Paper
        key={offset}
        elevation={0}
        sx={{
          position: "absolute",
          width: { xs: "min(245px, calc(100% - 32px))", sm: 285 },
          height: { xs: 104, sm: 120 },
          borderRadius: 4,
          border: "1px solid #dbeafe",
          boxShadow: "0 12px 30px rgba(37,99,235,0.14)",
          transform: `translate(${offset * 8}px, ${offset * -6}px) rotate(${offset * 3}deg)`,
          bgcolor: "rgba(255,255,255,0.92)",
        }}
      />
    ))}
    <Paper
      elevation={0}
      sx={{
        width: { xs: "min(245px, calc(100% - 32px))", sm: 285 },
        height: { xs: 104, sm: 120 },
        borderRadius: 4,
        border: "1px solid #dbeafe",
        boxShadow: "0 14px 34px rgba(37,99,235,0.16)",
        zIndex: 2,
        p: { xs: 1.5, sm: 2 },
        bgcolor: "white",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", color: "#2563eb" }}>
        <VolumeUp fontSize="small" />
        <StarBorder fontSize="small" sx={{ color: "#cbd5e1" }} />
      </Box>
      <Typography
        sx={{
          mt: { xs: 1, sm: 1.5 },
          textAlign: "center",
          color: "#2563eb",
          fontWeight: 800,
          fontSize: { xs: 18, sm: 22 },
        }}
      >
        incentive
      </Typography>
      <Box sx={{ mt: { xs: 1.8, sm: 2.5 }, mx: "auto", width: "70%" }}>
        <Box sx={{ height: 7, borderRadius: 999, bgcolor: "#e5e7eb", mb: 1 }} />
        <Box sx={{ height: 6, borderRadius: 999, bgcolor: "#e5e7eb", width: "72%" }} />
      </Box>
    </Paper>
  </Box>
);

const FlashcardSuggestionTab: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid #dbeafe",
          background: "linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%)",
          overflow: "hidden",
          position: "relative",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(#bfdbfe 1.2px, transparent 1.2px)",
            backgroundSize: "18px 18px",
            opacity: 0.45,
            maskImage: "linear-gradient(90deg, transparent, black 68%)",
          }}
        />
        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 330px" },
            gap: { xs: 2, md: 3 },
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, color: "#2563eb", bgcolor: "#dbeafe", flexShrink: 0 }}>
                <Alarm fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Ôn tập hôm nay
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Ưu tiên những từ cần ôn gấp để ghi nhớ hiệu quả hơn.
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "140px minmax(0, 1fr)", lg: "170px minmax(0, 1fr)" },
                gap: 2,
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: { xs: 112, sm: 122 },
                  height: { xs: 112, sm: 122 },
                  borderRadius: "50%",
                  background: "conic-gradient(#2563eb 0 78%, #bfdbfe 78% 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: { xs: "auto", sm: 0 },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 88, sm: 96 },
                    height: { xs: 88, sm: 96 },
                    borderRadius: "50%",
                    bgcolor: "#eff6ff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {totalDue}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    từ cần ôn
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                    gap: 1.5,
                    mb: 2.5,
                  }}
                >
                  {reviewStats.map((stat) => (
                    <Paper
                      key={stat.label}
                      elevation={0}
                      sx={{ p: 1.6, borderRadius: 2, border: "1px solid #e2e8f0", minWidth: 0 }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: stat.color, flexShrink: 0 }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: "text.secondary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 900, mt: 0.3 }}>
                        {stat.value}
                      </Typography>
                    </Paper>
                  ))}
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button variant="contained" startIcon={<PlayArrow />} sx={{ borderRadius: 2, fontWeight: 800, px: { xs: 2, sm: 4 } }}>
                    Bắt đầu ôn 28 từ
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>

          <HeroFlashcardPreview />
        </Box>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2, minWidth: 0 }}>
        <ReviewScheduleCard />
        <MemoryStatusCard />
      </Box>

      <SuggestedVocabularySection />
    </Box>
  );
};

export default FlashcardSuggestionTab;
