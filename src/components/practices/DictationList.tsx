import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Pagination,
  CircularProgress,
  Stack,
  LinearProgress,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  SignalCellularAlt as SignalCellularAltIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { Dictation } from "../../types/Dictation";
import { dictationService } from "../../services/dictation.service";

interface DictationListProps {
  filters?: {
    part_type?: number;
    tags?: string;
    level?: string;
  };
  onSelectLesson: (lessonId: string) => void;
}

const ITEMS_PER_PAGE = 9;

// Map level sang màu và label
const getLevelConfig = (level: string) => {
  const upperLevel = level.toUpperCase();
  if (upperLevel === "A1" || upperLevel === "A2") {
    return { label: "Dễ", color: "#22c55e" };
  }
  if (upperLevel === "B1" || upperLevel === "B2") {
    return { label: "Trung bình", color: "#f59e0b" };
  }
  return { label: "Khó", color: "#ef4444" };
};

export default function DictationList({
  filters,
  onSelectLesson,
}: DictationListProps) {
  const [dictations, setDictations] = useState<Dictation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchDictations = async () => {
      setLoading(true);
      try {
        const data = await dictationService.getAllDictationData(filters);
        setDictations(data);
        setPage(1); // Reset về trang 1 khi filter thay đổi
      } catch (error) {
        console.error("Lỗi khi lấy danh sách dictation:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDictations();
  }, [filters]);

  const totalPages = Math.ceil(dictations.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentDictations = dictations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (dictations.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography color="text.secondary">
          Không tìm thấy bài luyện tập phù hợp
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Danh sách bài luyện nghe chép chính tả
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tìm thấy {dictations.length} bài luyện tập
          {filters?.part_type && ` - Part ${filters.part_type}`}
          {filters?.tags && ` - ${filters.tags}`}
        </Typography>
      </Box>

      {/* Grid Cards */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        gap={2}
      >
        {currentDictations.map((dict) => {
          const levelConfig = getLevelConfig(dict.level);
          const hasAttempt = dict.userStats && dict.userStats.attemptCount > 0;

          return (
            <Card
              key={dict._id}
              sx={{
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => onSelectLesson(dict._id)}
            >
              {/* Badge trạng thái */}
              {hasAttempt && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "#10b981",
                    color: "white",
                    borderRadius: "12px",
                    px: 1.5,
                    py: 0.5,
                    fontSize: "11px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14 }} />
                  Đã học
                </Box>
              )}

              <CardContent>
                {/* Title */}
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    minHeight: "3rem",
                    pr: hasAttempt ? 8 : 0, // Space cho badge
                  }}
                >
                  {dict.title}
                </Typography>

                {/* Tags */}
                <Box display="flex" gap={1} mb={1.5}>
                  {dict.part_type && (
                    <Chip
                      label={`Part ${dict.part_type}`}
                      size="small"
                      sx={{
                        backgroundColor: "#e0f2fe",
                        color: "#0369a1",
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {!hasAttempt && (
                    <Chip
                      label="Mới"
                      size="small"
                      sx={{
                        backgroundColor: "#fef3c7",
                        color: "#d97706",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                {/* User Stats */}
                {hasAttempt && dict.userStats && (
                  <Box
                    sx={{
                      backgroundColor: "#f0f9ff",
                      borderRadius: "8px",
                      p: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <TrendingUpIcon
                          fontSize="small"
                          sx={{ color: "#2563eb" }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="#2563eb"
                        >
                          Điểm cao nhất:{" "}
                          {Math.round(dict.userStats.bestAccuracy)}%
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {dict.userStats.attemptCount} lần
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={dict.userStats.bestAccuracy}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#dbeafe",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            dict.userStats.bestAccuracy >= 80
                              ? "#10b981"
                              : dict.userStats.bestAccuracy >= 50
                              ? "#f59e0b"
                              : "#ef4444",
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Level & Duration */}
                <Stack direction="row" spacing={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <SignalCellularAltIcon
                      fontSize="small"
                      sx={{ color: levelConfig.color }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: levelConfig.color, fontWeight: 600 }}
                    >
                      {levelConfig.label}
                    </Typography>
                  </Box>
                  {dict.duration && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {Math.ceil(dict.duration / 1000)}s
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
}
