import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Collapse,
  Skeleton,
} from "@mui/material";
import {
  Psychology as BrainIcon,
  Close as CloseIcon,
  TrendingUp as TrendingIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import hlrService, { HLRStats } from "../../services/hlr.service";

/**
 * SmartReviewBanner - Banner nhắc nhở ôn tập thông minh
 *
 * Hiển thị khi user có từ cần ôn (dueToday > 0)
 * Đặt trong trang Vocabulary hoặc Flashcard
 */

interface SmartReviewBannerProps {
  onDismiss?: () => void;
}

const SmartReviewBanner = ({ onDismiss }: SmartReviewBannerProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<HLRStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const dismissedToday = localStorage.getItem("hlr_banner_dismissed");
    if (dismissedToday) {
      const dismissedDate = new Date(dismissedToday).toDateString();
      const today = new Date().toDateString();
      if (dismissedDate === today) {
        setDismissed(true);
        setLoading(false);
        return;
      }
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await hlrService.getStats();
      setStats(data);
      setError(false);
    } catch (err) {
      console.error("Failed to fetch HLR stats:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("hlr_banner_dismissed", new Date().toISOString());
    onDismiss?.();
  };

  const handleStartReview = () => {
    navigate("/flash-cards/smart-review");
  };

  const handleOpenLibrary = () => {
    navigate("/flash-cards/memory-library");
  };

  // Không hiển thị nếu đã dismiss hoặc không có từ cần ôn
  if (dismissed || error) return null;

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Skeleton
          variant="text"
          width="60%"
          sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
        />
        <Skeleton
          variant="text"
          width="40%"
          sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
        />
      </Paper>
    );
  }

  // Không hiển thị nếu không có từ cần ôn
  if (!stats || stats.dueToday === 0) return null;

  return (
    <Collapse in={!dismissed}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />

        {/* Close button */}
        <IconButton
          size="small"
          onClick={handleDismiss}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "rgba(255,255,255,0.7)",
            "&:hover": {
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Content */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BrainIcon sx={{ fontSize: 32 }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Ôn tập thông minh
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
              Bạn có <strong>{stats.dueToday} từ</strong> cần ôn lại hôm nay.
              Dành 5 phút để giữ trí nhớ!
            </Typography>

            {/* Stats row */}
            <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <TrendingIcon fontSize="small" />
                <Typography variant="caption">
                  {stats.masteredWords} từ đã thuộc
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <TimeIcon fontSize="small" />
                <Typography variant="caption">
                  {Math.round(stats.averageHalfLife)}h half-life TB
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={handleStartReview}
                sx={{
                  bgcolor: "white",
                  color: "#667eea",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                Bắt đầu ôn tập
              </Button>
              <Button
                variant="outlined"
                onClick={handleOpenLibrary}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.6)",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.12)",
                  },
                }}
              >
                Xem thư viện từ
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Collapse>
  );
};

export default SmartReviewBanner;
