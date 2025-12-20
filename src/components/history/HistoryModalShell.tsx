import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export type HistoryLessonType =
  | "flash_card"
  | "dictation"
  | "shadowing"
  | "quiz"
  | "mini_test";

export interface BaseAttemptSummary {
  id: string;
  type: HistoryLessonType;
  started_at: string; // ISO
  finished_at?: string; // ISO
  durationSec?: number;
  scoreLabel: string;
  scoreValue?: number;
  submit_type: string;
  meta?: Record<string, any>;
}

export interface HistoryModalShellProps {
  open: boolean;
  onClose: () => void;
  lessonTitle?: string;
  lessonType?: HistoryLessonType;
  loading: boolean;
  attempts: BaseAttemptSummary[];
  selectedAttemptId?: string;
  onSelectAttempt?: (id: string) => void;
  renderAttemptDetail?: (attempt?: BaseAttemptSummary) => React.ReactNode;
}

export const HistoryModalShell: React.FC<HistoryModalShellProps> = ({
  open,
  onClose,
  lessonTitle,
  lessonType,
  loading,
  attempts,
  selectedAttemptId,
  onSelectAttempt,
  renderAttemptDetail,
}) => {
  const selectedAttempt = attempts.find((a) => a.id === selectedAttemptId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight={800}>
            Lịch sử học
          </Typography>
          {lessonType && (
            <Chip
              label={lessonType}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
        {lessonTitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {lessonTitle}
          </Typography>
        )}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ display: "flex", minHeight: 360 }}>
          {/* Left: attempts list */}
          <Box
            sx={{
              width: { xs: "40%", md: "35%" },
              borderRight: 1,
              borderColor: "divider",
              overflowY: "auto",
            }}
          >
            {loading ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Đang tải lịch sử...
                </Typography>
              </Box>
            ) : attempts.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Chưa có lịch sử cho bài học này.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {attempts.map((a) => {
                  const isSelected = a.id === selectedAttemptId;
                  return (
                    <React.Fragment key={a.id}>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => onSelectAttempt && onSelectAttempt(a.id)}
                        alignItems="flex-start"
                      >
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              spacing={1}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={isSelected ? 700 : 500}
                              >
                                {a.scoreLabel}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(a.started_at).toLocaleString()}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {a.submit_type}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Box>

          {/* Right: detail area */}
          <Box sx={{ flex: 1, p: 2.5 }}>
            {renderAttemptDetail ? (
              renderAttemptDetail(selectedAttempt)
            ) : selectedAttempt ? (
              <>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Chi tiết lần học
                </Typography>
                <Typography variant="body2">
                  Điểm: {selectedAttempt.scoreLabel}
                </Typography>
                {selectedAttempt.durationSec != null && (
                  <Typography variant="body2">
                    Thời lượng: {Math.round(selectedAttempt.durationSec)} giây
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Chọn một lần học ở danh sách bên trái để xem chi tiết.
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
