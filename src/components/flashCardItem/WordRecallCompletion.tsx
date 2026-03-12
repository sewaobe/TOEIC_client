import { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  EmojiEvents,
  Replay,
  Home,
  Stars,
  LocalFireDepartment,
  CheckCircle,
  Schedule,
  ErrorOutline,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { WordRecallResult } from "./WordRecallGame";

interface WordRecallCompletionProps {
  result: WordRecallResult;
  onRetry: () => void;
  onGoHome: () => void;
}

export default function WordRecallCompletion({
  result,
  onRetry,
  onGoHome,
}: WordRecallCompletionProps) {
  useEffect(() => {
    // Chỉ pháo hoa và nhạc vui khi đạt kết quả tốt (accuracy >= 80%)
    if (result.accuracy >= 80) {
      const audio = new Audio("/audio/fireworks-07-419025.mp3");
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });

      // Hiệu ứng pháo hoa đặc biệt
      const duration = 3500;
      const animationEnd = Date.now() + duration;
      const colors = ["#2563EB", "#F97316", "#10B981", "#60A5FA", "#34D399"];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors: colors,
          shapes: ["star", "circle"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors: colors,
          shapes: ["star", "circle"],
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [result.accuracy]);

  const getScoreRank = () => {
    const avgScore =
      result.totalWords > 0 ? result.totalScore / result.totalWords : 0;
    if (avgScore >= 90)
      return { rank: "S", label: "Huyền Thoại", color: "#F97316", icon: "👑" }; // Cam secondary
    if (avgScore >= 75)
      return { rank: "A", label: "Xuất Sắc", color: "#2563EB", icon: "🌟" }; // Xanh dương primary
    if (avgScore >= 60)
      return { rank: "B", label: "Khá Tốt", color: "#10B981", icon: "⭐" }; // Xanh ngọc success
    if (avgScore >= 40)
      return { rank: "C", label: "Trung Bình", color: "#3B82F6", icon: "💫" }; // Xanh dương nhạt
    return { rank: "D", label: "Cần Cố Gắng", color: "#6B7280", icon: "💪" }; // Xám
  };

  const scoreRank = getScoreRank();

  const getMessage = () => {
    if (result.accuracy === 100) {
      return {
        text: "Perfect Score! Bạn là thiên tài! 🧠✨",
        color: "success.main",
      };
    } else if (result.accuracy >= 80) {
      return { text: "Xuất sắc! Trí nhớ siêu đẳng! 🎯", color: "primary.main" };
    } else if (result.accuracy >= 60) {
      return { text: "Tốt đấy! Tiếp tục cố gắng! 🚀", color: "info.main" };
    } else {
      return {
        text: "Luyện tập thêm nhé! Bạn sẽ tiến bộ! 💪",
        color: "warning.main",
      };
    }
  };

  const message = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(145deg, #F0F9FF, #E0F2FE)",
          border: "3px solid",
          borderColor: "#3B82F6",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, #3B82F640, transparent)`,
            opacity: 0.3,
          }}
        />

        {/* Header */}
        <Box
          sx={{ textAlign: "center", mb: 3, position: "relative", zIndex: 1 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          >
            <EmojiEvents
              sx={{
                fontSize: 90,
                color: "#F97316",
                filter: "drop-shadow(0px 6px 10px rgba(0,0,0,0.3))",
              }}
            />
          </motion.div>

          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              mt: 2,
              color: message.color,
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {message.text}
          </Typography>

          <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>
            🧠 Word Recall Challenge
          </Typography>

          {/* Rank Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Chip
              label={`${scoreRank.icon} Hạng ${scoreRank.rank} - ${scoreRank.label}`}
              sx={{
                mt: 2,
                fontSize: "1.1rem",
                fontWeight: "bold",
                py: 3,
                px: 2,
                bgcolor: scoreRank.color,
                color: "white",
                borderRadius: 3,
              }}
            />
          </motion.div>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Main Score */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
          >
            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{
                color: "#2563EB",
                textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
              }}
            >
              {result.totalScore}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Tổng điểm
            </Typography>
          </motion.div>
        </Box>

        {/* Stats Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Từ đúng */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "white",
              textAlign: "center",
              height: "100%",
            }}
          >
            <CardContent>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {result.correctWords}/{result.totalWords}
              </Typography>
              <Typography variant="caption">Từ đúng</Typography>
            </CardContent>
          </Card>

          {/* Độ chính xác */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              color: "white",
              textAlign: "center",
              height: "100%",
            }}
          >
            <CardContent>
              <Stars sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {result.accuracy}%
              </Typography>
              <Typography variant="caption">Chính xác</Typography>
            </CardContent>
          </Card>

          {/* Thời gian */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
              color: "white",
              textAlign: "center",
              height: "100%",
            }}
          >
            <CardContent>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {result.timeSpent}s
              </Typography>
              <Typography variant="caption">Thời gian</Typography>
            </CardContent>
          </Card>

          {/* Từ sai */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
              color: "white",
              textAlign: "center",
              height: "100%",
            }}
          >
            <CardContent>
              <ErrorOutline sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {result.wrongWords}
              </Typography>
              <Typography variant="caption">Từ sai</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Wrong words list */}
        {result.wrongList && result.wrongList.length > 0 && (
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.8)",
              p: 2,
              borderRadius: 3,
              mb: 3,
              border: "2px dashed",
              borderColor: "error.light",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LocalFireDepartment sx={{ color: "error.main" }} />
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="error.main"
              >
                📚 Các từ cần ôn lại ({result.wrongList.length} từ):
              </Typography>
            </Box>
            <List dense sx={{ maxHeight: 200, overflow: "auto" }}>
              {result.wrongList.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: "error.light",
                    mb: 0.5,
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "error.main",
                      color: "white",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography fontWeight="bold" variant="body2">
                        {item.word}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: "inherit" }}>
                        {item.definition}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Achievement badges */}
        <Box
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.7)",
            p: 2,
            borderRadius: 3,
            mb: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            🏆 Thành tích đạt được:
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            {result.accuracy === 100 && (
              <Chip label="🎯 Perfect Score" color="success" size="small" />
            )}
            {result.correctWords >= 20 && (
              <Chip label="🌟 Siêu Trí Nhớ" color="primary" size="small" />
            )}
            {result.wrongWords === 0 && result.totalWords > 0 && (
              <Chip label="✨ Không Sai Lần Nào" color="info" size="small" />
            )}
            {result.totalScore >= 1000 && (
              <Chip label="💎 Cao Thủ" color="warning" size="small" />
            )}
            {result.accuracy >= 90 && (
              <Chip label="🔥 Xuất Sắc" color="error" size="small" />
            )}
          </Box>
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
              fontSize: "1rem",
              background: "linear-gradient(45deg, #2563EB 30%, #3B82F6 90%)",
              boxShadow: "0 3px 10px rgba(37, 99, 235, 0.4)",
              "&:hover": {
                background: "linear-gradient(45deg, #1D4ED8 30%, #2563EB 90%)",
                transform: "translateY(-2px)",
                boxShadow: "0 5px 15px rgba(37, 99, 235, 0.5)",
              },
            }}
          >
            Thử thách lại
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
              fontSize: "1rem",
              borderWidth: 2,
              borderColor: "#2563EB",
              color: "#2563EB",
              "&:hover": {
                borderWidth: 2,
                transform: "translateY(-2px)",
                bgcolor: "rgba(37, 99, 235, 0.08)",
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
