import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Box, Typography, Button, Paper } from "@mui/material";
import CelebrationIcon from "@mui/icons-material/Celebration";
import ReplayIcon from "@mui/icons-material/Replay";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { motion } from "framer-motion";

interface PracticeCompletionCardProps {
  type: "flashcard" | "shadowing" | "dictation";
  accuracy?: number;
  total?: number;
  avgTime?: number;
  onRetry?: () => void;
  onViewStats?: () => void;
  onGoHome?: () => void;
}

const typeLabel = {
  flashcard: "Flashcards",
  shadowing: "Shadowing",
  dictation: "Dictation",
};

const PracticeCompletionCard: React.FC<PracticeCompletionCardProps> = ({
  type,
  accuracy,
  total,
  avgTime,
  onRetry,
  onViewStats,
  onGoHome,
}) => {
  useEffect(() => {
    const audio = new Audio('/audio/fireworks-07-419025.mp3');
    audio.volume = 0.3;
    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
    });

    // Tạo hiệu ứng confetti khi card mount
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    (function frame() {
      confetti({
        particleCount: 4,
        startVelocity: 35,
        spread: 60,
        origin: {
          x: Math.random(),
          y: randomInRange(0.5, 0.9),
        },
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          background: "linear-gradient(145deg, #F9FAFB, #F0FDF4)",
        }}
      >
        <CelebrationIcon sx={{ fontSize: 70, color: "success.main", mb: 1 }} />

        <Typography variant="h5" fontWeight={700}>
          Chúc mừng bạn đã hoàn thành buổi luyện tập {typeLabel[type]}!
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Bạn đã hoàn thành <b>{total ?? 0}</b>{" "}
          {type === "flashcard" ? "từ vựng" : "bài"} với độ chính xác{" "}
          <b>{accuracy ?? 0}%</b>.
        </Typography>

        {avgTime !== undefined && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            ⏱️ Thời gian trung bình: {avgTime}s /{" "}
            {type === "flashcard" ? "từ" : "bài"}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
          <Button variant="contained" startIcon={<ReplayIcon />} onClick={onRetry}>
            Làm lại
          </Button>
          <Button variant="outlined" startIcon={<InsightsOutlinedIcon />} onClick={onViewStats}>
            Xem kết quả
          </Button>
          <Button variant="text" startIcon={<HomeOutlinedIcon />} onClick={onGoHome}>
            Trang luyện tập
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default PracticeCompletionCard;
