import type { ReactNode } from "react";
import { Alert, Box, Typography } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";

interface DictationFeedbackPanelProps {
  showAnswer: boolean;
  accuracy: number;
  passed: boolean;
  userText: ReactNode;
  transcriptText: ReactNode;
}

export default function DictationFeedbackPanel({
  showAnswer,
  accuracy,
  passed,
  userText,
  transcriptText,
}: DictationFeedbackPanelProps) {
  if (!showAnswer) return null;

  return (
    <Box>
      {passed ? (
        <Alert
          icon={<CheckCircleIcon />}
          severity="success"
          sx={{ mt: 1, borderRadius: 2 }}
        >
          Tuyệt vời! Bạn đã nghe chính xác toàn bộ câu này.
        </Alert>
      ) : (
        <Alert
          icon={<ErrorIcon />}
          severity="warning"
          sx={{ mt: 1, borderRadius: 2 }}
        >
          Bạn đạt khoảng {accuracy}%. Nghe lại đoạn này và sửa những phần còn sai nhé.
        </Alert>
      )}

      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          backgroundColor: "#f9fafb",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
          Đáp án của người dùng:
        </Typography>
        <Typography
          variant="body1"
          component="div"
          sx={{
            mt: 0.5,
            color: "text.primary",
            backgroundColor: "#fff",
            borderRadius: 1,
            p: 1.2,
            border: "1px solid #e5e7eb",
            fontStyle: "normal",
          }}
        >
          {userText}
        </Typography>

        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Transcript gốc:
        </Typography>
        <Typography
          variant="body1"
          component="div"
          sx={{
            mt: 0.5,
            color: "#1e3a8a",
            backgroundColor: "#eef2ff",
            borderRadius: 1,
            p: 1.2,
            border: "1px solid #c7d2fe",
          }}
        >
          {transcriptText}
        </Typography>
      </Box>
    </Box>
  );
}
