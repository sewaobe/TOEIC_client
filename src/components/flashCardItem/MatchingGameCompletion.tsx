import { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  EmojiEvents,
  Replay,
  Home,
  CheckCircle,
  Timer,
  Speed,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { MatchingGameResult } from "./MatchingGame";

interface MatchingGameCompletionProps {
  result: MatchingGameResult;
  onRetry: () => void;
  onGoHome: () => void;
}

export default function MatchingGameCompletion({
  result,
  onRetry,
  onGoHome,
}: MatchingGameCompletionProps) {
  useEffect(() => {
    // Chỉ pháo hoa và nhạc vui khi đạt kết quả tốt (accuracy >= 80%)
    if (result.accuracy >= 80) {
      const audio = new Audio("/audio/fireworks-07-419025.mp3");
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });

      // Hiệu ứng pháo hoa liên tục
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ["#2563EB", "#60A5FA", "#F97316", "#10B981"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ["#2563EB", "#60A5FA", "#F97316", "#10B981"],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [result.accuracy]);

  const getMessage = () => {
    if (result.accuracy === 100 && result.wrongAttempts === 0) {
      return { text: "Hoàn hảo! Bạn quá xuất sắc! 🌟", color: "success.main" };
    } else if (result.accuracy === 100) {
      return {
        text: "Tuyệt vời! Hoàn thành tất cả! 🎉",
        color: "primary.main",
      };
    } else if (result.accuracy >= 80) {
      return {
        text: "Rất tốt! Tiếp tục phát huy nhé! 💪",
        color: "warning.main",
      };
    } else {
      return {
        text: "Đừng nản! Luyện tập thêm sẽ tiến bộ! 🔥",
        color: "error.main",
      };
    }
  };

  const message = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(145deg, #EFF6FF, #DBEAFE)",
          border: "2px solid",
          borderColor: "#60A5FA",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
          >
            <EmojiEvents
              sx={{
                fontSize: 80,
                color: "gold",
                filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.2))",
              }}
            />
          </motion.div>

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ mt: 2, color: message.color }}
          >
            {message.text}
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            🎮 Matching Game - Hoàn thành!
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Stats Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Điểm số */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {result.score || 0}
              </Typography>
              <Typography variant="caption">Điểm số</Typography>
            </CardContent>
          </Card>

          {/* Tổng cặp */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {result.correctPairs}/{result.totalPairs}
              </Typography>
              <Typography variant="caption">Cặp đúng</Typography>
            </CardContent>
          </Card>

          {/* Độ chính xác */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Speed sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {result.accuracy}%
              </Typography>
              <Typography variant="caption">Chính xác</Typography>
            </CardContent>
          </Card>

          {/* Thời gian */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
              color: "white",
              textAlign: "center",
            }}
          >
            <CardContent>
              <Timer sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {result.timeSpent}s
              </Typography>
              <Typography variant="caption">Thời gian</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Achievement message */}
        <Box
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.7)",
            p: 2,
            borderRadius: 2,
            mb: 3,
            textAlign: "center",
          }}
        >
          {result.accuracy === 100 && result.wrongAttempts === 0 ? (
            <Typography variant="body1" fontWeight="bold" color="success.dark">
              🏆 Thành tích: PERFECT! Không một lỗi nào và nhanh như chớp!
            </Typography>
          ) : result.accuracy === 100 ? (
            <Typography variant="body1" fontWeight="bold" color="primary">
              ⭐ Xuất sắc! Hoàn thành tất cả các cặp!
            </Typography>
          ) : result.wrongAttempts <= 2 ? (
            <Typography variant="body1" fontWeight="bold" color="info.main">
              💫 Rất tốt! Chỉ sai {result.wrongAttempts} lần thôi!
            </Typography>
          ) : result.score >= 800 ? (
            <Typography variant="body1" fontWeight="bold" color="warning.main">
              🚀 Điểm số cao! Bạn ghép rất nhanh!
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary">
              💪 Tiếp tục luyện tập để đạt kết quả tốt hơn nhé!
            </Typography>
          )}

          {result.score >= 1000 && (
            <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
              🎉 Bạn đã đạt trên 1000 điểm! Siêu thần tốc!
            </Typography>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Replay />}
            onClick={onRetry}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              background: "linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)",
              boxShadow: "0 3px 10px rgba(37, 99, 235, 0.3)",
              "&:hover": {
                background: "linear-gradient(45deg, #1D4ED8 30%, #2563EB 90%)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Chơi lại
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Home />}
            onClick={onGoHome}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
              },
            }}
          >
            Về trang chủ
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
}
