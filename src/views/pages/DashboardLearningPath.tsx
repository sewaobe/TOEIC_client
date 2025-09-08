// DashboardDemo.tsx
// ===============================================
// Imports
// ===============================================
import * as React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Stack,
    Typography,
    Tooltip,
    Paper,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SchoolIcon from "@mui/icons-material/School";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SpeedIcon from "@mui/icons-material/Speed";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MainLayout from "../layouts/MainLayout";
import { useNavigate } from "react-router-dom";

// ===============================================
// Mock data (bạn nối real data sau)
// ===============================================
type LessonStatus = "locked" | "todo" | "done" | "progress";
type LessonType = "core" | "quiz";

interface Lesson {
    id: string;
    week: number;
    title: string;
    type: LessonType;
    status: LessonStatus;
    progress?: number;
}

const TARGET = 750;
const PACE = "5 buổi/tuần";
const DAILY = "~90’/ngày";

const WEEKS = 8;
const ACTIVE_WEEK = 1; // W2 (0-based)

const WEEK_DONE = 3;
const WEEK_TOTAL = 5;

const LESSONS: Lesson[] = [
    { id: "W1-L1", week: 1, title: "Core Lesson 1", type: "core", status: "done", progress: 100 },
    { id: "W1-L2", week: 1, title: "Core Lesson 2", type: "core", status: "progress", progress: 60 },
    { id: "W1-Q1", week: 1, title: "Quick Quiz A", type: "quiz", status: "todo" },
    { id: "W1-L3", week: 1, title: "Core Lesson 3", type: "core", status: "locked" },
    { id: "W1-T1", week: 1, title: "Mini Test 1", type: "quiz", status: "locked" },
];

