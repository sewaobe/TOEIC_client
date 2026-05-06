import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";

interface DictationHeaderProps {
  title: string;
  level?: string;
  totalItems: number;
  completed: number;
  overallProgress: number;
  allowAnalyze: boolean;
  loadingAI: boolean;
  onAnalyze: () => void;
  onBack?: () => void;
  currentIndex: number;
  passedIndices: Set<number>;
  onJumpTo: (index: number) => void;
}

export default function DictationHeader({
  title,
  level,
  totalItems,
  completed,
  overallProgress,
  allowAnalyze,
  loadingAI,
  onAnalyze,
  onBack,
  currentIndex,
  passedIndices,
  onJumpTo,
}: DictationHeaderProps) {
  return (
    <Box mb={3} className="dictation-header">
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        {onBack && (
          <IconButton
            onClick={onBack}
            sx={{
              backgroundColor: "#f1f5f9",
              "&:hover": {
                backgroundColor: "#e2e8f0",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Box flex={1}>
          <Typography variant="h4" fontWeight={700} color="#2563eb">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Luyện nghe chép chính tả · {level || "—"} · {totalItems} câu
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ minWidth: 160 }}>
            <Typography variant="caption" color="text.secondary">
              Tiến độ {completed}/{totalItems}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={overallProgress}
              sx={{ mt: 0.5, height: 8, borderRadius: 5 }}
            />
          </Box>

          <Button
            onClick={onAnalyze}
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 20 }} />}
            disabled={!allowAnalyze || loadingAI}
            sx={{
              px: 2.5,
              py: 1,
              fontWeight: 600,
              borderRadius: "999px",
              textTransform: "none",
              fontSize: 14,
              color: "#fff",
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)",
              backgroundSize: "300% 300%",
              animation: allowAnalyze ? "gradientShift 4s ease infinite" : "none",
              opacity: allowAnalyze ? 1 : 0.5,
              cursor: allowAnalyze ? "pointer" : "not-allowed",
              "&:hover": {
                transform: allowAnalyze ? "scale(1.05)" : "none",
              },
            }}
          >
            Phân tích với AI
          </Button>
        </Box>
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        gap={1}
        sx={{
          backgroundColor: "#f8fafc",
          borderRadius: 2,
          p: 1,
          border: "1px solid #e2e8f0",
        }}
      >
        {Array.from({ length: totalItems }, (_, i) => {
          const isCurrent = i === currentIndex;
          const isPassed = passedIndices.has(i);

          const chipStyles = isCurrent
            ? { backgroundColor: "#2563eb", color: "#fff" }
            : isPassed
            ? { backgroundColor: "#dcfce7", color: "#166534" }
            : { backgroundColor: "#f1f5f9", color: "#475569" };

          return (
            <Chip
              key={`timing-${i}`}
              label={`Câu ${i + 1}`}
              size="small"
              clickable
              onClick={() => onJumpTo(i)}
              sx={{
                fontWeight: 700,
                ...chipStyles,
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
