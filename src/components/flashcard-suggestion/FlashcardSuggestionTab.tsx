import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { Alarm, PlayArrow, StarBorder, VolumeUp } from "@mui/icons-material";
import MemoryStatusCard from "./MemoryStatusCard";
import ReviewScheduleCard from "./ReviewScheduleCard";
import SuggestedVocabularySection from "./SuggestedVocabularySection";
import { TodayReviewSummary } from "../../types/UserVocabularyProgressV2";
import userVocabularyProgressV2Service from "../../services/user_vocabulary_progress_v2.service";

const CompactHeroPreview = () => (
  <Box
    sx={{
      display: { xs: "none", md: "flex" },
      alignItems: "center",
      justifyContent: "center",
      minWidth: 0,
      minHeight: 150,
      position: "relative",
      overflow: "hidden",
    }}
  >
    {[2, 1, 0].map((offset) => (
      <Paper
        key={offset}
        elevation={0}
        sx={{
          position: "absolute",
          width: { md: 210, xl: 250 },
          height: { md: 112, xl: 128 },
          borderRadius: 3,
          border: "1px solid #dbeafe",
          boxShadow: "0 12px 28px rgba(37,99,235,0.12)",
          transform: `translate(${offset * 7}px, ${offset * -5}px) rotate(${offset * 3}deg)`,
          bgcolor: "rgba(255,255,255,0.92)",
        }}
      />
    ))}
    <Paper
      elevation={0}
      sx={{
        width: { md: 210, xl: 250 },
        height: { md: 112, xl: 128 },
        borderRadius: 3,
        border: "1px solid #dbeafe",
        boxShadow: "0 14px 32px rgba(37,99,235,0.15)",
        zIndex: 2,
        p: 1.5,
        bgcolor: "white",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", color: "#2563eb" }}>
        <VolumeUp sx={{ fontSize: 18 }} />
        <StarBorder sx={{ fontSize: 18, color: "#cbd5e1" }} />
      </Box>
      <Typography sx={{ mt: 1, textAlign: "center", color: "#2563eb", fontWeight: 800, fontSize: { md: 18, xl: 20 } }}>
        vocabulary
      </Typography>
      <Box sx={{ mt: 1.6, mx: "auto", width: "70%" }}>
        <Box sx={{ height: 6, borderRadius: 999, bgcolor: "#e5e7eb", mb: 0.8 }} />
        <Box sx={{ height: 5, borderRadius: 999, bgcolor: "#e5e7eb", width: "72%" }} />
      </Box>
    </Paper>
  </Box>
);

const FlashcardSuggestionTab: React.FC = () => {
  const [summary, setSummary] = useState<TodayReviewSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setIsLoadingSummary(true);
    userVocabularyProgressV2Service
      .getTodayReviewSummary()
      .then((data) => {
        if (isMounted) {
          setSummary(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const overdue = summary?.overdue ?? summary?.overdueReviewCount ?? 0;
  const dueNow = summary?.dueNow ?? summary?.primaryReviewCount ?? 0;
  const upcomingToday = summary?.upcomingToday ?? 0;
  const totalReviewCount = summary?.total ?? overdue + dueNow + upcomingToday;
  const reviewableNow = overdue + dueNow;
  const stats = [
    { key: "dueNow", label: "Đã tới hạn", value: dueNow, color: "#2563eb" },
    { key: "overdue", label: "Quá hạn", value: overdue, color: "#ef4444" },
  ];
  const helperText =
    upcomingToday > 0
      ? `${upcomingToday} từ nữa sẽ tới hạn trong hôm nay`
      : totalReviewCount > 0
        ? "Không còn từ nào sắp tới hạn trong hôm nay"
        : "Chưa có từ nào cần ôn hôm nay";
  const circleProgress = totalReviewCount > 0 ? 100 : 0;

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
            opacity: 0.42,
            maskImage: "linear-gradient(90deg, transparent, black 72%)",
          }}
        />
        <Box sx={{ position: "relative", minWidth: 0 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
            <Box sx={{ p: 1, borderRadius: 2, color: "#2563eb", bgcolor: "#dbeafe", flexShrink: 0 }}>
              <Alarm fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Ôn tập hôm nay
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Theo dõi các từ đã tới hạn, quá hạn và sắp tới hạn trong ngày hôm nay.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "140px minmax(0, 1fr) 250px",
                xl: "155px minmax(0, 1fr) 290px",
              },
              gap: { xs: 2, md: 2.5 },
              alignItems: "center",
              minWidth: 0,
            }}
          >
            {/* LEFT: progress circle only */}
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: { xs: 112, sm: 122 },
                  height: { xs: 112, sm: 122 },
                  borderRadius: "50%",
                  background: `conic-gradient(#2563eb 0 ${circleProgress}%, #bfdbfe ${circleProgress}% 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
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
                    {isLoadingSummary ? <Skeleton width={44} /> : totalReviewCount}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    từ cần ôn
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* CENTER: stats + buttons + helper */}
            <Box sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.2,
                  mb: 2,
                  minWidth: 0,
                }}
              >
                {stats.map((stat) => (
                  <Paper
                    key={stat.key}
                    elevation={0}
                    sx={{
                      p: 1.35,
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                      minWidth: 0,
                      bgcolor: "rgba(255,255,255,0.88)",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          bgcolor: stat.color,
                          flexShrink: 0,
                        }}
                      />
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
                      {isLoadingSummary ? <Skeleton width={32} /> : stat.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 800,
                    px: { xs: 2, sm: 3 },
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Ôn {dueNow} từ đã tới hạn
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 800,
                    px: { xs: 2, sm: 3 },
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    bgcolor: "rgba(255,255,255,0.72)",
                  }}
                >
                  Ôn {overdue} từ quá hạn
                </Button>
              </Stack>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "text.secondary",
                  fontWeight: 700,
                  mt: 1,
                }}
              >
                {isLoadingSummary ? <Skeleton width={210} /> : helperText}
              </Typography>
            </Box>

            {/* RIGHT: preview card only */}
            <CompactHeroPreview />
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 7fr) minmax(340px, 3fr)" },
          gap: 2,
          alignItems: "stretch",
          minWidth: 0,
        }}
      >
        <ReviewScheduleCard />
        <MemoryStatusCard />
      </Box>

      <SuggestedVocabularySection />
    </Box>
  );
};

export default FlashcardSuggestionTab;
