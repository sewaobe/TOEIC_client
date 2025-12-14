import React, { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  Avatar,
} from "@mui/material";
import { IAdjustmentRequest, AdjustmentStatus } from "../../types/adjustment";
import { adjustmentService } from "../../services/adjustment.service";
import { toast } from "sonner";

interface AdjustmentRequestDialogProps {
  open: boolean;
  onClose: () => void;
  request: IAdjustmentRequest | null;
  onResponded: () => void;
}

export const AdjustmentRequestDialog: React.FC<
  AdjustmentRequestDialogProps
> = ({ open, onClose, request, onResponded }) => {
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    if (open) {
      setRejectReason("");
      setShowRejectInput(false);
    }
  }, [open]);

  if (!request) return null;

  const theme = useTheme();
  const status = request.status || "PENDING";
  const isPending = status === AdjustmentStatus.PENDING;
  const isApproved = status === AdjustmentStatus.APPROVED;
  const isRejected = status === AdjustmentStatus.REJECTED;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await adjustmentService.respondToRequest(
        request._id,
        AdjustmentStatus.APPROVED
      );
      toast.success("Đã chấp nhận thay đổi lộ trình!");
      // Phát sự kiện toàn cục để component đang hiển thị ngày/tuần có thể reload dữ liệu
      try {
        window.dispatchEvent(
          new CustomEvent("adjustment:responded", { detail: { request: res } })
        );
      } catch (e) {
        console.warn("Không thể dispatch event adjustment:responded", e);
      }
      onResponded();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xử lý yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    setLoading(true);
    try {
      const res = await adjustmentService.respondToRequest(
        request._id,
        AdjustmentStatus.REJECTED,
        rejectReason
      );
      toast.success("Đã từ chối yêu cầu.");
      try {
        window.dispatchEvent(
          new CustomEvent("adjustment:responded", { detail: { request: res } })
        );
      } catch (e) {
        console.warn("Không thể dispatch event adjustment:responded", e);
      }
      onResponded();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xử lý yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <span>Đề xuất điều chỉnh lộ trình</span>
          {isPending && <Chip label="Đang chờ" color="warning" size="small" />}
          {isApproved && (
            <Chip label="Đã chấp nhận" color="success" size="small" />
          )}
          {isRejected && <Chip label="Đã từ chối" color="error" size="small" />}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            src={request.collaboratorId.avatar}
            alt={request.collaboratorId.fullName}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {request.collaboratorId.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Giảng viên hướng dẫn
            </Typography>
          </Box>
        </Box>

        <Box bgcolor="grey.50" p={2} borderRadius={2} mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Lời nhắn:
          </Typography>
          <Typography variant="body1" fontStyle="italic">
            "{request.reason}"
          </Typography>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Chi tiết thay đổi:
        </Typography>
        <List dense>
          {request.changes.map((change, index) => {
            // Tạo text mô tả chi tiết vị trí
            const locationText = [
              change.weekTitle ||
                (change.weekNumber ? `Tuần ${change.weekNumber}` : ""),
              change.dayTitle ||
                (change.dayNumber ? `Ngày ${change.dayNumber}` : ""),
            ]
              .filter(Boolean)
              .join(", ");

            // Tạo text mô tả hành động
            let actionText = "";
            if (change.action === "REMOVE") {
              actionText = `Xóa "${change.lessonTitle || "Bài học"}"`;
            } else if (change.action === "ADD") {
              actionText = `Thêm "${change.lessonTitle || "Bài học"}"`;
            } else if (change.action === "REPLACE") {
              actionText = `Thay "${change.oldLessonTitle || "Bài cũ"}" bằng "${
                change.lessonTitle || "Bài mới"
              }"`;
            }

            const fullText = locationText
              ? `${actionText} ở ${locationText}`
              : actionText;

            return (
              <ListItem
                key={index}
                sx={{
                  borderBottom: "1px solid #eee",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  py: 1.5,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Chip
                    size="small"
                    label={
                      change.action === "REMOVE"
                        ? "Xóa"
                        : change.action === "ADD"
                        ? "Thêm"
                        : "Thay thế"
                    }
                    color={
                      change.action === "REMOVE"
                        ? "error"
                        : change.action === "ADD"
                        ? "success"
                        : "info"
                    }
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {fullText}
                  </Typography>
                </Box>
                {change.note && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ pl: 1, fontStyle: "italic" }}
                  >
                    Ghi chú: {change.note}
                  </Typography>
                )}
              </ListItem>
            );
          })}
        </List>

        {showRejectInput && (
          <Box mt={2}>
            <TextField
              autoFocus
              fullWidth
              label="Lý do từ chối"
              placeholder="Tại sao bạn không đồng ý với thay đổi này?"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              multiline
              rows={2}
            />
          </Box>
        )}

        {/* Nếu đã phản hồi, hiển thị box tóm tắt trạng thái và lý do (nếu có) */}
        {!isPending && (
          <Box
            mt={2}
            p={2}
            borderRadius={2}
            sx={{
              bgcolor: isApproved
                ? theme.palette.success.light
                : theme.palette.error.light,
              color: isApproved
                ? theme.palette.success.contrastText
                : theme.palette.error.contrastText,
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              {isApproved
                ? "✅ Yêu cầu đã được bạn chấp nhận"
                : "❌ Yêu cầu đã bị bạn từ chối"}
            </Typography>
            {isRejected && request.rejectionReason && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Lý do: {request.rejectionReason}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Đóng
        </Button>
        {/* Chỉ hiển thị hành động khi đang chờ */}
        {isPending && (
          <>
            {!showRejectInput && (
              <Button onClick={handleReject} color="error" disabled={loading}>
                Từ chối
              </Button>
            )}
            {showRejectInput && (
              <Button
                onClick={handleReject}
                variant="contained"
                color="error"
                disabled={loading}
              >
                Xác nhận từ chối
              </Button>
            )}
            {!showRejectInput && (
              <Button
                onClick={handleApprove}
                variant="contained"
                color="primary"
                disabled={loading}
              >
                Đồng ý
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
