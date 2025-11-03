import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Typography,
  Avatar,
  Box,
  Divider,
} from "@mui/material";
import {
  Info,
  Chat,
  ErrorOutline,
  Comment,
  BugReport,
  WarningAmber,
  LibraryBooks,
  NotificationsNone,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { Notification } from "../../types/Notification";

interface NotificationDetailDialogProps {
  open: boolean;
  onClose: () => void;
  notification: Notification | null;
}

export default function NotificationDetailDialog({
  open,
  onClose,
  notification,
}: NotificationDetailDialogProps) {
  const theme = useTheme();

  const renderIcon = (type: Notification["type"]) => {
    switch (type) {
      case "chat":
        return <Chat sx={{ color: theme.palette.primary.main }} fontSize="small" />;
      case "comment":
        return <Comment sx={{ color: theme.palette.success.main }} fontSize="small" />;
      case "error":
        return <ErrorOutline sx={{ color: theme.palette.error.main }} fontSize="small" />;
      case "test":
        return <Info sx={{ color: theme.palette.warning.main }} fontSize="small" />; // icon cảnh báo nhẹ
      case "lesson":
        return <Info sx={{ color: theme.palette.info.main }} fontSize="small" />;
      case "flashcard":
        return <Info sx={{ color: theme.palette.secondary.main }} fontSize="small" />;
      case "chatbot":
        return <Chat sx={{ color: theme.palette.info.main }} fontSize="small" />;
      case "other":
        return <Info sx={{ color: theme.palette.text.secondary }} fontSize="small" />;
      case "system":
      default:
        return <NotificationsNone sx={{ color: theme.palette.text.primary }} fontSize="small" />;
    }
  };

  const renderExtraContent = () => {
    if (!notification) return null;
    switch (notification.type) {
      case "chat":
        return (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Tin nhắn đến từ người dùng: <b>{notification.senderId || "Ẩn danh"}</b>
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => alert("Đi đến đoạn chat")}
            >
              Mở đoạn chat
            </Button>
          </Box>
        );
      case "comment":
        return (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Bình luận mới từ: <b>{notification.senderId || "Người dùng"}</b>
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={() => alert("Xem bài thi liên quan")}
            >
              Xem bài thi
            </Button>
          </Box>
        );
      case "error":
        return (
          <Box mt={2} display="flex" alignItems="center" gap={1}>
            <WarningAmber color="error" />
            <Typography variant="body2" color="error">
              Hãy kiểm tra lại cấu hình hoặc liên hệ quản trị viên.
            </Typography>
          </Box>
        );
      case "system":
        return (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Thông báo từ hệ thống – không yêu cầu phản hồi.
            </Typography>
            {notification.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, whiteSpace: "pre-line" }}
              >
                Chi tiết: {notification.description}
              </Typography>
            )}
          </Box>
        );
      case "test":
        return (
          <Box mt={2}>
            <Typography variant="body2" color="text.disabled">
              Thông báo liên quan đến bài kiểm tra.
              Vui lòng kiểm tra trang quản lý bài kiểm tra để biết thêm chi tiết.
            </Typography>
            {notification.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, whiteSpace: "pre-line" }}
              >
                Chi tiết: {notification.description}
              </Typography>
            )}
          </Box>
        );
      case "lesson":
        return (
          <Box mt={2}>
            <Typography variant="body2" color="text.disabled">
              Thông báo liên quan đến quản lý bài học.
              Vui lòng kiểm tra trang quản lý bài học để biết thêm chi tiết.
            </Typography>
            {notification.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, whiteSpace: "pre-line" }}
              >
                Chi tiết: {notification.description}
              </Typography>
            )}
          </Box>
        );
      case "flashcard":
        return (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Liên quan đến thẻ ghi nhớ (Flashcard). Vui lòng kiểm tra tiến độ ôn tập của bạn.
            </Typography>
            {notification.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, whiteSpace: "pre-line" }}
              >
                Chi tiết: {notification.description}
              </Typography>
            )}
          </Box>
        );
      case "chatbot":
        return (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Chatbot TOEIC Smart gửi thông báo hỗ trợ học tập tự động.
            </Typography>
            {notification.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, whiteSpace: "pre-line" }}
              >
                Chi tiết: {notification.description}
              </Typography>
            )}
          </Box>
        );
      case "other":
        return (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              Thông báo khác hoặc không xác định.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, p: 1.5 },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        Chi tiết thông báo
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {notification ? (
          <>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.action.hover,
                  width: 46,
                  height: 46,
                }}
              >
                {renderIcon(notification.type)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.createdAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />
            {renderExtraContent()}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Không tìm thấy thông báo
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
