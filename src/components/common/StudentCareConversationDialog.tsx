import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { studentCareConversationService } from "../../services/student_care_conversation.service";
import { StudentCareConversation } from "../../types/StudentCareConversation";

interface StudentCareConversationDialogProps {
  open: boolean;
  conversationId: string | null;
  onClose: () => void;
}

export default function StudentCareConversationDialog({
  open,
  conversationId,
  onClose,
}: StudentCareConversationDialogProps) {
  const [conversation, setCareConversation] = useState<StudentCareConversation | null>(null);
  const [primaryCode, setPrimaryCode] = useState("");
  const [secondaryCode, setSecondaryCode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !conversationId) return;
    setLoading(true);
    setError("");
    setPrimaryCode("");
    setSecondaryCode("");
    setNote("");
    studentCareConversationService
      .getById(conversationId)
      .then(setCareConversation)
      .catch((err) => {
        console.error(err);
        setError("Không tải được câu hỏi hỗ trợ từ CTV.");
      })
      .finally(() => setLoading(false));
  }, [open, conversationId]);

  const selectedPrimary = useMemo(
    () => conversation?.primary_options.find((option) => option.code === primaryCode),
    [conversation, primaryCode]
  );
  const secondaryOptions = primaryCode
    ? conversation?.secondary_options_by_primary?.[primaryCode] || []
    : [];

  async function handleSubmit() {
    if (!conversation) return;
    setSubmitting(true);
    setError("");
    try {
      await studentCareConversationService.respond(conversation._id, {
        primaryAnswerCode: primaryCode,
        secondaryAnswerCode: secondaryCode || undefined,
        note,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Không gửi được phản hồi.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    Boolean(primaryCode) &&
    (!selectedPrimary?.requires_secondary || Boolean(secondaryCode)) &&
    conversation?.status === "waiting_for_response";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>CTV muốn trao đổi nhanh về việc học của bạn</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Typography>Đang tải...</Typography>
        ) : conversation ? (
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography fontWeight={600}>
              {conversation.signal_snapshot?.title || "Câu hỏi từ CTV"}
            </Typography>
            <Typography>{conversation.question_template?.sent_text}</Typography>
            {conversation.status !== "waiting_for_response" && (
              <Alert severity="info">Bạn đã phản hồi trao đổi này.</Alert>
            )}
            <Box>
              <Typography fontWeight={600} mb={0.5}>
                Lý do chính
              </Typography>
              <RadioGroup
                value={primaryCode}
                onChange={(event) => {
                  setPrimaryCode(event.target.value);
                  setSecondaryCode("");
                }}
              >
                {conversation.primary_options.map((option) => (
                  <FormControlLabel
                    key={option.code}
                    value={option.code}
                    control={<Radio />}
                    label={option.label}
                    disabled={conversation.status !== "waiting_for_response"}
                  />
                ))}
              </RadioGroup>
            </Box>
            {secondaryOptions.length > 0 && (
              <Box>
                <Typography fontWeight={600} mb={0.5}>
                  Chi tiết thêm
                </Typography>
                <RadioGroup
                  value={secondaryCode}
                  onChange={(event) => setSecondaryCode(event.target.value)}
                >
                  {secondaryOptions.map((option) => (
                    <FormControlLabel
                      key={option.code}
                      value={option.code}
                      control={<Radio />}
                      label={option.label}
                      disabled={conversation.status !== "waiting_for_response"}
                    />
                  ))}
                </RadioGroup>
              </Box>
            )}
            <TextField
              value={note}
              onChange={(event) => setNote(event.target.value)}
              label="Ghi chú thêm nếu cần"
              multiline
              minRows={2}
              disabled={conversation.status !== "waiting_for_response"}
            />
          </Box>
        ) : (
          <Typography>Không có dữ liệu trao đổi.</Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? "Đang gửi..." : "Gửi phản hồi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

