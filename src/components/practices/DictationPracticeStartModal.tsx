import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Headphones as HeadphonesIcon,
  Schedule as ScheduleIcon,
  Subtitles as SubtitlesIcon,
} from "@mui/icons-material";
import { Dictation } from "../../types/Dictation";
import { formatDuration } from "./DictationCard";

export type DictationDifficulty = "easy" | "medium" | "hard";

const practiceModes: Array<{
  value: DictationDifficulty;
  title: string;
  description: string;
  color: string;
}> = [
  {
    value: "easy",
    title: "Dễ",
    description: "Sắp xếp các từ cho trước theo nội dung nghe được.",
    color: "#22c55e",
  },
  {
    value: "medium",
    title: "Trung bình",
    description: "Điền các từ còn thiếu vào chỗ trống trong câu.",
    color: "#f59e0b",
  },
  {
    value: "hard",
    title: "Khó",
    description: "Nhập lại toàn bộ nội dung nghe được.",
    color: "#ef4444",
  },
];

interface DictationPracticeStartModalProps {
  dictation: Dictation | null;
  selectedDifficulty: DictationDifficulty;
  onSelectDifficulty: (difficulty: DictationDifficulty) => void;
  onClose: () => void;
  onStart: () => void;
}

export const DictationPracticeStartModal = ({
  dictation,
  selectedDifficulty,
  onSelectDifficulty,
  onClose,
  onStart,
}: DictationPracticeStartModalProps) => {
  const sentenceCount = dictation?.timings?.length || 1;

  return (
    <Dialog
      open={Boolean(dictation)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.24)",
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            <HeadphonesIcon />
          </Box>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              Bắt đầu luyện tập
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chọn chế độ luyện phù hợp với mục tiêu của bạn
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {dictation && (
          <Box
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              backgroundColor: "#fff",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1.25}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                minWidth={0}
                flex={1}
              >
                <Typography
                  fontWeight={800}
                  color="#0f172a"
                  noWrap
                  sx={{ minWidth: 0 }}
                >
                  {dictation.title}
                </Typography>
                <Chip
                  label={dictation.level || "N/A"}
                  size="small"
                  sx={{
                    height: 22,
                    fontWeight: 700,
                    backgroundColor: "#dcfce7",
                    color: "#15803d",
                    flexShrink: 0,
                  }}
                />
              </Box>

              <Stack direction="row" spacing={0.75} flexShrink={0}>
                <Chip
                  icon={<SubtitlesIcon sx={{ fontSize: "14px !important" }} />}
                  label={`${sentenceCount} câu`}
                  size="small"
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    backgroundColor: "#f8fafc",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    "& .MuiChip-icon": { color: "#64748b" },
                  }}
                />
                <Chip
                  icon={<ScheduleIcon sx={{ fontSize: "14px !important" }} />}
                  label={formatDuration(dictation.duration)}
                  size="small"
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    backgroundColor: "#f8fafc",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    "& .MuiChip-icon": { color: "#64748b" },
                  }}
                />
              </Stack>
            </Box>
          </Box>
        )}

        <Typography variant="body2" fontWeight={700} mb={1}>
          Chọn chế độ luyện
        </Typography>
        <Stack spacing={1.25}>
          {practiceModes.map((mode) => {
            const active = selectedDifficulty === mode.value;

            return (
              <Box
                key={mode.value}
                onClick={() => onSelectDifficulty(mode.value)}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: active ? "2px solid #2563eb" : "1px solid #e2e8f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  backgroundColor: active ? "#eff6ff" : "#fff",
                  transition:
                    "border-color 0.16s ease, background-color 0.16s ease",
                  "&:hover": {
                    borderColor: active ? "#2563eb" : "#bfdbfe",
                    backgroundColor: active ? "#eff6ff" : "#f8fafc",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "center",
                    gap: 0.35,
                    backgroundColor: `${mode.color}1a`,
                    pb: 0.8,
                    flexShrink: 0,
                  }}
                >
                  {[12, 18, 24].map((height) => (
                    <Box
                      key={height}
                      sx={{
                        width: 4,
                        height,
                        borderRadius: "999px",
                        backgroundColor: mode.color,
                      }}
                    />
                  ))}
                </Box>
                <Box flex={1}>
                  <Typography fontWeight={800} color="#0f172a">
                    {mode.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mode.description}
                  </Typography>
                </Box>
                <Radio checked={active} color="primary" />
              </Box>
            );
          })}
        </Stack>

        <Box display="flex" justifyContent="flex-end" gap={1.25} mt={3}>
          <Button variant="outlined" onClick={onClose} sx={{ px: 2.5 }}>
            Hủy
          </Button>
          <Button variant="contained" onClick={onStart} sx={{ px: 2.5 }}>
            Bắt đầu luyện
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
