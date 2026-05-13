import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  DescriptionOutlined as DescriptionIcon,
  Headphones as HeadphonesIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  SignalCellularAlt as SignalCellularAltIcon,
  Sync as SyncIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { Dictation } from "../../types/Dictation";

export const formatDuration = (seconds?: number) => {
  if (!seconds) return "0s";
  if (seconds < 60) return `${Math.ceil(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);
  return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

export interface DictationCardProps {
  dictation: Dictation;
  onClick: () => void;
}

export const DictationCard = ({
  dictation,
  onClick,
}: DictationCardProps) => {
  const hasAttempt =
    !!dictation.userStats && dictation.userStats.attemptCount > 0;
  const sentenceCount = dictation.timings?.length || 1;
  const bestAccuracy = Math.round(dictation.userStats?.bestAccuracy || 0);
  const tags: string[] =
    (dictation as Dictation & { tags?: string[] }).tags || [];
  const visibleTags = tags.slice(0, 2);
  const remainingTags = tags.length - visibleTags.length;

  return (
    <Card
      sx={{
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        border: "1px solid #bfdbfe",
        borderRadius: 2.5,
        backgroundColor: "#fff",
        boxShadow: "0 8px 22px rgba(37, 99, 235, 0.08)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 14px 30px rgba(37, 99, 235, 0.14)",
          borderColor: "#93c5fd",
        },
      }}
      onClick={onClick}
    >
      <Chip
        icon={
          hasAttempt ? (
            <CheckCircleIcon sx={{ fontSize: "15px !important" }} />
          ) : (
            <AutoAwesomeIcon sx={{ fontSize: "15px !important" }} />
          )
        }
        label={hasAttempt ? "Đã luyện" : "Mới"}
        size="small"
        sx={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 1,
          height: 24,
          borderRadius: "999px",
          px: 0.5,
          fontSize: 12,
          fontWeight: 800,
          backgroundColor: hasAttempt ? "#dcfce7" : "#fff7ed",
          color: hasAttempt ? "#15803d" : "#d97706",
          border: `1px solid ${hasAttempt ? "#bbf7d0" : "#fed7aa"}`,
          "& .MuiChip-icon": {
            color: hasAttempt ? "#22c55e" : "#f59e0b",
          },
        }}
      />

      <CardContent sx={{ p: 2.25, pb: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={4}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(145deg, #f8fbff 0%, #eef4ff 100%)",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            <HeadphonesIcon sx={{ fontSize: 30 }} />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight={900}
              color="#0f172a"
              noWrap
              sx={{
                letterSpacing: 0,
                maxWidth: 220,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {dictation.title}
            </Typography>

            {tags.length > 0 && (
              <Box display="flex" flexWrap="wrap" gap={1} mt={0.75}>
                {visibleTags.map((tag: string) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      backgroundColor: "#eef2ff",
                      color: "#4338ca",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                ))}
                {remainingTags > 0 && (
                  <Chip
                    label={`+${remainingTags}`}
                    size="small"
                    sx={{
                      backgroundColor: "#f1f5f9",
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap={1.5}
          sx={{ color: "#48618b" }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SignalCellularAltIcon sx={{ color: "#2563eb", fontSize: 21 }} />
            <Typography variant="body2" fontWeight={800}>
              {dictation.level || "N/A"}
            </Typography>
          </Box>

          <Box sx={{ width: "1px", height: 20, backgroundColor: "#e2e8f0" }} />

          <Box display="flex" alignItems="center" gap={1}>
            <DescriptionIcon sx={{ color: "#2563eb", fontSize: 21 }} />
            <Typography variant="body2" fontWeight={800}>
              {sentenceCount} câu
            </Typography>
          </Box>

          <Box sx={{ width: "1px", height: 20, backgroundColor: "#e2e8f0" }} />

          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon sx={{ color: "#2563eb", fontSize: 21 }} />
            <Typography variant="body2" fontWeight={800}>
              {formatDuration(dictation.duration)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Box
        sx={{
          borderTop: "1px solid #e2e8f0",
          px: 2.25,
          py: 1.4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          minHeight: 58,
        }}
      >
        {hasAttempt ? (
          <>
            <Box display="flex" alignItems="center" gap={0.75}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "#dcfce7",
                  color: "#22c55e",
                  flexShrink: 0,
                }}
              >
                <SyncIcon fontSize="small" />
              </Box>
              <Typography fontSize={14} fontWeight={800} color="#64748b">
                {dictation.userStats?.attemptCount || 0} lần
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon sx={{ color: "#22c55e", width: 24, height: 24 }} />
              <Typography fontSize={14} fontWeight={800} color="#64748b" noWrap>
                Điểm cao nhất:{" "}
                <Box component="span" sx={{ color: "#22c55e" }}>
                  {bestAccuracy}%
                </Box>
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Box display="flex" alignItems="center" gap={0.75}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  flexShrink: 0,
                }}
              >
                <HistoryIcon fontSize="small" />
              </Box>
              <Typography fontSize={14} fontWeight={800} color="#64748b">
                Chưa luyện
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} color="#2563eb">
              <Typography fontSize={14} fontWeight={900} noWrap>
                {" "}
              </Typography>
              <ArrowForwardIcon sx={{ width: 24, height: 24 }} />
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
};