// ===============================================
// Small UI helpers (glass section / stat item / lesson item)
// ===============================================
function Section({ children }: { children: React.ReactNode }) {
    return (
        <Card
            variant="outlined"
            className="rounded-3xl"
            sx={{
                borderColor: "rgba(0,0,0,0.06)",
                bgcolor: "background.paper",
            }}
        >
            <CardContent className="p-4 sm:p-6">{children}</CardContent>
        </Card>
    );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <Paper
            variant="outlined"
            className="rounded-2xl"
            sx={{
                p: 2.5,
                borderColor: "rgba(0,0,0,0.06)",
                bgcolor: (t) => (t.palette.mode === "light" ? "#F8FAFC" : "rgba(255,255,255,0.06)"),
            }}
        >
            <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                    sx={{
                        p: 1,
                        borderRadius: 1.5,
                        bgcolor: (t) => (t.palette.mode === "light" ? "#EEF2FF" : "rgba(255,255,255,0.08)"),
                        border: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        {label}
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>{value}</Typography>
                </Box>
            </Stack>
        </Paper>
    );
}

function LessonItem({ data, onOpen }: { data: Lesson; onOpen: (l: Lesson) => void }) {
    const isLocked = data.status === "locked";
    const isDone = data.status === "done";
    const inProgress = data.status === "progress";

    const leftIcon =
        data.type === "quiz" ? <QuizIcon color="secondary" /> : <PlayCircleOutlineIcon color="primary" />;

    return (
        <Paper
            variant="outlined"
            className="rounded-xl"
            sx={{
                p: 2.25,
                borderColor: "rgba(0,0,0,0.06)",
                bgcolor: (t) => (t.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.06)"),
                opacity: isLocked ? 0.6 : 1,
                cursor: isLocked ? "not-allowed" : "pointer",
                transition: "all .15s ease",
                "&:hover": !isLocked ? { boxShadow: "0 6px 20px rgba(0,0,0,0.08)", transform: "translateY(-1px)" } : {},
            }}
            onClick={() => !isLocked && onOpen(data)}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                    {leftIcon}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{data.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {data.type === "core" ? "Bài học nền tảng" : "Bài kiểm tra nhanh"}
                        </Typography>
                    </Box>
                </Stack>

                {isLocked ? (
                    <Chip size="small" variant="outlined" icon={<LockOutlinedIcon />} label="Locked" />
                ) : isDone ? (
                    <Chip size="small" color="success" icon={<CheckCircleIcon />} label="Hoàn thành" variant="outlined" />
                ) : inProgress ? (
                    <Chip size="small" color="primary" variant="outlined" label={`Đã làm ${data.progress ?? 0}%`} />
                ) : (
                    <Chip size="small" color="primary" label="Bắt đầu" />
                )}
            </Stack>
        </Paper>
    );
}

// ===============================================
// Main: Dashboard
// ===============================================
export default function DashboardDemo() {
    const [activeWeek, setActiveWeek] = React.useState<number>(ACTIVE_WEEK);
    const weekPercent = Math.round((WEEK_DONE / WEEK_TOTAL) * 100);
    const navigate = useNavigate();
    // Điều hướng sang trang học — không cần router
    const openLesson = (l: Lesson) => {
        localStorage.setItem("current_lesson", JSON.stringify(l));
        // bạn có router thì thay bằng navigate("/lesson/" + l.id)
        navigate("/lesson")
    };

    return (
        <MainLayout>
            <Box
                sx={{
                    minHeight: "100vh",
                    width: "100%",
                    background: "linear-gradient(135deg, #F5F7FA 0%, #E6EDF6 100%)",
                    py: "3%",
                    display: "flex",
                }}
            >
                <Container
                    className="max-w-[1000px] mx-auto p-4 sm:p-6 flex-1"
                    sx={{
                        borderRadius: "36px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        bgcolor: (t) => (t.palette.mode === "light" ? "#FFFFFFCC" : "rgba(255,255,255,0.08)"),
                        backdropFilter: "blur(18px)",
                        boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
                    }}
                >
                    {/* ===== Header ===== */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        className="sticky top-0 z-10"
                        sx={{
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: (t) =>
                                t.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.04)",
                            px: 2,
                            py: 1.25,
                            borderRadius: "16px",
                            mb: 2,
                        }}
                    >
                        <SchoolIcon color="primary" />
                        <Typography variant="h4" fontWeight={900}>
                            Chương trình học
                        </Typography>
                    </Stack>

                    {/* ===== Stat bar ===== */}
                    <Section>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}><StatItem icon={<EmojiEventsIcon color="primary" />} label="Mục tiêu điểm" value={TARGET} /></Grid>
                            <Grid size={{ xs: 12, sm: 4 }}><StatItem icon={<SpeedIcon color="secondary" />} label="Nhịp độ" value={PACE} /></Grid>
                            <Grid size={{ xs: 12, sm: 4 }}><StatItem icon={<AccessTimeIcon color="success" />} label="Thời lượng" value={DAILY} /></Grid>
                        </Grid>
                    </Section>

                    <Box sx={{ my: 2.5 }} />

                    {/* ===== Weekly progress ===== */}
                    <Section>
                        <Stack spacing={2}>
                            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between">
                                <Typography variant="h6" fontWeight={800}>
                                    Week {activeWeek + 1} · {WEEK_DONE}/{WEEK_TOTAL} bài
                                </Typography>
                                <Box sx={{ position: "relative", display: "inline-flex" }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={weekPercent}
                                        size={44}
                                        thickness={4}
                                    />
                                    <Box
                                        sx={{
                                            top: 0,
                                            left: 0,
                                            bottom: 0,
                                            right: 0,
                                            position: "absolute",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            component="div"
                                            color="text.secondary"
                                            fontWeight={600}
                                        >
                                            {`${weekPercent}%`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>

                            <Divider />

                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {Array.from({ length: WEEKS }, (_, i) => {
                                    const active = i === activeWeek;
                                    return (
                                        <Chip
                                            key={i}
                                            label={`W${i + 1}`}
                                            clickable
                                            color={active ? "primary" : undefined}
                                            variant={active ? "filled" : "outlined"}
                                            onClick={() => setActiveWeek(i)}
                                            sx={{ borderRadius: 999 }}
                                        />
                                    );
                                })}
                            </Stack>
                        </Stack>
                    </Section>

                    <Box sx={{ my: 2.5 }} />

                    {/* ===== Lessons ===== */}
                    <Section>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <Typography variant="h6" fontWeight={800}>Danh sách bài học</Typography>
                            <Chip size="small" variant="outlined" label={`Week ${activeWeek + 1}`} />
                        </Stack>

                        <Grid container spacing={1.5}>
                            {LESSONS.filter(l => l.week === 1).map((l) => (
                                <Grid size={{ xs: 12, sm: 6 }} key={l.id}>
                                    <LessonItem data={l} onOpen={openLesson} />
                                </Grid>
                            ))}
                        </Grid>
                    </Section>
                </Container>
            </Box>
        </MainLayout>
    );
}
