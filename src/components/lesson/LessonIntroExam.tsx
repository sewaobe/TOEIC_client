

// Intro card riêng cho Quiz/Mini khi chưa start
import { Card, CardContent, Stack, Typography, Chip, Button } from "@mui/material";
import { CurrentLesson } from "../../types/Lesson";
import { getDurationMinutes, getQuestionSet } from "../../constants/questionBank";
export default function LessonIntroExam({ lesson, onStart }: { lesson: CurrentLesson; onStart: () => void }) {
    return (
        <Card variant="outlined" className="rounded-3xl" sx={{ mb: 2 }}>
            <CardContent className="p-4 sm:p-6">
                <Stack spacing={1}>
                    <Typography variant="h6" fontWeight={800}>
                        Bắt đầu {lesson.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {lesson.type === "quiz"
                            ? `Quick Quiz gồm ${getQuestionSet(lesson).length} câu, thời lượng ~${getDurationMinutes(lesson)} phút.`
                            : `Mini Test gồm ${getQuestionSet(lesson).length} câu, thời lượng ~${getDurationMinutes(lesson)} phút.`}
                        {" "}Hoàn thành để mở khóa bài tiếp theo.
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Chip size="small" label={`Thời lượng: ~${getDurationMinutes(lesson)}’`} variant="outlined" />
                        <Chip size="small" label="Tự chấm điểm ngay" variant="outlined" />
                    </Stack>
                    <Button variant="contained" onClick={onStart} sx={{ alignSelf: "flex-start", mt: 1 }}>
                        Bắt đầu làm bài
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}
