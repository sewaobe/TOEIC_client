import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { FlashcardExplore } from "../../flashCard/ExploreCard";

interface LessonCardsPanelProps {
    lesson: FlashcardExplore;
    onStartLesson?: (lessonId: string) => void;
}

export default function LessonCardsPanel({
    lesson,
    onStartLesson,
}: LessonCardsPanelProps) {
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
                    minHeight: 220,
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
                        {lesson.isNew && (
                            <Chip
                                label="Mới"
                                size="small"
                                sx={{
                                    bgcolor: "#eff6ff",
                                    color: "#2563eb",
                                    fontWeight: 500,
                                }}
                            />
                        )}
                        <Chip
                            label={`${lesson.wordCount} câu hỏi`}
                            size="small"
                            sx={{
                                bgcolor: "#f5f6f8",
                                color: "#374151",
                                fontWeight: 500,
                            }}
                        />
                    </Stack>
                </CardContent>

                <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2, pt: 0 }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={() => onStartLesson?.(lesson._id)}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            backgroundColor: "#2563eb",
                            boxShadow: "none",
                            "&:hover": {
                                backgroundColor: "#1e40af",
                            },
                        }}
                    >
                        Bắt đầu học
                    </Button>
                </CardActions>
            </Card>
        </motion.div>
    );
}
