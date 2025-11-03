import React, { useState, useEffect } from "react";
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
  CircularProgress,
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
import { progressService } from "../../services/progress.service";
import { useNavigate } from "react-router-dom";

// ---------------- TYPES ----------------
type Activity = { title: string; date: string; score: number; progress: string };

interface PracticeSkillPanelProps {
  filterYear: number;
  filterMonth: number | "all";
}

// ---------------- COMPONENT ----------------
export default function PracticeSkillPanel({ filterYear, filterMonth }: PracticeSkillPanelProps) {
  // --- State ---
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [skills, setSkills] = useState([
    {
      id: "listening",
      name: "Listening",
      progress: 0,
      icon: <Headphones sx={{ color: "#7C3AED" }} />,
      color: "#EDE9FE",
    },
    {
      id: "reading",
      name: "Reading",
      progress: 0,
      icon: <MenuBook sx={{ color: "#3B82F6" }} />,
      color: "#DBEAFE",
    },
    {
      id: "vocabulary",
      name: "Vocabulary",
      progress: 0,
      icon: <Spellcheck sx={{ color: "#F59E0B" }} />,
      color: "#FEF3C7",
    },
    {
      id: "speaking",
      name: "Speaking",
      progress: 0,
      icon: <Chat sx={{ color: "#F43F5E" }} />,
      color: "#FEE2E2",
    },
  ]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<
    "listening" | "reading" | "vocabulary" | "speaking" | null
  >(null);

  // --- State sorting + pagination ---
  const [orderBy, setOrderBy] = useState<"date" | "score">("date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // --- Fetch Skills Overview ---
  useEffect(() => {
    const fetchSkillsOverview = async () => {
      setIsLoading(true);
      try {
        const data = await progressService.getSkillsOverview();
        setSkills((prev) =>
          prev.map((skill) => ({
            ...skill,
            progress: data[skill.id as keyof typeof data] || 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching skills overview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillsOverview();
  }, [filterYear, filterMonth]);

  // --- Fetch Activities khi chọn skill ---
  useEffect(() => {
    if (!selectedSkill) return;

    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = await progressService.getSkillActivities(selectedSkill);
        setActivities(data);
        setPage(0); // Reset về trang đầu
      } catch (error) {
        console.error("Error fetching skill activities:", error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [selectedSkill]);

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
  const sortedActivities: Activity[] = [...activities].sort((a, b) => {
    if (orderBy === "date") {
      return order === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return order === "asc" ? a.score - b.score : b.score - a.score;
    }
  });

  const paginatedData = sortedActivities.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ---------------- RENDER ----------------
  if (isLoading && !selectedSkill) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
                      label={`Độ chính xác ${s.progress}%`}
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">Chưa có dữ liệu luyện tập</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((a, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{a.title}</TableCell>
                      <TableCell>{a.date}</TableCell>
                      <TableCell>{a.score}</TableCell>
                      <TableCell sx={{ color: a.progress.includes("-") ? "red" : "green" }}>
                        {a.progress}
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
              <Button variant="contained" endIcon={<ArrowForward />} color="primary" onClick={() => {
                if (selectedSkill === "listening") {
                  navigate("/practice-skill/dictation");
                } else if (selectedSkill === "reading") {
                  navigate("/practice-skill/mini-test");
                } else if (selectedSkill === "vocabulary") {
                  navigate("/flash-cards");
                } else {
                  navigate("/practice-skill/shadowing");
                }
              }}>
                Luyện tập ngay
              </Button>
            </Box>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
