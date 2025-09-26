import {
    Card,
    CardContent,
    Stack,
    Typography,
    Chip,
    Divider,
    Button,
    Alert,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { QCQuestion } from "../../types/Lesson";

export default function LessonSidebarExam({
    questions,
    answers,
    scorePct,
    timeLeft,
    mmss,
    onSubmit,
}: {
    questions: QCQuestion[];
    answers: Record<string, string>;
    scorePct: number;
    timeLeft: number;
    mmss: string;
    onSubmit: () => void;
}) {
    return (
        <Card
            variant="outlined"
            className="rounded-3xl"
            sx={{ position: { md: "sticky" }, top: { md: 12 } }}
        >
            <CardContent className="p-4 sm:p-6">
                {/* Timer */}
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.25 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TimerIcon />
                        <Typography variant="subtitle1" fontWeight={800}>
                            Thời gian
                        </Typography>
                    </Stack>
                    <Chip label={mmss} color={timeLeft < 60 ? "error" : "default"} />
                </Stack>

                <Divider sx={{ mb: 1.25 }} />

                {/* Navigation */}
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
                                    const el =
                                        document.querySelectorAll<HTMLElement>(
                                            "#exam-questions .MuiPaper-root"
                                        )[i];
                                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                                }}
                            />
                        );
                    })}
                </Stack>

                <Divider sx={{ my: 1.25 }} />

                {/* Score & Submit */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AssignmentTurnedInIcon color="success" />
                        <Typography variant="body2">
                            Điểm hiện tại: <b>{scorePct}%</b>
                        </Typography>
                    </Stack>
                    <Button variant="contained" size="small" onClick={onSubmit}>
                        Nộp bài
                    </Button>
                </Stack>

                {/* Alert */}
                {scorePct < 60 && (
                    <Alert severity="warning" variant="outlined" sx={{ mt: 1.25 }}>
                        Điểm dưới 60% — nên xem micro-lesson trước khi tiếp tục.
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
