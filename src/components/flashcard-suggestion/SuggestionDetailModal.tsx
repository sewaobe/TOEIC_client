import React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  CalendarMonth,
  Close,
  ErrorOutline,
  MenuBook,
  PlayArrow,
  VolumeUp,
} from "@mui/icons-material";
import { SuggestionDetail, SuggestionReason } from "../../types/UserVocabularyProgressV2";
import { speakText } from "../../utils/tts.util";

interface SuggestionDetailModalProps {
  open: boolean;
  detail: SuggestionDetail | null;
  isSelected?: boolean;
  onAddToSelection?: (vocabularyId: string) => void;
  onClose: () => void;
}

const severityColor: Record<SuggestionReason["severity"], string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#2563eb",
};

const severityBg: Record<SuggestionReason["severity"], string> = {
  high: "#fff1f2",
  medium: "#fff7ed",
  low: "#eff6ff",
};

const SuggestionDetailModal: React.FC<SuggestionDetailModalProps> = ({
  open,
  detail,
  isSelected = false,
  onAddToSelection,
  onClose,
}) => {
  if (!detail) {
    return null;
  }

  const pRecallPercent = Math.round(detail.p_recall * 100);
  const probabilityColor =
    pRecallPercent < 25
      ? "#ef4444"
      : pRecallPercent < 65
        ? "#f59e0b"
        : "#10b981";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3, maxWidth: 760 } }}
    >
      <DialogTitle sx={{ px: 2.5, py: 1.5, textAlign: "center", fontSize: 15, fontWeight: 900 }}>
        Chi tiết gợi ý
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 10, color: "text.secondary" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pb: 2.5, pt: 0 }} className="no-scrollbar">
        <Stack spacing={1.5}>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
            <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 900 }}>
              1. Thông tin từ vựng
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mt: 1.2 }}>
              <IconButton onClick={() => speakText(detail.word)} size="small" sx={{ color: "#2563eb", bgcolor: "#dbeafe" }}>
                <VolumeUp sx={{ fontSize: 17 }} />
              </IconButton>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                    {detail.word}
                  </Typography>
                  {detail.topic_title && (
                    <Chip label={detail.topic_title} size="small" sx={{ height: 20, bgcolor: "#dbeafe", color: "#2563eb", fontWeight: 800 }} />
                  )}
                  {detail.level && (
                    <Chip label={detail.level} size="small" sx={{ height: 20, bgcolor: "#dbeafe", color: "#2563eb", fontWeight: 800 }} />
                  )}
                </Stack>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {detail.phonetic}
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 1.3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                    Nghĩa
                  </Typography>
                  <Typography variant="body2">{detail.meaning}</Typography>
                </Stack>
                <Stack spacing={0.4} sx={{ mt: 1.1 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                    Ví dụ
                  </Typography>
                  {detail.examples && detail.examples.length > 0
                    ? detail.examples.map(example => {
                      return <React.Fragment key={example.en}>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {example.en}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                          {example.vi}
                        </Typography>
                      </React.Fragment>
                    })
                    : <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Chưa có ví dụ cho từ vựng này
                    </Typography>
                  }
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
            <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 900 }}>
              2. Vì sao được gợi ý
            </Typography>
            <Stack spacing={1} sx={{ mt: 1.2 }}>
              {detail.reasons.map((reason) => (
                <Paper
                  key={reason.code}
                  elevation={0}
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    border: `1px solid ${severityColor[reason.severity]}22`,
                    bgcolor: severityBg[reason.severity],
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        bgcolor: severityColor[reason.severity],
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ErrorOutline sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>
                        {reason.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {reason.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
            <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 900 }}>
              3. Chỉ số ghi nhớ
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, rowGap: 1.2, columnGap: 2, mt: 1.2 }}>
              <Metric icon={<MenuBook />} label="Độ khó" value={`${detail.difficulty}/18`} tone="#2563eb" />
              <Metric icon={<ErrorOutline />} label="Xác suất nhớ" value={`${pRecallPercent}%`} tone={probabilityColor} />
              <Metric icon={<AccessTime />} label="Half-life" value={`${detail.half_life_days} ngày`} />
              <Metric icon={<CalendarMonth />} label="Dự kiến ôn" value={formatDueLabel(detail.due_at)} tone="#f59e0b" />
              <Metric icon={<MenuBook />} label="Lần ôn gần nhất" value={formatRelativeDate(detail.last_reviewed_at)} />
              <Metric icon={<AccessTime />} label="Thời gian phản hồi gần nhất" value={formatResponseTime(detail.last_response_time_avg_ms)} tone="#10b981" />
            </Box>
          </Paper>

          <Divider />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="flex-end">
            <Button variant="contained" startIcon={<PlayArrow />} sx={{ borderRadius: 2, fontWeight: 700 }}>
              Ôn từ này ngay
            </Button>
            <Button
              variant="outlined"
              disabled={isSelected}
              onClick={() => onAddToSelection?.(detail.vocabulary_id)}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {isSelected ? "Đã thêm vào lựa chọn" : "Thêm vào lựa chọn"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

interface MetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}

const Metric: React.FC<MetricProps> = ({ icon, label, value, tone = "#2563eb" }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
    <Box sx={{ color: "#64748b", display: "flex", "& svg": { fontSize: 17 } }}>{icon}</Box>
    <Typography variant="caption" sx={{ color: "text.secondary", flex: 1 }}>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 900, color: tone, whiteSpace: "nowrap" }}>
      {value}
    </Typography>
  </Stack>
);

function formatDueLabel(date: string | null): string {
  if (!date) return "Chưa có lịch";
  const due = new Date(date);
  const today = new Date();
  return due.toDateString() === today.toDateString() ? "Hôm nay" : due.toLocaleDateString("vi-VN");
}

function formatRelativeDate(date: string | null): string {
  if (!date) return "Chưa ôn";
  const diffDays = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000)));
  if (diffDays === 0) return "Hôm nay";
  return `${diffDays} ngày trước`;
}

function formatResponseTime(value: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Chưa có";
  }

  return `${(value / 1000).toFixed(1)} giây`;
}

export default SuggestionDetailModal;
