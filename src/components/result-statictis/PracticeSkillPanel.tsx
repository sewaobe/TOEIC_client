import React, { useState } from "react";
import {
  Box,
  LinearProgress,
  Typography,
  Button,
  Chip,
  IconButton,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import {
  Headphones,
  MenuBook,
  Spellcheck,
  Chat,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";

// ---------------- DỮ LIỆU MẪU ----------------

// Định nghĩa kiểu dữ liệu hoạt động
type Activity = { title: string; date: string; score: number; progress: string };

const skills = [
  {
    id: "listening",
    name: "Listening",
    progress: 82,
    icon: <Headphones sx={{ color: "#7C3AED" }} />,
    color: "#EDE9FE",
  },
  {
    id: "reading",
    name: "Reading",
    progress: 68,
    icon: <MenuBook sx={{ color: "#3B82F6" }} />,
    color: "#DBEAFE",
  },
  {
    id: "vocabulary",
    name: "Vocabulary",
    progress: 75,
    icon: <Spellcheck sx={{ color: "#F59E0B" }} />,
    color: "#FEF3C7",
  },
  {
    id: "speaking",
    name: "Speaking",
    progress: 40,
    icon: <Chat sx={{ color: "#F43F5E" }} />,
    color: "#FEE2E2",
  },
];

// Giới hạn key cụ thể để TypeScript hiểu đúng
const activities: Record<"listening" | "reading" | "vocabulary" | "speaking", Activity[]> = {
  listening: [
    { title: "Luyện Part 3 - Conversation 2", date: "2025-10-25", score: 86, progress: "+3%" },
    { title: "Luyện Part 2 - Short Q&A", date: "2025-10-24", score: 82, progress: "+1%" },
    { title: "Luyện Part 1 - Photos", date: "2025-10-22", score: 90, progress: "+4%" },
    { title: "Luyện Mini Test 1", date: "2025-10-21", score: 79, progress: "+2%" },
    { title: "Luyện Part 4 - Talks", date: "2025-10-20", score: 76, progress: "-1%" },
  ],
  reading: [
    { title: "Part 7 - Reading Passage 5", date: "2025-10-26", score: 74, progress: "+2%" },
    { title: "Part 5 - Incomplete Sentences", date: "2025-10-24", score: 70, progress: "+1%" },
  ],
  vocabulary: [
    { title: "Flashcards Unit 8", date: "2025-10-23", score: 95, progress: "+5%" },
    { title: "Flashcards Unit 7", date: "2025-10-22", score: 90, progress: "+2%" },
  ],
  speaking: [
    { title: "Recording Practice 1", date: "2025-10-20", score: 67, progress: "+4%" },
  ],
};

// ---------------- COMPONENT ----------------
export default function PracticeSkillPanel() {
  const [selectedSkill, setSelectedSkill] = useState<
    "listening" | "reading" | "vocabulary" | "speaking" | null
  >(null);

  // --- State sorting + pagination ---
  const [orderBy, setOrderBy] = useState<"date" | "score">("date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (property: "date" | "score") => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // --- Lọc & sắp xếp dữ liệu an toàn ---
  const sortedActivities: Activity[] =
    selectedSkill && activities[selectedSkill]
      ? [...activities[selectedSkill]].sort((a, b) => {
          if (orderBy === "date") {
            return order === "asc"
              ? new Date(a.date).getTime() - new Date(b.date).getTime()
              : new Date(b.date).getTime() - new Date(a.date).getTime();
          } else {
            return order === "asc" ? a.score - b.score : b.score - a.score;
          }
        })
      : [];

  const paginatedData = sortedActivities.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ---------------- RENDER ----------------
  return (
    <AnimatePresence mode="wait">
      {!selectedSkill ? (
        // ----------- DANH SÁCH KỸ NĂNG -----------
        <motion.div
          key="skill-list"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {skills.map((s) => (
              <Card
                key={s.id}
                sx={{
                  borderRadius: 2,
                  p: 2,
                  bgcolor: s.color,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  {/* Left */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {s.icon}
                    <Box>
                      <Typography fontWeight={700}>{s.name}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={s.progress}
                        sx={{
                          width: 180,
                          height: 8,
                          borderRadius: 5,
                          mt: 0.5,
                          bgcolor: "rgba(255,255,255,0.4)",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Right */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={`Tiến độ ${s.progress}%`}
                      size="small"
                      sx={{ bgcolor: "white", color: "black", fontWeight: 600 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => setSelectedSkill(s.id as any)}
                    >
                      Xem chi tiết
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </motion.div>
      ) : (
        // ----------- CHI TIẾT KỸ NĂNG -----------
        <motion.div
          key="skill-detail"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            sx={{
              borderRadius: 3,
              p: 3,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <IconButton color="primary" onClick={() => setSelectedSkill(null)}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>
                {skills.find((s) => s.id === selectedSkill)?.name} – Hoạt động gần đây
              </Typography>
            </Box>

            {/* Table */}
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell>Bài luyện</TableCell>
                  <TableCell sortDirection={orderBy === "date" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "date"}
                      direction={orderBy === "date" ? order : "asc"}
                      onClick={() => handleSort("date")}
                    >
                      Ngày
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={orderBy === "score" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "score"}
                      direction={orderBy === "score" ? order : "asc"}
                      onClick={() => handleSort("score")}
                    >
                      Điểm
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Tiến bộ</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedData.map((a, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{a.title}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.score}</TableCell>
                    <TableCell sx={{ color: a.progress.includes("-") ? "red" : "green" }}>
                      {a.progress}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={sortedActivities.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Hàng mỗi trang:"
            />

            {/* Nút hành động */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button variant="contained" endIcon={<ArrowForward />} color="primary">
                Luyện tập ngay
              </Button>
            </Box>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
