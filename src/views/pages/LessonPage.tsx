import * as React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    Typography,
    TextField,
    Divider,
    Alert,
    Grid,
    RadioGroup,
    FormControlLabel,
    Radio,
    Paper,
    Chip,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SchoolIcon from "@mui/icons-material/School";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TimerIcon from "@mui/icons-material/Timer";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

// ==========================================================
// Types & LocalStorage helpers
// ==========================================================
type LessonStatus = "locked" | "todo" | "done" | "progress";
type LessonType = "core" | "quiz" | "mini";

interface LessonItem {
    id: string;
    week: number; // 1-based
    title: string;
    type: LessonType;
    status: LessonStatus;
    progress?: number; // 0..100
}

interface CurrentLesson {
    id: string;
    week: number;
    title: string;
    type: LessonType;
}

const LS_CURRENT = "current_lesson";
const LS_WEEK_LESSONS = "week_lessons";

function readCurrentLesson(): CurrentLesson | null {
    try {
        const raw = localStorage.getItem(LS_CURRENT);
        return raw ? (JSON.parse(raw) as CurrentLesson) : null;
    } catch {
        return null;
    }
}

function ensureWeekLessons(): LessonItem[] {
    try {
        const raw = localStorage.getItem(LS_WEEK_LESSONS);
        if (raw) return JSON.parse(raw) as LessonItem[];
    } catch { }
    // seed dữ liệu mẫu cho Week 1: có Quiz A & Mini Test 1 khác nhau
    const seed: LessonItem[] = [
        { id: "W1-L1", week: 1, title: "Core Lesson 1", type: "core", status: "done", progress: 100 },
        { id: "W1-L2", week: 1, title: "Core Lesson 2", type: "core", status: "progress", progress: 60 },
        { id: "W1-Q1", week: 1, title: "Quick Quiz A", type: "quiz", status: "todo" },
        { id: "W1-L3", week: 1, title: "Core Lesson 3", type: "core", status: "locked" },
        { id: "W1-T1", week: 1, title: "Mini Test 1", type: "mini", status: "locked" },
    ];
    localStorage.setItem(LS_WEEK_LESSONS, JSON.stringify(seed));
    return seed;
}

// ==========================================================
// Question bank (mock cứng): QUIZ vs MINI TEST
// ==========================================================
type QCOption = { key: string; text: string };
type QCQuestion = { id: string; text: string; options: QCOption[]; answer: string };

const QUIZ_A: QCQuestion[] = [
    {
        id: "q1",
        text: "Chọn từ đồng nghĩa với “rapidly”",
        options: [
            { key: "A", text: "slowly" },
            { key: "B", text: "quickly" },
            { key: "C", text: "softly" },
            { key: "D", text: "quietly" },
        ],
        answer: "B",
    },
    {
        id: "q2",
        text: "Điền mạo từ đúng: ___ hour",
        options: [
            { key: "A", text: "a" },
            { key: "B", text: "an" },
            { key: "C", text: "the" },
            { key: "D", text: "no article" },
        ],
        answer: "B",
    },
    {
        id: "q3",
        text: "Chọn đáp án sai về thì hiện tại hoàn thành:",
        options: [
            { key: "A", text: "have/has + V3/ed" },
            { key: "B", text: "dùng cho trải nghiệm" },
            { key: "C", text: "diễn tả hành động đã kết thúc ở quá khứ cụ thể" },
            { key: "D", text: "dùng với since/for" },
        ],
        answer: "C",
    },
    {
        id: "q4",
        text: "Từ trái nghĩa với “expand” là:",
        options: [
            { key: "A", text: "contract" },
            { key: "B", text: "enlarge" },
            { key: "C", text: "extend" },
            { key: "D", text: "increase" },
        ],
        answer: "A",
    },
    {
        id: "q5",
        text: "Điền giới từ: “be responsible ___”",
        options: [
            { key: "A", text: "for" },
            { key: "B", text: "to" },
            { key: "C", text: "with" },
            { key: "D", text: "of" },
        ],
        answer: "A",
    },
];

