import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Replay as ReplayIcon,
} from "@mui/icons-material";
import { Dictation } from "../../types/Dictation";
import { dictationService } from "../../services/dictation.service";
import { DictationCard } from "./DictationCard";
import {
  DictationPracticeStartModal,
  DictationDifficulty,
} from "./DictationPracticeStartModal";

type Difficulty = DictationDifficulty;
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

      <DictationPracticeStartModal
        dictation={selectedDictation}
        selectedDifficulty={selectedDifficulty}
        onSelectDifficulty={setSelectedDifficulty}
        onClose={() => setSelectedDictation(null)}
        onStart={handleStartPractice}
      />
    </Box>
  );
}
