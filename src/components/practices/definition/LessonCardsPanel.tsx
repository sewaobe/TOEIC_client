import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    Stack,
    CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { PracticeTopicVocabulary } from "../../../types/PracticeDefinition";
import { PracticeSession } from "../../../types/PracticeSession";

interface LessonCardsPanelProps {
    lesson: PracticeTopicVocabulary;
    session?: PracticeSession;
    onStartLesson?: (lessonId: string) => void;
}

export default function LessonCardsPanel({
    lesson,
    session,
    onStartLesson,
}: LessonCardsPanelProps) {
    const isCompleted = session?.status === "completed";
    const isInProgress = session?.status === "in_progress";
    const progress = session ? (session.completed_items / session.total_items) * 100 : 0;

    return (
        <motion.div
            key={lesson._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ width: "100%" }}
        >
            <Card
                sx={{
                    width: "100%",
                    minHeight: 220, // Quay lại chiều cao ban đầu
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
                    border: "1px solid #e5e7eb",
                    transition: "all 0.25s ease",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    },
                }}
            >
                {/* Thanh accent nhẹ đầu thẻ */}
                <Box
                    sx={{
                        height: 4,
                        backgroundColor: "#2563eb",
                        opacity: 0.8,
                    }}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h6"
                        fontWeight={600}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{
                            fontSize: 16,
                            mb: 0.75,
                            color: "text.primary",
                        }}
                    >
                        <SchoolIcon sx={{ color: "#2563eb" }} fontSize="small" /> {lesson.title}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: 14,
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            minHeight: "44px",
                        }}
                    >
                        {lesson.description || "Chưa có mô tả cho bài học này."}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                        {isCompleted && (
                            <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                label="Hoàn thành"
                                size="small"
                                sx={{
                                    bgcolor: "#dcfce7",
                                    color: "#16a34a",
                                    fontWeight: 500,
                                }}
                            />
                        )}
                        {isInProgress && (
                            <Chip
                                label="Đang làm"
                                size="small"
                                sx={{
                                    bgcolor: "#fef3c7",
                                    color: "#d97706",
                                    fontWeight: 500,
                                }}
                            />
                        )}
                        <Chip
                            label={`${lesson.vocabulary_count || 0} câu hỏi`}
                            size="small"
                            sx={{
                                bgcolor: "#f5f6f8",
                                color: "#374151",
                                fontWeight: 500,
                            }}
                        />
                    </Stack>
                </CardContent>

                <CardActions sx={{ justifyContent: "space-between", alignItems: "center", px: 2, pb: 2, pt: 0 }}>
                    {/* CircularProgress bên trái */}
                    {session && session.status !== "cancelled" ? (
                        <Box sx={{ position: "relative", display: "inline-flex" }}>
                            <CircularProgress
                                variant="determinate"
                                value={progress}
                                size={40}
                                thickness={4}
                                sx={{
                                    color: isCompleted ? "#16a34a" : "#2563eb",
                                }}
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
                                    fontSize={10}
                                >
                                    {Math.round(progress)}%
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box width={40} /> // Placeholder để giữ layout
                    )}

                    {/* Button bên phải */}
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={isInProgress ? <PlayArrowIcon /> : <AutoAwesomeIcon />}
                        onClick={() => onStartLesson?.(lesson._id)}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            backgroundColor: isCompleted ? "#16a34a" : "#2563eb",
                            boxShadow: "none",
                            "&:hover": {
                                backgroundColor: isCompleted ? "#15803d" : "#1e40af",
                            },
                        }}
                    >
                        {isCompleted ? "Làm lại" : isInProgress ? "Tiếp tục" : "Bắt đầu học"}
                    </Button>
                </CardActions>
            </Card>
        </motion.div>
    );
}
