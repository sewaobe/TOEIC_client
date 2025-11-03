import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Box,
  Typography,
  Button,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";

interface BannedAccountModalProps {
  open: boolean;
  onClose: () => void;
  banInfo: {
    status: "banned" | "banned_permanent";
    banned_reason: string;
    banned_at?: string;
    banned_by: string;
    is_permanent: boolean;
  } | null;
}

const BannedAccountModal: React.FC<BannedAccountModalProps> = ({
  open,
  onClose,
  banInfo,
}) => {
  if (!banInfo) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không rõ";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <BlockIcon color="error" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700} color="error">
            Tài khoản bị khóa
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Alert
            severity={banInfo.is_permanent ? "error" : "warning"}
            icon={<ErrorOutlineIcon />}
            sx={{ borderRadius: 2 }}
          >
            <Typography variant="body2" fontWeight={600}>
              {banInfo.is_permanent
                ? "Tài khoản của bạn đã bị khóa vĩnh viễn"
                : "Tài khoản của bạn đang bị khóa tạm thời"}
            </Typography>
          </Alert>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Lý do khóa tài khoản:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              {banInfo.banned_reason || "Không có lý do cụ thể"}
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Thời gian khóa:{" "}
                <Typography
                  component="span"
                  fontWeight={600}
                  color="text.primary"
                >
                  {formatDate(banInfo.banned_at)}
                </Typography>
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Người thực hiện:{" "}
                <Typography
                  component="span"
                  fontWeight={600}
                  color="text.primary"
                >
                  {banInfo.banned_by}
                </Typography>
              </Typography>
            </Box>
          </Stack>

          <DialogContentText
            sx={{ fontSize: "0.875rem", color: "text.secondary" }}
          >
            {banInfo.is_permanent
              ? "Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là một sai lầm."
              : "Nếu bạn có thắc mắc về việc khóa tài khoản, vui lòng liên hệ với quản trị viên."}
          </DialogContentText>

          <Box display="flex" justifyContent="flex-end" gap={2} pt={1}>
            <Button
              onClick={onClose}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2, px: 4 }}
            >
              Đóng
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default BannedAccountModal;
