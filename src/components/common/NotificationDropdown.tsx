import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsNone from '@mui/icons-material/NotificationsNone';
import Chat from '@mui/icons-material/Chat';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import Comment from '@mui/icons-material/Comment';
import Info from '@mui/icons-material/Info';

import {
  Badge,
  Popper,
  Paper,
  ClickAwayListener,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Typography,
  Box,
  Fade,
  Button,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNotifications } from "../../hooks/useNotifications";
import { Notification } from "../../types/Notification";
import NotificationDetailDialog from "./NotificationDetailDialog";
import { useAdjustment } from "../../contexts/AdjustmentContext";

const MotionIconButton = motion(IconButton);

export default function NotificationDropdown() {
  const theme = useTheme();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    hasNew,
    resetNew,
    loadMore,
    hasMore,
    isLoading,
  } = useNotifications();
  const { openDialogWithRequest } = useAdjustment();

  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false); // ✅ NEW

  const handleOpenDetail = async (notif: Notification) => {
    console.log("🔔 Click notification:", notif);

    // Nếu notification có adjustmentRequestId → mở adjustment dialog thay vì detail dialog
    if (notif.metadata?.adjustmentRequestId) {
      console.log(
        "📋 Mở adjustment dialog với ID:",
        notif.metadata.adjustmentRequestId
      );
      // Đảm bảo đóng dropdown và đóng mọi dialog chi tiết đang mở
      handleClose(); // Đóng dropdown
      setSelectedNotif(null);
      setOpenDetail(false);
      if (!notif.isRead) markAsRead(notif.id);
      await openDialogWithRequest(notif.metadata.adjustmentRequestId);
      return;
    }

    // Nếu không có metadata → mở detail dialog như bình thường
    console.log("📄 Mở detail dialog");
    setSelectedNotif(notif);
    setOpenDetail(true);
    if (!notif.isRead) markAsRead(notif.id);
  };

  const handleCloseDetail = () => {
    setIsDialogClosing(true); // ✅ đánh dấu đang đóng dialog
    setOpenDetail(false);
    setTimeout(() => setIsDialogClosing(false), 250); // đợi animation xong rồi reset
  };

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (hasNew) {
      const timer = setTimeout(() => resetNew(), 1200);
      return () => clearTimeout(timer);
    }
  }, [hasNew, resetNew]);

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(open ? null : event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const renderIcon = (type: Notification["type"]) => {
    switch (type) {
      case "chat":
        return (
          <Chat sx={{ color: theme.palette.primary.main }} fontSize="small" />
        );
      case "comment":
        return (
          <Comment
            sx={{ color: theme.palette.success.main }}
            fontSize="small"
          />
        );
      case "error":
        return (
          <ErrorOutline
            sx={{ color: theme.palette.error.main }}
            fontSize="small"
          />
        );
      case "test":
        return (
          <Info sx={{ color: theme.palette.warning.main }} fontSize="small" />
        ); // icon cảnh báo nhẹ
      case "lesson":
        return (
          <Info sx={{ color: theme.palette.info.main }} fontSize="small" />
        );
      case "flashcard":
        return (
          <Info sx={{ color: theme.palette.secondary.main }} fontSize="small" />
        );
      case "chatbot":
        return (
          <Chat sx={{ color: theme.palette.info.main }} fontSize="small" />
        );
      case "other":
        return (
          <Info sx={{ color: theme.palette.text.secondary }} fontSize="small" />
        );
      case "system":
      default:
        return (
          <NotificationsNone
            sx={{ color: theme.palette.text.primary }}
            fontSize="small"
          />
        );
    }
  };

  const getAvatarColor = (type: Notification["type"]) => {
    switch (type) {
      case "chat":
        return theme.palette.info.light;
      case "comment":
        return theme.palette.success.light;
      case "error":
        return theme.palette.error.light;
      case "test":
        return theme.palette.warning.light;
      case "lesson":
        return theme.palette.info.light;
      case "flashcard":
        return theme.palette.secondary.light;
      case "chatbot":
        return theme.palette.info.light;
      case "system":
      case "other":
      default:
        return theme.palette.grey[200];
    }
  };

  return (
    <>
      {/* 🔔 Nút chuông */}
      <Tooltip title="Thông báo" enterDelay={300}>
        <MotionIconButton
          color="default"
          onClick={handleToggle}
          sx={{
            p: 1,
            bgcolor: open ? theme.palette.action.hover : "transparent",
            "&:hover": { bgcolor: theme.palette.action.hover },
            position: "relative",
          }}
          animate={hasNew ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <Badge
            badgeContent={unreadCount > 0 ? unreadCount : null}
            color="error"
            overlap="circular"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.7rem",
                height: "18px",
                minWidth: "18px",
              },
            }}
          >
            <NotificationsNone sx={{ fontSize: 26 }} />
          </Badge>
          {hasNew && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          )}
        </MotionIconButton>
      </Tooltip>

      {/* 💬 Popper Dropdown */}
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-end"
        transition
        modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
        disablePortal={false}
        sx={{ zIndex: 1299 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              sx={{
                width: 340,
                maxHeight: 440,
                overflowY: "auto",
                borderRadius: 2,
                boxShadow: theme.shadows[4],
                backgroundColor: theme.palette.background.paper,
                scrollbarWidth: "thin", // Firefox
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: theme.palette.grey[400],
                  borderRadius: "3px",
                },
              }}
            >
              <ClickAwayListener
                onClickAway={(event) => {
                  if (openDetail || isDialogClosing) return;
                  handleClose();
                }}
              >
                <Box>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      py: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.action.hover,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Thông báo
                    </Typography>
                    <Button
                      size="small"
                      onClick={markAllAsRead}
                      sx={{
                        color: theme.palette.primary.main,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  </Box>

                  {/* Danh sách */}
                  <List disablePadding>
                    {notifications.length === 0 ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "center", py: 4, fontWeight: 500 }}
                      >
                        Không có thông báo
                      </Typography>
                    ) : (
                      <AnimatePresence initial={false}>
                        {notifications.map((n, idx) => (
                          <motion.div
                            key={n.id || n.createdAt}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                          >
                            <ListItem
                              alignItems="flex-start"
                              onClick={() => handleOpenDetail(n)}
                              sx={{
                                cursor: "pointer",
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: n.isRead
                                  ? "transparent"
                                  : theme.palette.mode === "light"
                                    ? `${theme.palette.primary.main}1F` // màu primary nhạt (opacity 12%)
                                    : `${theme.palette.primary.light}22`,
                                "&:hover": {
                                  bgcolor: theme.palette.action.selected,
                                  transform: "translateY(-1px)",
                                  transition: "all 0.15s ease-in-out",
                                },
                                transition: "background-color 0.2s",
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: getAvatarColor(n.type),
                                  }}
                                >
                                  {renderIcon(n.type)}
                                </Avatar>
                              </ListItemAvatar>

                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: theme.palette.text.primary,
                                      fontWeight: n.isRead ? 400 : 600,
                                      lineHeight: 1.4,
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {n.message}
                                  </Typography>
                                }
                                secondary={
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: theme.palette.text.secondary,
                                      mt: 0.4,
                                      display: "block",
                                    }}
                                  >
                                    {new Date(n.createdAt).toLocaleString(
                                      "vi-VN",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        day: "2-digit",
                                        month: "2-digit",
                                      }
                                    )}
                                  </Typography>
                                }
                              />
                            </ListItem>

                            {/* Divider giữa các item */}
                            {idx < notifications.length - 1 && (
                              <Divider
                                sx={{
                                  mx: 2,
                                  borderColor: theme.palette.divider,
                                  opacity: 0.6,
                                }}
                              />
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}

                    {/* ⚙️ Nút Xem thêm + loader */}
                    {hasMore && (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 1.5,
                          borderTop: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress
                            size={22}
                            sx={{ color: theme.palette.primary.main }}
                          />
                        ) : (
                          <Button
                            size="small"
                            onClick={loadMore}
                            sx={{
                              textTransform: "none",
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                            }}
                          >
                            Xem thêm
                          </Button>
                        )}
                      </Box>
                    )}
                  </List>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
      <NotificationDetailDialog
        open={openDetail}
        onClose={handleCloseDetail}
        notification={selectedNotif}
      />
    </>
  );
}
