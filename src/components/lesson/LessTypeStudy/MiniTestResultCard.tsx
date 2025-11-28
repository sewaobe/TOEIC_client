import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  Chip,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { motion } from "framer-motion";

interface PartAccuracy {
  part_name: string;
  accuracy: number;
}

interface MiniTestResultCardProps {
  score: number;
  parts: PartAccuracy[];
  onNext: () => void;
  onViewDetail?: () => void;
  onRetry?: () => void;
}

export const MiniTestResultCard: React.FC<MiniTestResultCardProps> = ({
  score,
  parts,
  onNext,
  onViewDetail,
  onRetry,
}) => {
  // Tính accuracy trung bình
  const avgAccuracy =
    parts.length > 0
      ? parts.reduce((sum, p) => sum + p.accuracy, 0) / parts.length
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto mt-8"
    >
      <Card
        sx={{
          borderRadius: "24px",
          textAlign: "center",
          p: 3,
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        }}
      >
        <CardContent>
          {/* Icon */}
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

          {/* Title */}
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
              🎉 Hoàn thành Mini Test!
            </Typography>
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: "#0f172a", mb: 1 }}
            >
              Điểm: {Math.round(score)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Độ chính xác trung bình: {avgAccuracy.toFixed(1)}%
            </Typography>
          </motion.div>

          {/* Parts Accuracy */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 2, textAlign: "left" }}
            >
              Độ chính xác theo từng phần:
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2,
                mb: 3,
              }}
            >
              {parts.map((part, idx) => {
                const accuracy = Math.round(part.accuracy);
                const color =
                  accuracy >= 80
                    ? "success"
                    : accuracy >= 60
                    ? "warning"
                    : "error";
                return (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      {part.part_name}
                    </Typography>
                    <Chip
                      label={`${accuracy}%`}
                      color={color}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
            >
              {onViewDetail && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onViewDetail}
                  sx={{ borderRadius: "12px" }}
                >
                  Xem chi tiết
                </Button>
              )}
              {onRetry && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onRetry}
                  sx={{ borderRadius: "12px" }}
                >
                  Làm lại
                </Button>
              )}
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
