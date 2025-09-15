import { Card, CardContent, Stack, Typography, Paper, Chip } from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { CurrentLesson, LessonItem } from "../../types/Lesson";

export default function LessonSidebar({
    lessons,
    lesson,
    goToLesson,
}: {
    lessons: LessonItem[];
    lesson: CurrentLesson | null;
    goToLesson: (target: LessonItem) => void;
}) {
    return (
        <Card variant="outlined" className="rounded-3xl">
            <CardContent className="p-4 sm:p-6">
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                    Bài trong ngày
                </Typography>

                <Stack spacing={1.25}>
                    {lessons.map((it) => {
                        const isActive = lesson?.id === it.id;
                        const icon = it.type === "quiz" || it.type === "mini"
                            ? <QuizIcon color="secondary" fontSize="small" />
                            : <PlayCircleOutlineIcon color="primary" fontSize="small" />;
                        const right = it.status === "locked"
                            ? <Chip size="small" variant="outlined" icon={<LockOutlinedIcon />} label="Locked" />
                            : it.status === "done"
                                ? <Chip size="small" color="success" variant="outlined" icon={<CheckCircleIcon />} label="Done" />
                                : it.status === "progress"
                                    ? <Chip size="small" color="primary" variant="outlined" label={`${it.progress ?? 0}%`} />
                                    : <Chip size="small" label="Todo" variant="outlined" />;

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
    );
}
