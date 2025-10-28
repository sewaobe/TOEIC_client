import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  LinearProgress,
  Avatar,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";

export interface LearningFlashcard {
  _id: string;
  session_id: string;
  topic: {
    _id: string;
    title: string;
    description: string;
    isPublic: boolean;
  };
  last_activity: string;
  progress_count: number;
  status: "active";
}

interface LearningFlashcardProps {
  item: LearningFlashcard;
  onClick?: (sessionId: string) => void;
  onDelete?: (id: string) => void;
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return "hôm qua";
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

const MyLearningFlashcard: React.FC<LearningFlashcardProps> = ({ item, onClick, onDelete }) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleClick = () => onClick?.(item.session_id);
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenConfirm(true);
  };

  const confirmDelete = () => {
    setOpenConfirm(false);
    onDelete?.(item._id);
  };

  const formattedDate = formatTimeAgo(item.last_activity);
  const progress = Math.min((item.progress_count / 20) * 100, 100);
  const accentColor = "#2196f3";

  return (
    <>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 2,
          border: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          minHeight: 180,
          position: "relative",
          transition: "all 0.3s",
          cursor: "pointer",
          "&:hover": { boxShadow: 6, transform: "scale(1.01)" },
          "&:hover .delete-btn": { opacity: 1 },
        }}
        onClick={handleClick}
      >
        {/* Nút xóa */}
        {onDelete && (
          <Tooltip title="Xóa học phần" arrow placement="top">
            <IconButton
              className="delete-btn"
              size="small"
              onClick={handleDelete}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                opacity: 0,
                transition: "opacity 0.2s ease",
                bgcolor: "rgba(255,0,0,0.05)",
                "&:hover": { bgcolor: "rgba(255,0,0,0.15)" },
              }}
            >
              <DeleteIcon color="error" fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Header */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              bgcolor: `${accentColor}20`,
              width: 44,
              height: 44,
            }}
          >
            <SchoolOutlinedIcon sx={{ color: accentColor }} />
          </Avatar>

          <Box flex={1} minWidth={0}>
            <Tooltip title={item.topic.title} arrow placement="top-start">
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "text.primary",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {item.topic.title}
              </Typography>
            </Tooltip>

            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {item.topic.description}
            </Typography>
          </Box>
        </Box>

        {/* Progress */}
        <Box sx={{ mt: 1.5 }}>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            Tiến độ học: <b>{item.progress_count}</b> lượt học
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 5,
              backgroundColor: "#f0f0f0",
              "& .MuiLinearProgress-bar": {
                background: `linear-gradient(to right, ${accentColor}, ${accentColor}80)`,
                transition: "width 0.4s ease",
              },
            }}
          />
        </Box>

        {/* Footer */}
        <Typography
          sx={{
            mt: 1.5,
            color: "text.secondary",
            fontStyle: "italic",
            fontSize: "0.75rem",
          }}
        >
          Cập nhật {formattedDate}
        </Typography>

        {/* Hiển thị trạng thái công khai / riêng tư */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Tooltip
            title={item.topic.isPublic ? "Danh sách công khai" : "Danh sách riêng tư"}
            arrow
            placement="top"
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {item.topic.isPublic ? (
                <PublicIcon sx={{ fontSize: 18, color: "primary.main" }} />
              ) : (
                <LockIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              )}
            </Box>
          </Tooltip>
        </Box>
      </Paper>

      {/* Modal xác nhận xóa */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} disableScrollLock>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa học phần{" "}
            <strong>{item.topic.title}</strong> không? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyLearningFlashcard;