const MINI_TEST_1: QCQuestion[] = [
    // Listening-style (mock)
    {
        id: "m1",
        text: "[Listening] Người nói dự định làm gì tiếp theo?",
        options: [
            { key: "A", text: "Gọi điện cho khách hàng" },
            { key: "B", text: "Gửi email xác nhận" },
            { key: "C", text: "Đi họp" },
            { key: "D", text: "In tài liệu" },
        ],
        answer: "C",
    },
    {
        id: "m2",
        text: "[Listening] Đoạn băng nói đến vấn đề gì?",
        options: [
            { key: "A", text: "Chậm tiến độ" },
            { key: "B", text: "Tăng giá" },
            { key: "C", text: "Nhầm lịch" },
            { key: "D", text: "Thiếu nhân sự" },
        ],
        answer: "A",
    },
    // Reading-style (mock)
    {
        id: "m3",
        text: "[Reading] Chọn đáp án đúng để hoàn thành câu: “The report will be ready ___ Friday.”",
        options: [
            { key: "A", text: "in" },
            { key: "B", text: "on" },
            { key: "C", text: "at" },
            { key: "D", text: "by" },
        ],
        answer: "B",
    },
    {
        id: "m4",
        text: "[Reading] Đồng nghĩa gần nhất với “subsequently” là:",
        options: [
            { key: "A", text: "previously" },
            { key: "B", text: "meanwhile" },
            { key: "C", text: "afterwards" },
            { key: "D", text: "immediately" },
        ],
        answer: "C",
    },
    {
        id: "m5",
        text: "[Reading] Chọn mệnh đề quan hệ đúng: “The manager, ___ we met yesterday, approved the plan.”",
        options: [
            { key: "A", text: "that" },
            { key: "B", text: "who" },
            { key: "C", text: "whom" },
            { key: "D", text: "whose" },
        ],
        answer: "C",
    },
    {
        id: "m6",
        text: "[Reading] Từ trái nghĩa với “scarce” là:",
        options: [
            { key: "A", text: "rare" },
            { key: "B", text: "plentiful" },
            { key: "C", text: "insufficient" },
            { key: "D", text: "minimal" },
        ],
        answer: "B",
    },
    {
        id: "m7",
        text: "[Reading] Điền giới từ: “be acquainted ___ the procedure”",
        options: [
            { key: "A", text: "with" },
            { key: "B", text: "to" },
            { key: "C", text: "of" },
            { key: "D", text: "about" },
        ],
        answer: "A",
    },
    {
        id: "m8",
        text: "[Reading] Hoàn thành câu: “The new policy aims to ___ productivity.”",
        options: [
            { key: "A", text: "reduce" },
            { key: "B", text: "enhance" },
            { key: "C", text: "diminish" },
            { key: "D", text: "lessen" },
        ],
        answer: "B",
    },
    {
        id: "m9",
        text: "[Reading] Chọn thì đúng: “By next month, we ___ the prototype.”",
        options: [
            { key: "A", text: "finish" },
            { key: "B", text: "will finish" },
            { key: "C", text: "will have finished" },
            { key: "D", text: "have finished" },
        ],
        answer: "C",
    },
    {
        id: "m10",
        text: "[Reading] Chọn cụm đúng: “in accordance ___ the guidelines”",
        options: [
            { key: "A", text: "to" },
            { key: "B", text: "of" },
            { key: "C", text: "with" },
            { key: "D", text: "at" },
        ],
        answer: "C",
    },
];

function getQuestionSet(lesson: CurrentLesson | null): QCQuestion[] {
    if (!lesson) return [];
    if (lesson.type === "quiz") return QUIZ_A;
    if (lesson.type === "mini") return MINI_TEST_1;
    return [];
}

function grade(questions: QCQuestion[], answers: Record<string, string>): number {
    if (questions.length === 0) return 0;
    const correct = questions.filter((q) => answers[q.id] === q.answer).length;
    return Math.round((correct / questions.length) * 100);
}

// Thời lượng gợi ý (phút)
function getDurationMinutes(lesson: CurrentLesson | null): number {
    if (!lesson) return 0;
    if (lesson.type === "quiz") return 1; // quiz ngắn ~8'
    if (lesson.type === "mini") return 25; // mini-test dài hơn ~25'
    return 0;
}

