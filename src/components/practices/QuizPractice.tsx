import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    LinearProgress,
    Chip,
    Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import quizService, { Quiz } from '../../services/quiz.service';
import QuizQuestion from './QuizQuestion';
import QuizResult from './QuizResult';

interface QuizPracticeProps {
    quizId: string;
    onBack?: () => void;
}

interface Answer {
    questionId: string;
    answer: string;
}

type QuizState = 'loading' | 'practicing' | 'reviewing' | 'completed';

const QuizPractice: React.FC<QuizPracticeProps> = ({ quizId, onBack }) => {
    const [state, setState] = useState<QuizState>('loading');
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [previewReadOnly, setPreviewReadOnly] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch quiz data khi component mount
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setState('loading');
                setError(null);
                const response = await quizService.getQuizById(quizId);

                if (response.success && response.data) {
                    setQuiz(response.data);
                    setState('practicing');
                } else {
                    setError(response.message || 'Không thể tải quiz');
                    setState('loading');
                }
            } catch (err: any) {
                setError(err.message || 'Đã xảy ra lỗi khi tải quiz');
                setState('loading');
                console.error('Error fetching quiz:', err);
            }
        };

        fetchQuiz();
    }, [quizId]);

    // Timer
    useEffect(() => {
        if (state !== 'practicing') return;

        const interval = setInterval(() => {
            setTimeElapsed((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [state]);

    const currentQuestion = quiz?.question_ids[currentQuestionIndex];
    const totalQuestions = quiz?.question_ids.length || 0;
    const answered = answers.filter(a => a.answer).length;
    const progressPercent = (currentQuestionIndex / totalQuestions) * 100;

    const handleAnswerQuestion = (answer: string) => {
        const existingIndex = answers.findIndex(
            (a) => a.questionId === currentQuestion?._id
        );

        if (existingIndex !== -1) {
            const newAnswers = [...answers];
            newAnswers[existingIndex].answer = answer;
            setAnswers(newAnswers);
        } else {
            setAnswers([
                ...answers,
                { questionId: currentQuestion?._id || '', answer },
            ]);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowExplanation(previewReadOnly ? true : false);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setShowExplanation(previewReadOnly ? true : false);
        }
    };

    const handleFinishQuiz = () => {
        setState('reviewing');
    };

    const handleReviewAgain = () => {
        setState('practicing');
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setShowExplanation(false);
        setPreviewReadOnly(false);
    };

    const handleCompleted = () => {
        setState('completed');
    };

    const handleCompletedReview = () => {
        setState('reviewing');
    }

    const handleViewDetails = () => {
        // Switch back to practicing UI but in read-only preview mode
        setPreviewReadOnly(true);
        setShowExplanation(true);
        setCurrentQuestionIndex(0);
        setState('practicing');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Loading state
    if (state === 'loading') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '500px',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <>
                        <CircularProgress />
                        <Typography>Đang tải quiz...</Typography>
                    </>
                )}
            </Box>
        );
    }

    // Practicing state
    if (state === 'practicing' && quiz && currentQuestion) {
        const currentAnswer = answers.find(
            (a) => a.questionId === currentQuestion._id
        );

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, bgcolor: '#f0f7ff' }}>
                {/* Header */}
                <Box
                    sx={{
                        bgcolor: '#1976d2',
                        color: 'white',
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        flexShrink: 0,
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            sx={{ color: 'white', textTransform: 'none', fontSize: '0.95rem', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                            onClick={onBack}
                        >
                            Quay lại
                        </Button>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {quiz.title}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Stack 
                            direction="row" 
                            spacing={0.5} 
                            alignItems="center"
                            sx={{ 
                                bgcolor: 'rgba(255,255,255,0.15)', 
                                px: 1.5, 
                                py: 0.75, 
                                borderRadius: 2,
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            <TimerIcon sx={{ fontSize: '1.2rem' }} />
                            <Typography sx={{ fontWeight: 500, minWidth: 50 }}>
                                {formatTime(timeElapsed)}
                            </Typography>
                        </Stack>
                        <Chip
                            label={`${answered}/${totalQuestions}`}
                            sx={{ 
                                bgcolor: '#ed6c02', 
                                color: 'white', 
                                fontWeight: 700,
                                height: 32,
                            }}
                        />
                    </Stack>
                </Box>

                {/* Progress bar */}
                <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{
                        height: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: '#ed6c02',
                        }
                    }}
                />

                {/* Main content - Only one scroll container */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 3,
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#bdbdbd',
                            borderRadius: '4px',
                            '&:hover': {
                                background: '#9e9e9e',
                            },
                        },
                    }}
                >
                    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
                        <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 700, mb: 2 }}>
                            {quiz.title}
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: 3, border: '1px solid #e0e0e0' }}>
                                    <CardContent sx={{ p: 4 }}>
                                        <QuizQuestion
                                            question={currentQuestion}
                                            questionNumber={currentQuestionIndex + 1}
                                            totalQuestions={totalQuestions}
                                            selectedAnswer={currentAnswer?.answer}
                                            onAnswerSelect={handleAnswerQuestion}
                                            onShowExplanation={() => setShowExplanation(true)}
                                            showExplanation={previewReadOnly ? true : showExplanation}
                                            readOnly={previewReadOnly}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                {/* Question list sidebar */}
                                <Card sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 0, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#1976d2', letterSpacing: 0.5 }}>
                                            Danh sách câu hỏi
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(5, 1fr)',
                                                gap: 1,
                                                mt: 2,
                                            }}
                                        >
                                            {quiz.question_ids.map((q, idx) => {
                                                const isAnswered = answers.some(
                                                    (a) => a.questionId === q._id && a.answer
                                                );
                                                const isCurrentQuestion = idx === currentQuestionIndex;

                                                return (
                                                    <Button
                                                        key={q._id}
                                                        variant={isCurrentQuestion ? 'contained' : 'outlined'}
                                                        size="small"
                                                        onClick={() => {
                                                            setCurrentQuestionIndex(idx);
                                                            setShowExplanation(previewReadOnly ? true : false);
                                                        }}
                                                        sx={{
                                                            position: 'relative',
                                                            minWidth: 0,
                                                            height: 36,
                                                            fontWeight: 600,
                                                            bgcolor: isCurrentQuestion
                                                                ? '#1976d2'
                                                                : isAnswered
                                                                    ? '#e3f2fd'
                                                                    : 'white',
                                                            color: isCurrentQuestion ? 'white' : isAnswered ? '#1976d2' : '#64748b',
                                                            borderColor: isCurrentQuestion ? 'transparent' : isAnswered ? '#90caf9' : '#e2e8f0',
                                                            '&:hover': {
                                                                bgcolor: isCurrentQuestion
                                                                    ? '#1565c0'
                                                                    : '#f1f5f9',
                                                            }
                                                        }}
                                                    >
                                                        {idx + 1}
                                                    </Button>
                                                );
                                            })}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        p: 2,
                        bgcolor: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid #e0e0e0',
                        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
                        flexShrink: 0,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#e0e0e0', color: '#64748b' }}
                    >
                        ← Câu trước
                    </Button>

                    <Stack direction="row" spacing={1}>
                        {currentQuestionIndex === totalQuestions - 1 ? (
                            <Button
                                variant="contained"
                                onClick={previewReadOnly ? handleCompletedReview : handleFinishQuiz}
                                sx={{
                                    bgcolor: previewReadOnly ? '#1976d2' : '#ed6c02',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 4,
                                    '&:hover': {
                                        bgcolor: previewReadOnly ? '#1565c0' : '#e65100',
                                    }
                                }}
                            >
                                {previewReadOnly ? 'Hoàn thành xem lại đáp án' : 'Nộp bài'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNextQuestion}
                                sx={{
                                    bgcolor: '#1976d2',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 4,
                                    '&:hover': {
                                        bgcolor: '#1565c0',
                                    }
                                }}
                            >
                                Câu tiếp theo →
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Box>
        );
    }

    // Reviewing state
    if (state === 'reviewing' && quiz) {
        return (
            <QuizResult
                quiz={quiz}
                answers={answers}
                timeElapsed={timeElapsed}
                onReviewAgain={handleReviewAgain}
                onCompleted={handleCompleted}
                onViewDetails={handleViewDetails}
            />
        );
    }

    // Completed state
    if (state === 'completed') {
        // compute simple stats
        let correctCount = 0;
        if (quiz) {
            quiz.question_ids.forEach((q) => {
                const a = answers.find((it) => it.questionId === q._id);
                if (a && a.answer === q.correctAnswer) correctCount++;
            });
        }

        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Card sx={{ maxWidth: 720, width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 12px 40px rgba(2,6,23,0.12)' }}>
                    <Box sx={{ background: 'linear-gradient(135deg,#1976d2 0%,#1565c0 100%)', color: 'white', p: 4, textAlign: 'center' }}>
                        <Box sx={{ width: 96, height: 96, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <CheckCircleIcon sx={{ fontSize: 48, color: '#fff' }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>Hoàn tất bài kiểm tra</Typography>
                        <Typography sx={{ opacity: 0.9, mt: 1 }}>Cảm ơn bạn — bạn đã hoàn thành thử thách này.</Typography>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Câu đúng</Typography>
                                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 800 }}>{correctCount}</Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Tổng</Typography>
                                <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 800 }}>{totalQuestions}</Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Thời gian</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatTime(timeElapsed)}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                            <Button variant="outlined" onClick={onBack} sx={{ px: 4, fontWeight: 700 }}>
                                Quay lại
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return null;
};

export default QuizPractice;
