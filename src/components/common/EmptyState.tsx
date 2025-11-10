import { Box, Typography, CircularProgress, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface EmptyStateProps {
  mode: "loading" | "error" | "empty";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({ mode, title, description, icon }: EmptyStateProps) => {
  const theme = useTheme();
  let content;

  // 🎡 Loading
  if (mode === "loading") {
    content = (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">
          {title || "Đang tải dữ liệu..."}
        </Typography>
      </Box>
    );
  }

  // ❌ Error
  if (mode === "error") {
    content = (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        {icon || <ErrorOutlineIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />}
        <Typography variant="h6" sx={{ color: theme.palette.error.main }} fontWeight="bold">
          {title || "Có lỗi xảy ra"}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {description}
          </Typography>
        )}
      </Box>
    );
  }

  // 📦 Empty
  if (mode === "empty") {
    content = (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        {icon || <InboxOutlinedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          {title || "Không có dữ liệu"}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {description}
          </Typography>
        )}
      </Box>
    );
  }

  // ✨ Container chính — dùng theme cho border và background
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          py: 8,
          px: 4,
          borderRadius: 2,
          border: `1px dashed ${theme.palette.divider}`,
          bgcolor:
            theme.palette.mode === "dark"
              ? theme.palette.background.paper
              : theme.palette.grey[50],
          textAlign: "center",
          color: theme.palette.text.primary,
        }}
      >
        {content}
      </Box>
    </motion.div>
  );
};