// ==========================================================
// Main Page
// ==========================================================
export default function LessonPage() {
    const navigate = useNavigate();

    // dữ liệu bài hiện tại + danh sách tuần
    const [lesson, setLesson] = React.useState<CurrentLesson | null>(readCurrentLesson());
    const [lessons, setLessons] = React.useState<LessonItem[]>(ensureWeekLessons());

    // state ghi chú (cho core) & câu trả lời (cho quiz/mini)
    const [note, setNote] = React.useState("");
    const [answers, setAnswers] = React.useState<Record<string, string>>({});

    // exam mode (khi quiz/mini và đã bắt đầu)
    const [examStarted, setExamStarted] = React.useState<boolean>(false);

    // timer countdown cho exam mode
    const [timeLeft, setTimeLeft] = React.useState<number>(0); // giây

    // helpers điều hướng
    const currentIndex = React.useMemo(() => {
        if (!lesson) return -1;
        return lessons.findIndex((l) => l.id === lesson.id);
    }, [lesson, lessons]);

    const goToLesson = (target: LessonItem) => {
        const payload: CurrentLesson = { id: target.id, title: target.title, type: target.type, week: target.week };
        localStorage.setItem(LS_CURRENT, JSON.stringify(payload));
        setLesson(payload);
        setAnswers({});
        setExamStarted(false);
        setTimeLeft(0);
    };

    // Mở khóa bài tiếp theo & điều hướng
    const markCompleteAndNext = (scorePct?: number) => {
        if (currentIndex >= 0) {
            const newList = [...lessons];
            const cur = { ...newList[currentIndex] };
            cur.status = "done";
            cur.progress = 100;
            newList[currentIndex] = cur;

            const next = newList[currentIndex + 1];
            if (next && next.status === "locked") next.status = "todo";

            localStorage.setItem(LS_WEEK_LESSONS, JSON.stringify(newList));
            setLessons(newList);
        }

        const nextItem = lessons[currentIndex + 1];
        if (nextItem) {
            goToLesson(nextItem);
        } else {
            navigate("/programs");
        }
    };

    // Khi đổi bài → reset trạng thái exam & timer
    React.useEffect(() => {
        setExamStarted(false);
        setAnswers({});
        const durMin = getDurationMinutes(lesson);
        setTimeLeft(durMin > 0 ? durMin * 60 : 0);
    }, [lesson?.id, lesson?.type]);

    // Đếm ngược timer khi ở exam mode
    React.useEffect(() => {
        if (!examStarted || timeLeft <= 0) return;
        const itv = setInterval(() => {
            setTimeLeft((s) => {
                if (s <= 1) {
                    clearInterval(itv);
                    // hết giờ → auto chấm & sang bước nộp
                    const qs = getQuestionSet(lesson);
                    const sc = grade(qs, answers);
                    // eslint-disable-next-line no-alert
                    alert(`Hết giờ! Điểm của bạn: ${sc}%`);
                    markCompleteAndNext(sc);
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(itv);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examStarted, timeLeft]);

    // Format mm:ss
    const mmss = React.useMemo(() => {
        const m = Math.floor(timeLeft / 60)
            .toString()
            .padStart(2, "0");
        const s = Math.floor(timeLeft % 60)
            .toString()
            .padStart(2, "0");
        return `${m}:${s}`;
    }, [timeLeft]);

    // Điểm hiện tại (tính động từ answers)
    const questions = React.useMemo(() => getQuestionSet(lesson), [lesson?.id, lesson?.type]);
    const scorePct = React.useMemo(() => grade(questions, answers), [questions, answers]);

    // ---- Core Quick Check (ngắn, 3 câu) ----
    const CORE_CHECK: QCQuestion[] = [
        {
            id: "c1",
            text: "Chọn từ đồng nghĩa với “assist”",
            options: [
                { key: "A", text: "help" },
                { key: "B", text: "hinder" },
                { key: "C", text: "ignore" },
                { key: "D", text: "refuse" },
            ],
            answer: "A",
        },
        {
            id: "c2",
            text: "Điền giới từ: “be good ___ listening”",
            options: [
                { key: "A", text: "at" },
                { key: "B", text: "in" },
                { key: "C", text: "for" },
                { key: "D", text: "to" },
            ],
            answer: "A",
        },
        {
            id: "c3",
            text: "Chọn đáp án sai: Cách phát âm đuôi -ed",
            options: [
                { key: "A", text: "/t/" },
                { key: "B", text: "/d/" },
                { key: "C", text: "/id/" },
                { key: "D", text: "/g/" },
            ],
            answer: "D",
        },
    ];

    // state riêng cho core quick check
    const [coreAnswers, setCoreAnswers] = React.useState<Record<string, string>>({});
    const coreScore = React.useMemo(() => grade(CORE_CHECK, coreAnswers), [coreAnswers]);

    return (
        <MainLayout>
            <Box
                sx={{
                    minHeight: "100vh",
                    width: "100%",
                    background: "linear-gradient(135deg, #F5F7FA 0%, #E6EDF6 100%)",
                    py: "3%",
                }}
            >
                <Container
                    className="max-w-[1000px] mx-auto p-4 sm:p-6"
                    sx={{
                        borderRadius: "36px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        bgcolor: (t) => (t.palette.mode === "light" ? "#FFFFFFCC" : "rgba(255,255,255,0.08)"),
                        backdropFilter: "blur(18px)",
                        boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
                    }}
                >
                    {/* ===== Header: Left Exit Button + Centered Title ===== */}
                    <Box
                        className="sticky top-0 z-10"
                        sx={{
                            border: "1px solid rgba(0,0,0,0.06)",
                            bgcolor: (t) => (t.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.04)"),
                            px: 2,
                            py: 1.25,
                            borderRadius: "16px",
                            mb: 2,
                            position: "relative",
                        }}
                    >
                        <Button
                            startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                            variant="text"
                            color="inherit"
                            size="small"
                            onClick={() => navigate("/programs")}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                px: 1.25,
                                borderRadius: 999,
                                border: "1px solid rgba(0,0,0,0.08)",
                                position: "absolute",
                                left: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                minHeight: 32,
                            }}
                        >
                            Thoát
                        </Button>

                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                            <SchoolIcon color="primary" />
                            <Typography variant="h5" fontWeight={900}>
                                {lesson ? `${lesson.title} (${lesson.id})` : "Bài học"}
                            </Typography>
                        </Stack>
                    </Box>

                    {/* ===== Main layout: 70/30 hoặc Exam Mode ===== */}
                    <Grid container spacing={2}>
                        {/* LEFT COLUMN */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            {/* ===== CORE MODE (không phải quiz/mini hoặc chưa start) ===== */}
                            {(
                                !lesson ||
                                lesson?.type === "core" ||
                                ((lesson?.type === "quiz" || lesson?.type === "mini") && !examStarted)
                            ) && (
                                    <>
                                        {/* Core: Media; Quiz/Mini chưa start: Intro */}
                                        {lesson?.type === "core" ? (
                                            <Card variant="outlined" className="rounded-3xl" sx={{ mb: 2 }}>
                                                <CardContent className="p-4 sm:p-6">
                                                    <Box
                                                        sx={{
                                                            width: "100%",
                                                            aspectRatio: "16/9",
                                                            borderRadius: "16px",
                                                            bgcolor: (t) => (t.palette.mode === "light" ? "#F2F4F8" : "rgba(255,255,255,0.06)"),
                                                            border: "1px dashed rgba(0,0,0,0.15)",
                                                            display: "grid",
                                                            placeItems: "center",
                                                        }}
                                                    >
                                                        <Typography color="text.secondary">Khung video/audio/đọc</Typography>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        ) : (
                                            <Card variant="outlined" className="rounded-3xl" sx={{ mb: 2 }}>
                                                <CardContent className="p-4 sm:p-6">
                                                    <Stack spacing={1}>
                                                        <Typography variant="h6" fontWeight={800}>
                                                            Bắt đầu {lesson?.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {lesson?.type === "quiz"
                                                                ? `Quick Quiz gồm ${getQuestionSet(lesson).length} câu, thời lượng ~${getDurationMinutes(lesson)} phút.`
                                                                : `Mini Test gồm ${getQuestionSet(lesson).length} câu, thời lượng ~${getDurationMinutes(lesson)} phút.`}
                                                            {" "}Hoàn thành để mở khóa bài tiếp theo.
                                                        </Typography>
                                                        <Stack direction="row" spacing={1}>
                                                            <Chip size="small" label={`Thời lượng: ~${getDurationMinutes(lesson)}’`} variant="outlined" />
                                                            <Chip size="small" label="Tự chấm điểm ngay" variant="outlined" />
                                                        </Stack>
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => {
                                                                setExamStarted(true);
                                                                const durMin = getDurationMinutes(lesson);
                                                                setTimeLeft(durMin > 0 ? durMin * 60 : 0);
                                                                requestAnimationFrame(() => {
                                                                    document.getElementById("exam-questions")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                                                });
                                                            }}
                                                            sx={{ alignSelf: "flex-start", mt: 1 }}
                                                        >
                                                            Bắt đầu làm bài
                                                        </Button>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Chỉ hiển thị Notes + Quick Check cho CORE */}
                                        {lesson?.type === "core" && (
                                            <Card
                                                variant="outlined"
                                                className="rounded-3xl"
                                                sx={{ position: { md: "sticky" }, top: { md: 12 } }}
                                            >
                                                <CardContent className="p-4 sm:p-6">
                                                    <Stack spacing={1}>
                                                        <Typography variant="subtitle1" fontWeight={800}>
                                                            Quick Notes
                                                        </Typography>
                                                        <TextField
                                                            placeholder="Ghi chú nhanh..."
                                                            multiline
                                                            minRows={3}
                                                            value={note}
                                                            onChange={(e) => setNote(e.target.value)}
                                                            fullWidth
                                                        />
                                                    </Stack>

                                                    <Divider sx={{ my: 1.5 }} />

                                                    {/* Header Quick Check: tiêu đề + điểm + action */}
                                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                                        <Typography variant="subtitle1" fontWeight={800}>Quick Check</Typography>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Chip
                                                                label={`Điểm: ${coreScore}%`}
                                                                color={coreScore < 60 ? "warning" : "success"}
                                                                variant="outlined"
                                                            />
                                                            <Button variant="contained" onClick={() => markCompleteAndNext()}>
                                                                Hoàn thành & tiếp theo
                                                            </Button>
                                                        </Stack>
                                                    </Stack>

                                                    {/* Câu hỏi trắc nghiệm cho CORE */}
                                                    <Stack spacing={1.25} sx={{ mb: 2 }}>
                                                        {CORE_CHECK.map((q) => (
                                                            <Paper key={q.id} variant="outlined" className="rounded-xl" sx={{ p: 1.5 }}>
                                                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                                                    {q.text}
                                                                </Typography>
                                                                <RadioGroup
                                                                    value={coreAnswers[q.id] ?? ""}
                                                                    onChange={(e) => setCoreAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
                                                                >
                                                                    {q.options.map((op) => (
                                                                        <FormControlLabel
                                                                            key={op.key}
                                                                            value={op.key}
                                                                            control={<Radio size="small" />}
                                                                            label={`${op.key}. ${op.text}`}
                                                                        />
                                                                    ))}
                                                                </RadioGroup>
                                                            </Paper>
                                                        ))}
                                                    </Stack>

                                                    {/* Gợi ý học thêm khi điểm thấp */}
                                                    {coreScore < 60 && (
                                                        <Alert severity="warning" variant="outlined">
                                                            Điểm dưới 60% — gợi ý xem lại mục chính của bài trước khi sang bài tiếp theo.
                                                        </Alert>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </>
                                )}

                            {/* ===== EXAM MODE (quiz/mini + started) ===== */}
                            {lesson?.type !== "core" && examStarted && (
                                <Card variant="outlined" className="rounded-3xl">
                                    <CardContent className="p-4 sm:p-6">
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            sx={{ mb: 1.5 }}
                                        >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <AssignmentTurnedInIcon color="primary" />
                                                <Typography variant="subtitle1" fontWeight={800}>
                                                    {lesson?.type === "quiz" ? "Quick Quiz" : "Mini Test"}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <TimerIcon color={timeLeft < 60 ? "error" : "action"} />
                                                <Typography variant="subtitle2" fontWeight={700}>{mmss}</Typography>
                                            </Stack>
                                        </Stack>

                                        <Divider sx={{ mb: 2 }} />

                                        {/* CÂU HỎI */}
                                        <Stack id="exam-questions" spacing={1.25}>
                                            {questions.map((q, idx) => (
                                                <Paper key={q.id} variant="outlined" className="rounded-xl" sx={{ p: 1.5 }}>
                                                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                                                        Câu {idx + 1}. {q.text}
                                                    </Typography>
                                                    <RadioGroup
                                                        value={answers[q.id] ?? ""}
                                                        onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
                                                    >
                                                        {q.options.map((op) => (
                                                            <FormControlLabel
                                                                key={op.key}
                                                                value={op.key}
                                                                control={<Radio size="small" />}
                                                                label={`${op.key}. ${op.text}`}
                                                            />
                                                        ))}
                                                    </RadioGroup>
                                                </Paper>
                                            ))}
                                        </Stack>

                                        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                onClick={() => {
                                                    const sc = scorePct;
                                                    // eslint-disable-next-line no-alert
                                                    alert(`Bạn đã nộp bài. Điểm: ${sc}%`);
                                                    markCompleteAndNext(sc);
                                                }}
                                            >
                                                Nộp bài
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                        {/* RIGHT COLUMN */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            {/* Panel phải bình thường (danh sách bài trong tuần) khi KHÔNG ở exam mode */}
                            {(
                                !lesson ||
                                lesson?.type === "core" ||
                                ((lesson?.type === "quiz" || lesson?.type === "mini") && !examStarted)
                            ) && (
                                    <Card variant="outlined" className="rounded-3xl">
                                        <CardContent className="p-4 sm:p-6">
                                            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                                                Bài trong tuần
                                            </Typography>

                                            <Stack spacing={1.25}>
                                                {lessons.map((it) => {
                                                    const isActive = lesson?.id === it.id;
                                                    const icon =
                                                        it.type === "quiz" || it.type === "mini" ? (
                                                            <QuizIcon color="secondary" fontSize="small" />
                                                        ) : (
                                                            <PlayCircleOutlineIcon color="primary" fontSize="small" />
                                                        );
                                                    const right =
                                                        it.status === "locked" ? (
                                                            <Chip size="small" variant="outlined" icon={<LockOutlinedIcon />} label="Locked" />
                                                        ) : it.status === "done" ? (
                                                            <Chip size="small" color="success" variant="outlined" icon={<CheckCircleIcon />} label="Done" />
                                                        ) : it.status === "progress" ? (
                                                            <Chip size="small" color="primary" variant="outlined" label={`${it.progress ?? 0}%`} />
                                                        ) : (
                                                            <Chip size="small" label="Todo" variant="outlined" />
                                                        );

                                                    return (
                                                        <Paper
                                                            key={it.id}
                                                            variant="outlined"
                                                            className="rounded-lg"
                                                            sx={{
                                                                p: 1.25,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                gap: 1,
                                                                borderColor: isActive ? "primary.main" : "rgba(0,0,0,0.08)",
                                                                bgcolor: isActive ? "rgba(37,99,235,0.06)" : "background.paper",
                                                                opacity: it.status === "locked" ? 0.6 : 1,
                                                                cursor: it.status === "locked" ? "not-allowed" : "pointer",
                                                            }}
                                                            onClick={() => it.status !== "locked" && goToLesson(it)}
                                                        >
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                {icon}
                                                                <Typography variant="body2" fontWeight={600}>{it.title}</Typography>
                                                            </Stack>
                                                            {right}
                                                        </Paper>
                                                    );
                                                })}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                )}

                            {/* Panel phải khi EXAM MODE: Timer + Navigator + Submit nhanh */}
                            {lesson?.type !== "core" && examStarted && (
                                <Card variant="outlined" className="rounded-3xl" sx={{ position: { md: "sticky" }, top: { md: 12 } }}>
                                    <CardContent className="p-4 sm:p-6">
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <TimerIcon />
                                                <Typography variant="subtitle1" fontWeight={800}>Thời gian</Typography>
                                            </Stack>
                                            <Chip label={mmss} color={timeLeft < 60 ? "error" : "default"} />
                                        </Stack>

                                        <Divider sx={{ mb: 1.25 }} />

                                        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                                            Câu hỏi
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {questions.map((q, i) => {
                                                const answered = !!answers[q.id];
                                                return (
                                                    <Chip
                                                        key={q.id}
                                                        label={i + 1}
                                                        size="small"
                                                        variant={answered ? "filled" : "outlined"}
                                                        color={answered ? "primary" : "default"}
                                                        onClick={() => {
                                                            // cuộn gần đúng tới câu i
                                                            const el = document.querySelectorAll<HTMLElement>("#exam-questions .MuiPaper-root")[i];
                                                            el?.scrollIntoView({ behavior: "smooth", block: "center" });
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Stack>

                                        <Divider sx={{ my: 1.25 }} />

                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <AssignmentTurnedInIcon color="success" />
                                                <Typography variant="body2">Điểm hiện tại: <b>{scorePct}%</b></Typography>
                                            </Stack>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => {
                                                    const sc = scorePct;
                                                    // eslint-disable-next-line no-alert
                                                    alert(`Bạn đã nộp bài. Điểm: ${sc}%`);
                                                    markCompleteAndNext(sc);
                                                }}
                                            >
                                                Nộp bài
                                            </Button>
                                        </Stack>

                                        {scorePct < 60 && (
                                            <Alert severity="warning" variant="outlined" sx={{ mt: 1.25 }}>
                                                Điểm dưới 60% — nên xem micro-lesson trước khi tiếp tục.
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </MainLayout>
    );
}
