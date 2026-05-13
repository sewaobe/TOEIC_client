import {
  Box,
  ButtonBase,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from "@mui/icons-material";

interface DictationHeaderProps {
  title: string;
  level?: string;
  totalItems: number;
  completed: number;
  overallProgress: number;
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
  onBack,
  currentIndex,
  passedIndices,
  onJumpTo,
}: DictationHeaderProps) {
  return (
    <Box mb={{ xs: 1.25, sm: 1.5, md: 1.75, lg: 2 }} className="dictation-header">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "auto 1fr",
            sm: "auto 1fr minmax(180px, 260px)",
            lg: "auto 1fr minmax(240px, 360px)",
            xl: "auto 1fr minmax(260px, 390px)",
          },
          alignItems: "center",
          gap: { xs: 1, sm: 1.25, md: 1.5, lg: 2.25 },
          mb: { xs: 1.25, sm: 1.5, lg: 2 },
        }}
      >
        {onBack ? (
          <IconButton
            onClick={onBack}
            aria-label="Quay lại danh sách"
            sx={{
              width: { xs: 32, sm: 36, lg: 40, xl: 42 },
              height: { xs: 32, sm: 36, lg: 40, xl: 42 },
              borderRadius: { xs: 1.5, lg: 2 },
              color: "#0f172a",
              backgroundColor: "#fff",
              border: "1px solid #dbe3ef",
              boxShadow: "0 10px 22px rgba(15, 23, 42, 0.07)",
              "&:hover": {
                backgroundColor: "#f8fafc",
                borderColor: "#c8d3e3",
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: { xs: 18, sm: 20, lg: 22 } }} />
          </IconButton>
        ) : (
          <Box sx={{ display: { xs: "none", sm: "block" }, width: 44 }} />
        )}

        <Box sx={{ minWidth: 0 }} className="dictation-header">
          <Typography
            component="h1"
            sx={{
              color: "#0f2a5f",
              fontSize: { xs: 24, sm: 28, md: 31, lg: 35, xl: 38 },
              fontWeight: 800,
              lineHeight: 1.05,
              overflowWrap: "anywhere",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              mt: { xs: 0.4, lg: 0.65 },
              color: "#5f6b7d",
              fontSize: { xs: 12, sm: 13, md: 13.5, lg: 14.5, xl: 15 },
              fontWeight: 500,
            }}
          >
            Luyện nghe chép chính tả · {level || "-"} · {totalItems} câu
          </Typography>
        </Box>

        <Box sx={{ width: "100%", gridColumn: { xs: "1 / -1", sm: "auto" } }}>
          <Typography
            sx={{
              color: "#334155",
              fontSize: { xs: 11.5, sm: 12.5, lg: 13.5 },
              fontWeight: 600,
              mb: { xs: 0.45, lg: 0.65 },
            }}
            className="dictation-progress"
          >
            Tiến độ {completed}/{totalItems}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{
              height: { xs: 5, sm: 6, lg: 7 },
              borderRadius: 999,
              backgroundColor: "#e8edf5",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
              },
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: { xs: 0.75, sm: 1, lg: 1.15 },
          overflowX: "auto",
          maxWidth: "100%",
          pb: 0.5,
          scrollbarWidth: "thin",
        }}
      >
        {Array.from({ length: totalItems }, (_, i) => {
          const isCurrent = i === currentIndex;
          const isPassed = passedIndices.has(i);

          return (
            <ButtonBase
              key={`timing-${i}`}
              onClick={() => onJumpTo(i)}
              sx={{
                flex: "0 0 auto",
                minWidth: { xs: 58, sm: 64, lg: 70 },
                height: { xs: 30, sm: 33, lg: 36 },
                px: { xs: 1, sm: 1.35, lg: 1.75 },
                borderRadius: { xs: 1.5, lg: 2 },
                border: "1px solid",
                borderColor: isCurrent ? "transparent" : "#dbe3ef",
                color: isCurrent ? "#fff" : isPassed ? "#16a34a" : "#334155",
                background: isCurrent
                  ? "linear-gradient(135deg, #2f6df6, #1d4ed8)"
                  : "#fff",
                fontWeight: 700,
                fontSize: { xs: 11.5, sm: 12.5, lg: 13.5 },
                transition: "transform 160ms ease, box-shadow 160ms ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                },
              }}
            >
              {isPassed && !isCurrent ? (
                <CheckCircleOutlineIcon sx={{ mr: 0.4, fontSize: { xs: 14, lg: 16 } }} />
              ) : null}
              Câu {i + 1}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
