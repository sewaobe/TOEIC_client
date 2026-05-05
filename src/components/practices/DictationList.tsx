import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  MenuItem,
  Pagination,
  Radio,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  DescriptionOutlined as DescriptionIcon,
  Headphones as HeadphonesIcon,
  History as HistoryIcon,
  Replay as ReplayIcon,
  Schedule as ScheduleIcon,
  SignalCellularAlt as SignalCellularAltIcon,
  Subtitles as SubtitlesIcon,
  Sync as SyncIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { Dictation } from "../../types/Dictation";
import { dictationService } from "../../services/dictation.service";

type Difficulty = "easy" | "medium" | "hard";
type PracticeStatusFilter = "all" | "unpracticed" | "practiced";
type SortFilter = "newest" | "oldest" | "level_asc" | "level_desc";

interface DictationListProps {
  filters?: {
    part_type?: number;
    tags?: string;
    level?: string;
  };
  onSelectLesson: (lessonId: string, difficulty: Difficulty) => void;
}

const ITEMS_PER_PAGE = 9;
const levelOptions = ["A1", "A2", "B1", "B2", "C1", "C2"];

const formatDuration = (seconds?: number) => {
  if (!seconds) return "0s";
  if (seconds < 60) return `${Math.ceil(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);
  return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

const practiceModes: Array<{
  value: Difficulty;
  title: string;
  description: string;
  color: string;
}> = [
    {
      value: "easy",
      title: "Dễ",
      description: "Sắp xếp các từ cho trước theo nội dung nghe được.",
      color: "#22c55e",
    },
    {
      value: "medium",
      title: "Trung bình",
      description: "Điền các từ còn thiếu vào chỗ trống trong câu.",
      color: "#f59e0b",
    },
    {
      value: "hard",
      title: "Khó",
      description: "Nhập lại toàn bộ nội dung nghe được.",
      color: "#ef4444",
    },
  ];

interface PracticeStartModalProps {
  dictation: Dictation | null;
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onClose: () => void;
  onStart: () => void;
}

const PracticeStartModal = ({
  dictation,
  selectedDifficulty,
  onSelectDifficulty,
  onClose,
  onStart,
}: PracticeStartModalProps) => {
  const sentenceCount = dictation?.timings?.length || 1;

  return (
    <Dialog
      open={Boolean(dictation)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.24)",
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            <HeadphonesIcon />
          </Box>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={800} color="#0f172a">
              Bắt đầu luyện tập
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chọn chế độ luyện phù hợp với mục tiêu của bạn
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {dictation && (
          <Box
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              p: 1.5,
              mb: 2,
              backgroundColor: "#fff",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1.25}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                minWidth={0}
                flex={1}
              >
                <Typography
                  fontWeight={800}
                  color="#0f172a"
                  noWrap
                  sx={{ minWidth: 0 }}
                >
                  {dictation.title}
                </Typography>
                <Chip
                  label={dictation.level || "N/A"}
                  size="small"
                  sx={{
                    height: 22,
                    fontWeight: 700,
                    backgroundColor: "#dcfce7",
                    color: "#15803d",
                    flexShrink: 0,
                  }}
                />
              </Box>

              <Stack direction="row" spacing={0.75} flexShrink={0}>
                <Chip
                  icon={<SubtitlesIcon sx={{ fontSize: "14px !important" }} />}
                  label={`${sentenceCount} câu`}
                  size="small"
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    backgroundColor: "#f8fafc",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    "& .MuiChip-icon": { color: "#64748b" },
                  }}
                />
                <Chip
                  icon={<ScheduleIcon sx={{ fontSize: "14px !important" }} />}
                  label={formatDuration(dictation.duration)}
                  size="small"
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    backgroundColor: "#f8fafc",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                    "& .MuiChip-icon": { color: "#64748b" },
                  }}
                />
              </Stack>
            </Box>
          </Box>
        )}

        <Typography variant="body2" fontWeight={700} mb={1}>
          Chọn chế độ luyện
        </Typography>
        <Stack spacing={1.25}>
          {practiceModes.map((mode) => {
            const active = selectedDifficulty === mode.value;

            return (
              <Box
                key={mode.value}
                onClick={() => onSelectDifficulty(mode.value)}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: active ? "2px solid #2563eb" : "1px solid #e2e8f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  backgroundColor: active ? "#eff6ff" : "#fff",
                  transition:
                    "border-color 0.16s ease, background-color 0.16s ease",
                  "&:hover": {
                    borderColor: active ? "#2563eb" : "#bfdbfe",
                    backgroundColor: active ? "#eff6ff" : "#f8fafc",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "end",
                    justifyContent: "center",
                    gap: 0.35,
                    backgroundColor: `${mode.color}1a`,
                    pb: 0.8,
                    flexShrink: 0,
                  }}
                >
                  {[12, 18, 24].map((height) => (
                    <Box
                      key={height}
                      sx={{
                        width: 4,
                        height,
                        borderRadius: "999px",
                        backgroundColor: mode.color,
                      }}
                    />
                  ))}
                </Box>
                <Box flex={1}>
                  <Typography fontWeight={800} color="#0f172a">
                    {mode.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mode.description}
                  </Typography>
                </Box>
                <Radio checked={active} color="primary" />
              </Box>
            );
          })}
        </Stack>

        <Box display="flex" justifyContent="flex-end" gap={1.25} mt={3}>
          <Button variant="outlined" onClick={onClose} sx={{ px: 2.5 }}>
            Hủy
          </Button>
          <Button variant="contained" onClick={onStart} sx={{ px: 2.5 }}>
            Bắt đầu luyện
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

interface DictationCardProps {
  dictation: Dictation;
  onClick: () => void;
}

const DictationCard = ({ dictation, onClick }: DictationCardProps) => {
  const hasAttempt =
    !!dictation.userStats && dictation.userStats.attemptCount > 0;
  const sentenceCount = dictation.timings?.length || 1;
  const bestAccuracy = Math.round(dictation.userStats?.bestAccuracy || 0);

  return (
    <Card
      sx={{
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        border: "1px solid #bfdbfe",
        borderRadius: 2.5,
        backgroundColor: "#fff",
        boxShadow: "0 8px 22px rgba(37, 99, 235, 0.08)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 14px 30px rgba(37, 99, 235, 0.14)",
          borderColor: "#93c5fd",
        },
      }}
      onClick={onClick}
    >
      <Chip
        icon={
          hasAttempt ? (
            <CheckCircleIcon sx={{ fontSize: "15px !important" }} />
          ) : (
            <AutoAwesomeIcon sx={{ fontSize: "15px !important" }} />
          )
        }
        label={hasAttempt ? "Đã luyện" : "Mới"}
        size="small"
        sx={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 1,
          height: 24,
          borderRadius: "999px",
          px: 0.5,
          fontSize: 12,
          fontWeight: 800,
          backgroundColor: hasAttempt ? "#dcfce7" : "#fff7ed",
          color: hasAttempt ? "#15803d" : "#d97706",
          border: `1px solid ${hasAttempt ? "#bbf7d0" : "#fed7aa"}`,
          "& .MuiChip-icon": {
            color: hasAttempt ? "#22c55e" : "#f59e0b",
          },
        }}
      />

      <CardContent sx={{ p: 2.25, pb: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(145deg, #f8fbff 0%, #eef4ff 100%)",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            <HeadphonesIcon sx={{ fontSize: 30 }} />
          </Box>

          <Typography
            variant="h6"
            fontWeight={900}
            color="#0f172a"
            noWrap
            sx={{ minWidth: 0, flex: 1, letterSpacing: 0, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {dictation.title}
          </Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          flexWrap="wrap"
          gap={1.5}
          sx={{ color: "#48618b" }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SignalCellularAltIcon sx={{ color: "#2563eb", fontSize: 21 }} />
            <Typography variant="body2" fontWeight={800}>
              {dictation.level || "N/A"}
            </Typography>
          </Box>

          <Box sx={{ width: "1px", height: 20, backgroundColor: "#e2e8f0" }} />

          <Box display="flex" alignItems="center" gap={1}>
            <DescriptionIcon sx={{ color: "#2563eb", fontSize: 21 }} />
            <Typography variant="body2" fontWeight={800}>{sentenceCount} câu</Typography>
          </Box>

          <Box sx={{ width: "1px", height: 20, backgroundColor: "#e2e8f0" }} />

          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon sx={{ color: "#2563eb", fontSize: 21 }} />
            <Typography variant="body2" fontWeight={800}>
              {formatDuration(dictation.duration)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Box
        sx={{
          borderTop: "1px solid #e2e8f0",
          px: 2.25,
          py: 1.4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          minHeight: 58,
        }}
      >
        {hasAttempt ? (
          <>
            <Box display="flex" alignItems="center" gap={0.75}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "#dcfce7",
                  color: "#22c55e",
                  flexShrink: 0,
                }}
              >
                <SyncIcon fontSize="small" />
              </Box>
              <Typography fontSize={14} fontWeight={800} color="#64748b">
                {dictation.userStats?.attemptCount || 0} lần
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon sx={{ color: "#22c55e", width: 24,height: 24 }} />
              <Typography fontSize={14} fontWeight={800} color="#64748b" noWrap>
                Điểm cao nhất:{" "}
                <Box component="span" sx={{ color: "#22c55e" }}>
                  {bestAccuracy}%
                </Box>
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Box display="flex" alignItems="center" gap={0.75}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  flexShrink: 0,
                }}
              >
                <HistoryIcon fontSize="small" />
              </Box>
              <Typography fontSize={14} fontWeight={800} color="#64748b">
                Chưa luyện
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} color="#2563eb">
              <Typography fontSize={14} fontWeight={900} noWrap>
                {" "}
              </Typography>
              <ArrowForwardIcon sx={{width: 24,height: 24}} />
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
};

export default function DictationList({
  filters,
  onSelectLesson,
}: DictationListProps) {
  const [dictations, setDictations] = useState<Dictation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [practiceStatus, setPracticeStatus] =
    useState<PracticeStatusFilter>("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sort, setSort] = useState<SortFilter>("newest");
  const [selectedDictation, setSelectedDictation] = useState<Dictation | null>(
    null
  );
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("easy");

  useEffect(() => {
    const fetchDictations = async () => {
      setLoading(true);
      try {
        const data = await dictationService.getAllDictationPage({
          ...filters,
          page,
          limit: ITEMS_PER_PAGE,
          practice_status: practiceStatus,
          level: levelFilter === "all" ? filters?.level : levelFilter,
          sort,
        });

        setDictations(data.items);
        setTotal(data.total);
        setPageCount(data.pageCount);
      } catch (error) {
        console.error("Failed to fetch dictations:", error);
        setDictations([]);
        setTotal(0);
        setPageCount(1);
      } finally {
        setLoading(false);
      }
    };

    fetchDictations();
  }, [filters, page, practiceStatus, levelFilter, sort]);

  const handlePracticeStatusChange = (value: PracticeStatusFilter) => {
    setPracticeStatus(value);
    setPage(1);
  };

  const handleLevelChange = (value: string) => {
    setLevelFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: SortFilter) => {
    setSort(value);
    setPage(1);
  };

  const handleOpenStartModal = (dictation: Dictation) => {
    setSelectedDictation(dictation);
    setSelectedDifficulty("easy");
  };

  const handleStartPractice = () => {
    if (!selectedDictation) return;
    onSelectLesson(selectedDictation._id, selectedDifficulty);
    setSelectedDictation(null);
  };

  const filterButtonSx = (active: boolean) => ({
    borderRadius: "999px",
    px: 2,
    py: 0.75,
    textTransform: "none",
    fontWeight: 600,
    boxShadow: active ? "0 6px 14px rgba(37, 99, 235, 0.2)" : "none",
    backgroundColor: active ? "#2563eb" : "#fff",
    color: active ? "#fff" : "#475569",
    border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
    "&:hover": {
      backgroundColor: active ? "#1d4ed8" : "#f8fafc",
      borderColor: active ? "#1d4ed8" : "#cbd5e1",
    },
  });

  const selectSx = {
    minWidth: 150,
    "& .MuiOutlinedInput-root": {
      height: 36,
      borderRadius: "999px",
      backgroundColor: "#fff",
      fontSize: 13,
      color: "#475569",
      "& fieldset": { borderColor: "#e2e8f0" },
      "&:hover fieldset": { borderColor: "#cbd5e1" },
      "&.Mui-focused fieldset": { borderColor: "#2563eb" },
    },
  };

  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Danh sách bài luyện nghe chép chính tả
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tìm thấy {total} bài luyện tập
          {filters?.part_type && ` - Part ${filters.part_type}`}
          {filters?.tags && ` - ${filters.tags}`}
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            onClick={() => handlePracticeStatusChange("all")}
            startIcon={<ReplayIcon sx={{ fontSize: 16 }} />}
            sx={filterButtonSx(practiceStatus === "all")}
          >
            Tất cả
          </Button>
          <Button
            onClick={() => handlePracticeStatusChange("unpracticed")}
            sx={filterButtonSx(practiceStatus === "unpracticed")}
          >
            Chưa luyện
          </Button>
          <Button
            onClick={() => handlePracticeStatusChange("practiced")}
            startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            sx={filterButtonSx(practiceStatus === "practiced")}
          >
            Đã luyện
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <FormControl size="small" sx={selectSx}>
            <Select
              value={levelFilter}
              displayEmpty
              onChange={(event) => handleLevelChange(event.target.value)}
            >
              <MenuItem value="all">Cấp độ: Tất cả</MenuItem>
              {levelOptions.map((level) => (
                <MenuItem key={level} value={level}>
                  Cấp độ: {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={selectSx}>
            <Select
              value={sort}
              onChange={(event) =>
                handleSortChange(event.target.value as SortFilter)
              }
            >
              <MenuItem value="newest">Mới nhất</MenuItem>
              <MenuItem value="oldest">Cũ nhất</MenuItem>
              <MenuItem value="level_asc">Cấp độ tăng dần</MenuItem>
              <MenuItem value="level_desc">Cấp độ giảm dần</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      ) : dictations.length === 0 ? (
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
      ) : (
        <>
          <Box
            display="grid"
            gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))"
            gap={2}
          >
            {dictations.map((dict) => (
              <DictationCard
                key={dict._id}
                dictation={dict}
                onClick={() => handleOpenStartModal(dict)}
              />
            ))}
          </Box>

          {pageCount > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      <PracticeStartModal
        dictation={selectedDictation}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={setSelectedDifficulty}
        onClose={() => setSelectedDictation(null)}
        onStart={handleStartPractice}
      />
    </Box>
  );
}
