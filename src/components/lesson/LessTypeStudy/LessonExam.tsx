import {
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
    Paper,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Box,
    Chip,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import TimerIcon from "@mui/icons-material/Timer";
import { QCQuestion } from "../../../types/Lesson";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

// Animation variants for question transition
const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 30 : -30,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 30 : -30,
        opacity: 0,
    }),
};

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
    const [activeQuestionIndex, setActiveQuestionIndex] = React.useState(0);
    const [direction, setDirection] = React.useState(0);

    const handleNext = () => {
        if (activeQuestionIndex < questions.length - 1) {
            setDirection(1);
            setActiveQuestionIndex(activeQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (activeQuestionIndex > 0) {
            setDirection(-1);
            setActiveQuestionIndex(activeQuestionIndex - 1);
        }
    };

    const handleSelectQuestion = (index: number) => {
        setDirection(index > activeQuestionIndex ? 1 : -1);
        setActiveQuestionIndex(index);
    };

    const activeQuestion = questions[activeQuestionIndex];

    return (
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AssignmentTurnedInIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight={800}>
                            {lessonType === "quiz" ? "Quick Quiz" : "Mini Test"}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TimerIcon color={timeLeft < 60 ? "error" : "action"} />
                        <Typography variant="subtitle2" fontWeight={700}>
                            {mmss}
                        </Typography>
                    </Stack>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* Question Body with Animation */}
                <Box sx={{ minHeight: 220, mb: 2 }}>
                    <AnimatePresence mode="wait" initial={false} custom={direction}>
                        <motion.div
                            key={activeQuestionIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                        >
                            <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5 }}>
                                Câu {activeQuestionIndex + 1}. {activeQuestion.text}
                            </Typography>
                            <RadioGroup
                                value={answers[activeQuestion.id] ?? ""}
                                onChange={(e) =>
                                    setAnswers((s) => ({ ...s, [activeQuestion.id]: e.target.value }))
                                }
                            >
                                {activeQuestion.options.map((op) => (
                                    <FormControlLabel
                                        key={op.key}
                                        value={op.key}
                                        control={<Radio />}
                                        label={`${op.key}. ${op.text}`}
                                        sx={{
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            m: 0,
                                            mb: 1,
                                            px: 1,
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            }
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                        </motion.div>
                    </AnimatePresence>
                </Box>

                {/* Navigation Controls */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={handlePrev}
                        disabled={activeQuestionIndex === 0}
                        startIcon={<NavigateBeforeIcon />}
                    >
                        Câu trước
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                        {activeQuestionIndex + 1} / {questions.length}
                    </Typography>
                    {activeQuestionIndex < questions.length - 1 ? (
                        <Button
                            variant="outlined"
                            onClick={handleNext}
                            endIcon={<NavigateNextIcon />}
                        >
                            Câu sau
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={onSubmit}>
                            Nộp bài
                        </Button>
                    )}
                </Stack>

                {/* Question Navigator */}
                <Divider sx={{ my: 2 }}>Điều hướng</Divider>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {questions.map((q, idx) => (
                        <Chip
                            key={q.id}
                            label={idx + 1}
                            variant={activeQuestionIndex === idx ? "filled" : "outlined"}
                            color={answers[q.id] ? "primary" : "default"}
                            onClick={() => handleSelectQuestion(idx)}
                            sx={{
                                cursor: 'pointer',
                                fontWeight: activeQuestionIndex === idx ? 700 : 500,
                            }}
                        />
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
}
