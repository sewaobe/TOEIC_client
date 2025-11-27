import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { motion } from "framer-motion";

interface LessonFinishCardProps {
  title?: string;
  message?: string;
  onRedo: () => void;
  onNext: () => void;
  onStats?: () => void;
  score?: number | null;
}

export const LessonFinishCard: React.FC<LessonFinishCardProps> = ({
  title = "Xuất sắc!",
  message = "Hãy tiếp tục duy trì phong độ này nhé.",
  onRedo,
  onNext,
  onStats,
  score = null,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // Easing mượt mà
      className="max-w-lg mx-auto mt-8"
    >
      <Card
        sx={{
          borderRadius: "24px", // Bo tròn nhiều hơn
          textAlign: "center",
          p: 3,
          // --- Hiệu ứng Glassmorphism ---
          backgroundColor: "rgba(255, 255, 255, 0.6)", // Nền trắng bán trong suốt
          backdropFilter: "blur(12px)", // Hiệu ứng mờ nền chính
          border: "1px solid rgba(255, 255, 255, 0.2)", // Viền kính tinh tế
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)", // Shadow mềm mại
        }}
      >
        <CardContent>
          {/* Icon được đặt trong một Box để tạo điểm nhấn */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(255, 165, 0, 0.4)",
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 40 }} />
            </Box>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ color: "#1a202c" }}
              gutterBottom
            >
              {title}
            </Typography>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {message}
            </Typography>

            {score !== null && (
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "#0f172a", mb: 3 }}
              >
                Điểm: {typeof score === "number" ? Math.round(score) : score}
              </Typography>
            )}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              {/* --- Phân cấp các nút hành động --- */}
              {onStats && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onStats}
                  sx={{ borderRadius: "12px" }}
                >
                  Xem thống kê
                </Button>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={onRedo}
                sx={{ borderRadius: "12px", boxShadow: "none" }}
              >
                Làm lại
              </Button>
              {/* Nút chính nổi bật nhất */}
              <Button
                variant="contained"
                onClick={onNext}
                sx={{
                  borderRadius: "12px",
                  fontWeight: 700,
                  color: "white",
                  background:
                    "linear-gradient(45deg, #1DA1F2 30%, #007BFF 90%)",
                  boxShadow: "0 4px 12px 0 rgba(0, 123, 255, 0.3)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 6px 20px 0 rgba(0, 123, 255, 0.4)",
                  },
                }}
              >
                Bài tiếp theo
              </Button>
            </Stack>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
