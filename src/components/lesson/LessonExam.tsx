import { Card, CardContent, Divider, Stack, Typography, Paper, RadioGroup, FormControlLabel, Radio, Button } from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import TimerIcon from "@mui/icons-material/Timer";
import { QCQuestion } from "../../types/Lesson";

export default function LessonExam({
    questions,
    answers,
    setAnswers,
    scorePct,
    timeLeft,
    mmss,
    lessonType,
    onSubmit,
}: {
    questions: QCQuestion[];
    answers: Record<string, string>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    scorePct: number;
    timeLeft: number;
    mmss: string;
    lessonType: string;
    onSubmit: () => void;
}) {
    return (
        <Card variant="outlined" className="rounded-3xl">
            <CardContent className="p-4 sm:p-6">
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AssignmentTurnedInIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight={800}>
                            {lessonType === "quiz" ? "Quick Quiz" : "Mini Test"}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TimerIcon color={timeLeft < 60 ? "error" : "action"} />
                        <Typography variant="subtitle2" fontWeight={700}>{mmss}</Typography>
                    </Stack>
                </Stack>

                <Divider sx={{ mb: 2 }} />

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
                    <Button variant="contained" onClick={onSubmit}>
                        Nộp bài
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
