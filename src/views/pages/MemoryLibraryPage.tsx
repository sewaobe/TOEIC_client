import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  AutoGraph as MemoryIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import hlrService, {
  HLRStats,
  ProgressLibraryItem,
} from "../../services/hlr.service";

type GroupBy = "none" | "memory" | "due_day" | "tag" | "word_type";
type SortBy = "next_review" | "last_practiced" | "half_life";

const PAGE_LIMIT = 40;

function formatDateTime(dateStr?: string | Date | null) {
  if (!dateStr) return "Chưa có";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Không hợp lệ";

  return d.toLocaleString("vi-VN", {
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRecallColor(prob: number) {
  if (prob < 0.4) return "error" as const;
  if (prob < 0.7) return "warning" as const;
  return "success" as const;
}

function getMemoryLabel(status: string) {
  if (status === "critical") return "Nguy cơ quên cao";
  if (status === "review_soon") return "Cần ôn sớm";
  return "Đang ổn";
}

function getDueBucket(nextReview: string) {
  const now = new Date();
  const due = new Date(nextReview);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) return "Quá hạn ôn";
  if (diffDays === 0) return "Đến hạn hôm nay";
  if (diffDays === 1) return "Đến hạn ngày mai";
  if (diffDays <= 7) return "Đến hạn trong 7 ngày";
  return "Đến hạn sau 7 ngày";
}

export default function MemoryLibraryPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("memory");
  const [sortBy, setSortBy] = useState<SortBy>("next_review");

  const [items, setItems] = useState<ProgressLibraryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<HLRStats | null>(null);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      setError(null);

      const [libraryRes, statsRes] = await Promise.all([
        hlrService.getProgressLibrary({
          page,
          limit: PAGE_LIMIT,
          includeDetails: true,
          search: appliedSearch,
          sortBy,
          sortOrder: "asc",
        }),
        hlrService.getStats(),
      ]);

      setItems(libraryRes.items);
      setTotal(libraryRes.total);
      setTotalPages(libraryRes.totalPages);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to fetch memory library", err);
      setError("Không thể tải thư viện ghi nhớ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [page, appliedSearch, sortBy]);

  const groupedData = useMemo(() => {
    if (groupBy === "none") {
      return [{ title: "Tất cả từ", items }];
    }

    const groupMap = new Map<string, ProgressLibraryItem[]>();

    for (const item of items) {
      let key = "Khác";

      if (groupBy === "memory") {
        key = getMemoryLabel(item.memory_status);
      } else if (groupBy === "due_day") {
        key = getDueBucket(item.next_review);
      } else if (groupBy === "tag") {
        key = item.vocabulary?.tags?.[0] || "Không gắn tag";
      } else if (groupBy === "word_type") {
        key = item.vocabulary?.type || "Không rõ loại từ";
      }

      const existing = groupMap.get(key) || [];
      existing.push(item);
      groupMap.set(key, existing);
    }

    return Array.from(groupMap.entries()).map(([title, groupItems]) => ({
      title,
      items: groupItems,
    }));
  }, [items, groupBy]);

  const avgRecall = useMemo(() => {
    if (items.length === 0) return 0;
    const totalRecall = items.reduce(
      (sum, item) => sum + (item.recall_probability || 0),
      0,
    );
    return Math.round((totalRecall / items.length) * 100);
  }, [items]);

  return (
    <MainLayout>
      <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 3 }, pb: 5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
              sx={{ minWidth: "auto" }}
            >
              Quay lại
            </Button>
            <MemoryIcon color="primary" />
            <Typography variant="h5" fontWeight={700}>
              Thư viện trí nhớ từ vựng
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLibrary}
          >
            Làm mới
          </Button>
        </Box>

        <Paper sx={{ p: 2, borderRadius: 2.5, mb: 2 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
            <Chip
              label={`Hiển thị: ${items.length}/${total} từ`}
              size="small"
            />
            <Chip
              label={`Trí nhớ TB trang: ${avgRecall}%`}
              size="small"
              color={getRecallColor(avgRecall / 100)}
            />
            {stats && (
              <>
                <Chip
                  label={`Đến hạn hôm nay: ${stats.dueToday}`}
                  size="small"
                  color={stats.dueToday > 0 ? "warning" : "success"}
                />
                <Chip
                  label={`Đã thuộc: ${stats.masteredWords}`}
                  size="small"
                  variant="outlined"
                />
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Tìm theo từ, tag, loại từ"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setAppliedSearch(searchInput.trim());
                }
              }}
              sx={{ minWidth: { xs: "100%", sm: 260 } }}
            />

            <Button
              size="small"
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() => {
                setPage(1);
                setAppliedSearch(searchInput.trim());
              }}
            >
              Tìm
            </Button>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Nhóm theo</InputLabel>
              <Select
                value={groupBy}
                label="Nhóm theo"
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              >
                <MenuItem value="memory">Trạng thái nhớ</MenuItem>
                <MenuItem value="due_day">Mốc nhắc ôn</MenuItem>
                <MenuItem value="tag">Chủ đề (tag)</MenuItem>
                <MenuItem value="word_type">Loại từ</MenuItem>
                <MenuItem value="none">Không nhóm</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                label="Sắp xếp"
                onChange={(e) => {
                  setPage(1);
                  setSortBy(e.target.value as SortBy);
                }}
              >
                <MenuItem value="next_review">Theo lịch ôn lại</MenuItem>
                <MenuItem value="last_practiced">Theo lần ôn gần nhất</MenuItem>
                <MenuItem value="half_life">Theo half-life</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Skeleton
              variant="rectangular"
              height={90}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={90}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={90}
              sx={{ borderRadius: 2 }}
            />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : items.length === 0 ? (
          <Paper sx={{ p: 3, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h6">Không có dữ liệu phù hợp</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Hãy thử đổi bộ lọc hoặc bắt đầu ôn tập để tạo dữ liệu HLR.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {groupedData.map((group) => (
              <Paper key={group.title} sx={{ p: 2, borderRadius: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  {group.title} ({group.items.length})
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {group.items.map((item) => {
                    const word = item.vocabulary?.word || "(không rõ từ)";
                    const recallPercent = Math.round(
                      (item.recall_probability || 0) * 100,
                    );

                    return (
                      <Box
                        key={item._id}
                        sx={{
                          p: 1.25,
                          borderRadius: 1.5,
                          bgcolor: "grey.50",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box>
                          <Typography fontWeight={700}>{word}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Ôn gần nhất: {formatDateTime(item.last_practiced)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}
                        >
                          <Chip
                            size="small"
                            color={getRecallColor(item.recall_probability || 0)}
                            label={`${recallPercent}% nhớ`}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Half-life: ${Math.round(item.half_life || 0)}h`}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Quên mốc 50%: ${formatDateTime(item.forgot_at)}`}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            color={
                              item.next_review &&
                              new Date(item.next_review) <= new Date()
                                ? "warning"
                                : "default"
                            }
                            label={`Nhắc ôn: ${formatDateTime(item.next_review)}`}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            ))}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Pagination
                  page={page}
                  count={totalPages}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}
