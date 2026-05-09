import { ReactNode } from "react";
import {
  AccessTime as AccessTimeIcon,
  ArticleOutlined as ArticleOutlinedIcon,
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  Check as CheckIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ChevronRight as ChevronRightIcon,
  Headphones as HeadphonesIcon,
  InfoOutlined as InfoOutlinedIcon,
  Replay as ReplayIcon,
  SmartToyOutlined as SmartToyOutlinedIcon,
  TrackChanges as TrackChangesIcon,
  WarningAmberOutlined as WarningAmberOutlinedIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import type { DictationRuleInsights, Difficulty } from "../DictationContentV2";

interface DictationCompletionOverlayProps {
  open: boolean;
  accuracy: number;
  completedItems: number;
  totalItems: number;
  totalTime: number;
  attemptCount: number;
  level?: string;
  difficulty: Difficulty;
  insights: DictationRuleInsights;
  loadingAI: boolean;
  hasNextLesson: boolean;
  onAnalyze: () => void;
  onRetry: () => void;
  onViewAnswers: () => void;
  onNextLesson: () => void;
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

const formatDuration = (seconds: number) => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder
    .toString()
    .padStart(2, "0")}`;
};

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <Box
      sx={{
        p: { xs: 1.25, sm: 1.4, md: 1.55, lg: 1.65 },
        borderRadius: 1.75,
        border: "1px solid #dbe3ef",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        gap: { xs: 1, md: 1.25 },
        minHeight: { xs: 72, sm: 78, lg: 84 },
      }}
    >
      <Box
        sx={{
          width: { xs: 40, sm: 44, lg: 48 },
          height: { xs: 40, sm: 44, lg: 48 },
          borderRadius: "50%",
          backgroundColor: "#eef4ff",
          display: "grid",
          placeItems: "center",
          color: "#2563eb",
          flex: "0 0 auto",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            color: "#475569",
            fontSize: { xs: 12, sm: 12.5, lg: 13 },
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            color: "#1457e5",
            fontSize: { xs: 20, sm: 21, md: 22, lg: 23 },
            fontWeight: 850,
            lineHeight: 1.05,
            mt: 0.25,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function InsightRow({
  icon,
  message,
}: {
  icon: ReactNode;
  message: string;
}) {
  return (
    <Box display="flex" gap={1.15} p={{ xs: 1.2, md: 1.35 }} alignItems="center">
      {icon}
      <Typography sx={{ color: "#0f172a", fontSize: { xs: 12.5, md: 13.5 } }}>
        {message}
      </Typography>
    </Box>
  );
}

export default function DictationCompletionOverlay({
  open,
  accuracy,
  completedItems,
  totalItems,
  totalTime,
  attemptCount,
  level,
  difficulty,
  insights,
  loadingAI,
  hasNextLesson,
  onAnalyze,
  onRetry,
  onViewAnswers,
  onNextLesson,
}: DictationCompletionOverlayProps) {
  if (!open) return null;

  const insightRows = [
    ...insights.strengths.map((message) => ({
      icon: <CheckCircleOutlineIcon sx={{ color: "#16a34a", fontSize: 21 }} />,
      message,
    })),
    ...insights.weaknesses.map((message) => ({
      icon: <WarningAmberOutlinedIcon sx={{ color: "#f97316", fontSize: 21 }} />,
      message,
    })),
    ...insights.patterns.map((message) => ({
      icon: <InfoOutlinedIcon sx={{ color: "#2563eb", fontSize: 21 }} />,
      message,
    })),
    {
      icon: <InfoOutlinedIcon sx={{ color: "#64748b", fontSize: 21 }} />,
      message: insights.suggestion,
    },
  ];
  const visibleInsightRows = insightRows.slice(0, 4);

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: 58, sm: 64, md: 68, lg: 72 },
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1100,
        overflowY: "auto",
        overflowX: "hidden",
        background:
          "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.08), transparent 34%), #f5f9ff",
        px: { xs: 1, sm: 1.5, md: 2, lg: 2.5 },
        py: { xs: 1, sm: 1.25, md: 1.5, lg: 1.75 },
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        sx={{
          width: {
            xs: "100%",
            sm: "min(100%, 680px)",
            md: "min(100%, 900px)",
            lg: "min(100%, 1040px)",
            xl: "min(100%, 1120px)",
          },
          mx: "auto",
          borderRadius: { xs: 2, md: 2.5 },
          border: "1px solid #dbe3ef",
          backgroundColor: "#fff",
          boxShadow: "0 20px 48px rgba(15, 23, 42, 0.11)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <IconButton
          aria-label="Xem lại đáp án"
          onClick={onViewAnswers}
          sx={{
            position: "absolute",
            top: { xs: 10, sm: 12, md: 14 },
            left: { xs: 10, sm: 12, md: 14 },
            width: { xs: 34, md: 38 },
            height: { xs: 34, md: 38 },
            border: "1px solid #dbe3ef",
            backgroundColor: "#fff",
            boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
            zIndex: 2,
            "&:hover": {
              backgroundColor: "#f8fafc",
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: { xs: 19, md: 21 } }} />
        </IconButton>

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {[
            ["14%", "18%", "#f59e0b", "rotate(28deg)"],
            ["24%", "9%", "#fb923c", "rotate(-24deg)"],
            ["42%", "11%", "#60a5fa", "rotate(18deg)"],
            ["58%", "15%", "#93c5fd", "rotate(-18deg)"],
            ["73%", "10%", "#facc15", "rotate(42deg)"],
            ["86%", "18%", "#3b82f6", "rotate(-34deg)"],
          ].map(([left, top, color, transform], index) => (
            <Box
              key={`${left}-${top}`}
              sx={{
                position: "absolute",
                left,
                top,
                width: index % 2 === 0 ? 7 : 10,
                height: 3,
                borderRadius: 999,
                backgroundColor: color,
                transform,
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 2.5, md: 3 },
            pt: { xs: 3.25, sm: 3.5, md: 3.75 },
            pb: { xs: 1.35, sm: 1.5, md: 1.75 },
            textAlign: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: { xs: 58, sm: 64, md: 70 },
              height: { xs: 58, sm: 64, md: 70 },
              borderRadius: "50%",
              mx: "auto",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 14px 28px rgba(37, 99, 235, 0.26)",
            }}
          >
            <CheckIcon sx={{ fontSize: { xs: 34, sm: 38, md: 42 }, strokeWidth: 2 }} />
          </Box>

          <Typography
            component="h2"
            sx={{
              color: "#0f172a",
              fontSize: { xs: 21, sm: 25, md: 28, lg: 30 },
              fontWeight: 850,
              lineHeight: 1.12,
              mt: { xs: 1.25, md: 1.5 },
            }}
          >
            Chúc mừng! Bạn đã hoàn thành bài Dictation
          </Typography>
          <Typography
            sx={{
              color: "#475569",
              fontSize: { xs: 12.5, sm: 13.5, md: 14.5 },
              fontWeight: 500,
              mt: 0.65,
            }}
          >
            Hoàn thành {completedItems}/{totalItems} câu · {level || "-"} ·{" "}
            {difficultyLabels[difficulty]}
          </Typography>
        </Box>

        <Divider sx={{ mx: { xs: 2, md: 3 } }} />

        <Box sx={{ px: { xs: 2, sm: 2.5, md: 3 }, py: { xs: 1.4, md: 1.75 } }}>
          <Typography
            sx={{
              color: "#0f172a",
              fontSize: { xs: 14.5, md: 16 },
              fontWeight: 800,
              mb: { xs: 1, md: 1.25 },
            }}
          >
            Kết quả của bạn
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 1, md: 1.15 },
            }}
          >
            <MetricCard
              icon={<TrackChangesIcon sx={{ fontSize: { xs: 24, lg: 28 } }} />}
              label="Độ chính xác"
              value={`${accuracy}%`}
            />
            <MetricCard
              icon={<AccessTimeIcon sx={{ fontSize: { xs: 24, lg: 28 } }} />}
              label="Thời gian"
              value={formatDuration(totalTime)}
            />
            <MetricCard
              icon={<HeadphonesIcon sx={{ fontSize: { xs: 24, lg: 28 } }} />}
              label="Lượt kiểm tra"
              value={attemptCount}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 1, md: 1.15 },
              mt: { xs: 1, md: 1.15 },
            }}
          >
            <Box
              sx={{
                p: { xs: 1.4, md: 1.65 },
                borderRadius: 1.75,
                border: "1px solid #dbe3ef",
                backgroundColor: "#fff",
              }}
            >
              <Typography
                sx={{
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: { xs: 14.5, md: 16 },
                  mb: 1,
                }}
              >
                Điểm nổi bật
              </Typography>
              <Box
                sx={{
                  border: "1px solid #dbe3ef",
                  borderRadius: 1.75,
                  overflow: "hidden",
                }}
              >
                {visibleInsightRows.map((row, index) => (
                  <Box key={`${row.message}-${index}`}>
                    {index > 0 ? <Divider /> : null}
                    <InsightRow icon={row.icon} message={row.message} />
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                p: { xs: 1.4, md: 1.65 },
                borderRadius: 1.75,
                border: "1px solid #dbe3ef",
                background:
                  "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.08), transparent 40%), #fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                minHeight: { xs: 170, md: 184, lg: 194 },
              }}
            >
              <SmartToyOutlinedIcon sx={{ color: "#2563eb", fontSize: { xs: 36, md: 42 }, mb: 0.65 }} />
              <Typography sx={{ color: "#0f172a", fontSize: { xs: 19, md: 21 }, fontWeight: 850 }}>
                Phân tích với AI
              </Typography>
              <Typography
                sx={{
                  color: "#475569",
                  fontSize: { xs: 12.5, md: 13.5 },
                  maxWidth: 320,
                  mt: 0.65,
                }}
              >
                Xem lại các lỗi sai chi tiết và nhận gợi ý cá nhân hóa để cải thiện nhanh hơn.
              </Typography>
              <Button
                variant="contained"
                startIcon={
                  loadingAI ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : (
                    <AutoAwesomeIcon />
                  )
                }
                onClick={onAnalyze}
                disabled={loadingAI}
                sx={{
                  mt: 1.4,
                  width: "min(100%, 300px)",
                  height: { xs: 40, md: 44 },
                  borderRadius: 1.35,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: { xs: 13.5, md: 14.5 },
                  background: "linear-gradient(135deg, #2563eb, #0f4fe8)",
                  boxShadow: "0 12px 22px rgba(37, 99, 235, 0.22)",
                }}
              >
                {loadingAI ? "Đang phân tích..." : "Phân tích với AI"}
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 2.5, md: 3 },
            py: { xs: 1.2, md: 1.35 },
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#fff",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: { xs: 0.85, md: 1 },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArticleOutlinedIcon />}
            onClick={onViewAnswers}
            sx={{
              height: { xs: 42, md: 46 },
              borderRadius: 1.35,
              textTransform: "none",
              fontWeight: 800,
              fontSize: { xs: 13.5, md: 14.5 },
            }}
          >
            Xem đáp án
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReplayIcon />}
            onClick={onRetry}
            sx={{
              height: { xs: 42, md: 46 },
              borderRadius: 1.35,
              textTransform: "none",
              fontWeight: 800,
              fontSize: { xs: 13.5, md: 14.5 },
            }}
          >
            Làm lại bài này
          </Button>
          <Button
            variant="contained"
            endIcon={<ChevronRightIcon />}
            onClick={onNextLesson}
            sx={{
              height: { xs: 42, md: 46 },
              borderRadius: 1.35,
              textTransform: "none",
              fontWeight: 800,
              fontSize: { xs: 13.5, md: 14.5 },
              background: "linear-gradient(135deg, #2563eb, #0f4fe8)",
              boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
              gridColumn: { xs: "auto", sm: "1 / -1", md: "auto" },
            }}
          >
            {hasNextLesson ? "Bài tiếp theo" : "Về danh sách"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
