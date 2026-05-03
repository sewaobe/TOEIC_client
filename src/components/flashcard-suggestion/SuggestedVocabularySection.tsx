import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  FilterList,
  InfoOutlined,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  PlayArrow,
  Search,
  VolumeUp,
} from "@mui/icons-material";
import {
  PaginatedSuggestions,
  SuggestionDetail,
  SuggestedVocabularyApiItem,
  SuggestionDueTone,
  SuggestionPriority,
} from "../../types/UserVocabularyProgressV2";
import { suggestedVocabularies } from "./mockData";
import userVocabularyProgressV2Service from "../../services/user_vocabulary_progress_v2.service";
import SuggestionDetailModal from "./SuggestionDetailModal";

const filterLabels = ["Chủ đề", "Cấp độ", "Độ ưu tiên", "Đến hạn", "Xác suất nhớ"];

const priorityColor: Record<SuggestionPriority, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

const dueToneColor: Record<SuggestionDueTone, string> = {
  danger: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
};

const compactButtonSx = {
  borderRadius: 2,
  height: 30,
  fontSize: 11,
  fontWeight: 800,
  px: 1,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const mockSuggestions: PaginatedSuggestions = {
  items: suggestedVocabularies.map((item) => ({
    id: item.vocabularyId,
    vocabularyId: item.vocabularyId,
    word: item.word,
    phonetic: item.phonetic,
    meaning: item.meaning,
    topic: item.topic,
    level: item.level,
    priority: item.priority,
    priorityLabel: item.priorityLabel,
    pRecallNow: item.pRecallNow,
    dueAt: item.dueAt ?? null,
    dueLabel: item.dueLabel,
    memoryBucket: item.memoryBucket ?? "active_reviewing",
    status: item.memory?.status ?? "reviewing",
    halfLifeDays: item.memory?.half_life_days ?? 0,
    difficulty: item.memory?.difficulty ?? 0,
    reviewCount: 0,
    sessionCount: 0,
  })),
  pagination: {
    page: 1,
    limit: 20,
    total: 416,
    totalPages: 21,
  },
  counters: {
    all: 416,
    dueToday: 142,
    atRisk: 38,
    overdue: 20,
    mastered: 236,
  },
};

function resolveDueTone(item: SuggestedVocabularyApiItem): SuggestionDueTone {
  if (item.memoryBucket === "overdue" || item.priority === "high") {
    return "danger";
  }

  if (item.memoryBucket === "at_risk" || item.priority === "medium") {
    return "warning";
  }

  return "success";
}

function resolveTopicColor(topic?: string): string {
  if (topic === "Culture" || topic === "Work") {
    return "#dcfce7";
  }

  if (topic === "Economics") {
    return "#ede9fe";
  }

  return "#dbeafe";
}

const SuggestedVocabularySection: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<PaginatedSuggestions>(mockSuggestions);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<SuggestionDetail | null>(null);

  useEffect(() => {
    let isMounted = true;

    userVocabularyProgressV2Service.getSuggestedVocabulary({ page: 1, limit: 20 }).then((data) => {
      if (isMounted) {
        setSuggestions(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const vocabularyItems = suggestions.items;
  const allVocabularyIds = useMemo(
    () => vocabularyItems.map((item) => item.vocabularyId),
    [vocabularyItems],
  );
  const selectedCount = selectedIds.length;
  const isAllSelected = selectedCount > 0 && selectedCount === allVocabularyIds.length;
  const isPartiallySelected = selectedCount > 0 && !isAllSelected;

  const quickTabs = [
    ["Tất cả", suggestions.counters.all, "#dbeafe"],
    ["Đến hạn hôm nay", suggestions.counters.dueToday, "#dbeafe"],
    ["Sắp quên", suggestions.counters.atRisk, "#fef3c7"],
    ["Quá hạn", suggestions.counters.overdue, "#fee2e2"],
    ["Đã nắm vững", suggestions.counters.mastered, "#dcfce7"],
  ] as const;

  const handleToggleAll = () => {
    setSelectedIds(isAllSelected ? [] : allVocabularyIds);
  };

  const handleToggleRow = (vocabularyId: string) => {
    setSelectedIds((current) =>
      current.includes(vocabularyId)
        ? current.filter((id) => id !== vocabularyId)
        : [...current, vocabularyId],
    );
  };

  const handleOpenDetail = async (vocabularyId: string) => {
    const detail = await userVocabularyProgressV2Service.getSuggestionDetail(vocabularyId);
    setSelectedDetail(detail);
    setDetailOpen(true);
  };

  return (
    <>
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: "1px solid #e2e8f0", minWidth: 0 }}>
      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
        Từ vựng được gợi ý
      </Typography>
      <Box
        sx={{
          px: 1.4,
          py: 1,
          borderRadius: 2,
          bgcolor: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          mb: 2,
        }}
      >
        <InfoOutlined fontSize="small" sx={{ mt: 0.1, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Gợi ý được cá nhân hóa dựa trên lịch sử học, xác suất nhớ và ngày đến hạn.
        </Typography>
      </Box>

      <Box sx={{ mb: 1.2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Tìm từ vựng, nghĩa, ví dụ..."
          InputProps={{ startAdornment: <Search fontSize="small" sx={{ color: "text.secondary", mr: 1, flexShrink: 0 }} /> }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              height: 36,
              fontSize: 13,
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2,
          overflowX: "auto",
          pb: 0.4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0 }}>
          {filterLabels.map((label) => (
            <Select
              key={label}
              size="small"
              displayEmpty
              defaultValue=""
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                height: 30,
                minWidth: 92,
                flexShrink: 0,
                fontSize: 11,
                "& .MuiSelect-select": {
                  py: 0.3,
                  px: 1,
                  pr: "24px !important",
                },
                "& .MuiSvgIcon-root": {
                  fontSize: 18,
                },
              }}
            >
              <MenuItem value="">{label}</MenuItem>
            </Select>
          ))}
          <Button
            variant="outlined"
            startIcon={<FilterList sx={{ fontSize: 16 }} />}
            sx={{
              ...compactButtonSx,
              minHeight: 30,
              "& .MuiButton-startIcon": { mr: 0.5 },
            }}
          >
            Bộ lọc
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0 }}>
          {quickTabs.map(([label, count, bg], index) => (
            <Button
              key={label}
              variant={index === 0 ? "contained" : "outlined"}
              size="small"
              sx={{
                ...compactButtonSx,
                px: index === 0 ? 1.4 : 1,
                color: index === 0 ? undefined : "text.primary",
                borderColor: index === 0 ? undefined : "#e2e8f0",
              }}
            >
              {label}
              {index > 0 && (
                <Chip label={count} size="small" sx={{ ml: 0.6, height: 17, bgcolor: bg, fontWeight: 800, fontSize: 10 }} />
              )}
            </Button>
          ))}
        </Box>
      </Box>

      <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 1040 }}>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={8}
                sx={{
                  bgcolor: selectedCount > 0 ? "#eff6ff" : "#f8fafc",
                  py: 0,
                  px: 0,
                  height: 40,
                  borderBottom: selectedCount > 0 ? "1px solid #dbeafe" : "1px solid #e2e8f0",
                  transition: "background-color 0.18s ease, border-color 0.18s ease",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    height: 40,
                    pl: 2,
                    pr: 1.5,
                    opacity: selectedCount > 0 ? 1 : 0,
                    visibility: selectedCount > 0 ? "visible" : "hidden",
                    pointerEvents: selectedCount > 0 ? "auto" : "none",
                    transition: "opacity 0.18s ease",
                  }}
                >
                  <Checkbox size="small" checked={isAllSelected} indeterminate={isPartiallySelected} onChange={handleToggleAll} sx={{ p: 0 }} />
                  <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 92 }}>
                    Đã chọn {selectedCount} từ
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrow sx={{ fontSize: 15 }} />}
                    sx={{
                      height: 26,
                      borderRadius: 1.5,
                      fontSize: 11,
                      fontWeight: 800,
                      px: 2.2,
                      "& .MuiButton-startIcon": { mr: 0.5 },
                    }}
                  >
                    Bắt đầu ôn {selectedCount} từ
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedIds([])}
                    sx={{
                      height: 26,
                      borderRadius: 1.5,
                      fontSize: 11,
                      fontWeight: 800,
                      px: 2.4,
                      bgcolor: "background.paper",
                    }}
                  >
                    Bỏ chọn
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell padding="checkbox">
                <Checkbox size="small" checked={isAllSelected} indeterminate={isPartiallySelected} onChange={handleToggleAll} />
              </TableCell>
              {["Từ vựng", "Nghĩa", "Chủ đề", "Cấp độ", "Độ ưu tiên", "Xác suất nhớ", "Đến hạn"].map((head) => (
                <TableCell key={head} sx={{ fontWeight: 900, color: "#475569", whiteSpace: "nowrap" }}>
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {vocabularyItems.map((item) => {
              const pRecallPercent = Math.round(item.pRecallNow * 100);
              const probabilityColor =
                pRecallPercent < 25
                  ? "#ef4444"
                  : pRecallPercent < 65
                    ? "#f59e0b"
                    : "#10b981";
              return (
                <TableRow
                  key={item.vocabularyId}
                  hover
                  onClick={() => handleOpenDetail(item.vocabularyId)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selectedIds.includes(item.vocabularyId)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => handleToggleRow(item.vocabularyId)}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <IconButton size="small" sx={{ color: "#2563eb", bgcolor: "#dbeafe", flexShrink: 0 }}>
                        <VolumeUp sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 900 }}>
                          {item.word}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {item.phonetic}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", minWidth: 170 }}>{item.meaning}</TableCell>
                  <TableCell>
                    <Chip label={item.topic} size="small" sx={{ bgcolor: resolveTopicColor(item.topic), color: "#2563eb", fontWeight: 800 }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={item.level} size="small" sx={{ bgcolor: "#dbeafe", color: "#2563eb", fontWeight: 900 }} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: priorityColor[item.priority], flexShrink: 0 }} />
                      <Typography variant="body2">{item.priorityLabel}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Typography variant="body2" sx={{ color: probabilityColor, fontWeight: 900, width: 38 }}>
                        {pRecallPercent}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pRecallPercent}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 99,
                          bgcolor: "#e5e7eb",
                          "& .MuiLinearProgress-bar": { bgcolor: probabilityColor, borderRadius: 99 },
                        }}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: dueToneColor[resolveDueTone(item)], fontWeight: 800, whiteSpace: "nowrap" }}>
                    {item.dueLabel}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mt: 1.5,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ justifyContent: { xs: "space-between", sm: "flex-start" } }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Hiển thị
          </Typography>
          <Select size="small" value={suggestions.pagination.limit} sx={{ borderRadius: 2, height: 36 }}>
            <MenuItem value={20}>20</MenuItem>
          </Select>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            từ vựng
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={{ xs: 0.4, sm: 1.2 }}
          alignItems="center"
          sx={{ overflowX: "auto", justifyContent: { xs: "flex-start", sm: "flex-end" }, pb: { xs: 0.5, sm: 0 } }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap", mr: 1 }}>
            1-{vocabularyItems.length} của {suggestions.pagination.total}
          </Typography>
          <Divider orientation="vertical" flexItem />
          <IconButton size="small">
            <KeyboardArrowLeft />
          </IconButton>
          {[1, 2, 3].map((page) => (
            <Button key={page} size="small" variant={page === suggestions.pagination.page ? "contained" : "text"} sx={{ minWidth: 34, borderRadius: 2 }}>
              {page}
            </Button>
          ))}
          <Typography variant="body2">...</Typography>
          <Button size="small" variant="text" sx={{ minWidth: 34, borderRadius: 2 }}>
            {suggestions.pagination.totalPages}
          </Button>
          <IconButton size="small">
            <KeyboardArrowRight />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
    <SuggestionDetailModal
      open={detailOpen}
      detail={selectedDetail}
      onClose={() => setDetailOpen(false)}
    />
    </>
  );
};

export default SuggestedVocabularySection;
