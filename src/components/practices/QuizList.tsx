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
    TextField,
    Stack,
    Chip,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QuizIcon from '@mui/icons-material/Quiz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

import quizService, { Quiz } from '../../services/quiz.service';

interface QuizListProps {
    onSelectQuiz: (quizId: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({ onSelectQuiz }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [limit] = useState(6);
    const [searchQuery, setSearchQuery] = useState('');
    const [level, setLevel] = useState('');
    const [part, setPart] = useState('');

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await quizService.getAllQuiz(
                page,
                limit,
                searchQuery || undefined,
                undefined,
                level || undefined,
                undefined,
                part ? parseInt(part) : undefined
            );

            if (response.success && response.data) {
                setQuizzes(response.data.items);
                setTotalPages(response.data.pageCount);
            } else {
                setError(response.message || 'Không thể tải danh sách quiz');
            }
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi');
            console.error('Error fetching quizzes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [searchQuery, level, part]);

    useEffect(() => {
        fetchQuizzes();
    }, [page, searchQuery, level, part]);

    if (loading && quizzes.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '500px',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error && quizzes.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button
                    variant="contained"
                    onClick={fetchQuizzes}
                    sx={{ mt: 2 }}
                >
                    Thử lại
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Top bar: back button left, title centered */}
            <Box sx={{ mb: 2, p: 1.5, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        textTransform: 'none',
                        color: '#1976d2',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'transparent' },
                        p: 0,
                        minWidth: 0,
                        position: 'absolute',
                        left: 16,
                    }}
                    size="small"
                >
                    Quay lại
                </Button>

                <Typography variant="h6" sx={{
                    mx: 'auto', fontWeight: 700, color: '#1976d2',
                }}>
                    Danh sách Quiz
                </Typography>
            </Box>
            {/* Filters */}
            <Stack spacing={3} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        placeholder="Tìm kiếm quiz..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                    borderColor: '#1976d2',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#1976d2',
                                },
                            }
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Cấp độ</InputLabel>
                        <Select
                            value={level}
                            label="Cấp độ"
                            onChange={(e) => setLevel(e.target.value)}
                            sx={{
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                },
                            }}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="A1">A1</MenuItem>
                            <MenuItem value="A2">A2</MenuItem>
                            <MenuItem value="B1">B1</MenuItem>
                            <MenuItem value="B2">B2</MenuItem>
                            <MenuItem value="C1">C1</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Part</InputLabel>
                        <Select
                            value={part}
                            label="Part"
                            onChange={(e) => setPart(e.target.value)}
                            sx={{
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                },
                            }}
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="1">Part 1</MenuItem>
                            <MenuItem value="2">Part 2</MenuItem>
                            <MenuItem value="3">Part 3</MenuItem>
                            <MenuItem value="4">Part 4</MenuItem>
                            <MenuItem value="5">Part 5</MenuItem>
                            <MenuItem value="6">Part 6</MenuItem>
                            <MenuItem value="7">Part 7</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>

            {/* Quiz cards grid */}
            {quizzes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <QuizIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="textSecondary">
                        Không tìm thấy quiz nào. Hãy thử thay đổi điều kiện lọc.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {quizzes.map((quiz) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={quiz._id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    '&:hover': {
                                        boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                                        transform: 'translateY(-4px)',
                                    },
                                    border: '1px solid #e0e0e0',
                                    position: 'relative',
                                    borderRadius: 3,
                                }}
                            >
                                {/* Part badge */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        bgcolor: '#ed6c02',
                                        color: 'white',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        boxShadow: '0 2px 4px rgba(237, 108, 2, 0.3)',
                                    }}
                                >
                                    Part {quiz.part_type}
                                </Box>

                                <CardContent sx={{ flex: 1, pb: 1, pt: 3, px: 3 }}>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        gutterBottom
                                        noWrap
                                        sx={{ color: '#1e293b', mb: 2, pr: 6, fontSize: '1.1rem' }}
                                    >
                                        {quiz.title}
                                    </Typography>

                                    <Stack spacing={2}>
                                        {/* Topics */}
                                        {quiz.topic && quiz.topic.length > 0 && (
                                            <Box>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    CHỦ ĐỀ
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                                    {quiz.topic.map((t) => (
                                                        <Chip
                                                            key={t._id}
                                                            label={t.title}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                height: 24,
                                                                fontSize: '0.75rem',
                                                                borderColor: '#90caf9',
                                                                color: '#1976d2',
                                                                bgcolor: '#f0f7ff',
                                                                fontWeight: 500,
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                            {/* Questions count */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <QuizIcon fontSize="small" sx={{ color: '#1976d2', fontSize: 18 }} />
                                                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                                                    {quiz.question_ids?.length || 0} câu
                                                </Typography>
                                            </Box>

                                            {/* Time */}
                                            {quiz.planned_completion_time > 0 && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AccessTimeIcon fontSize="small" sx={{ color: '#ed6c02', fontSize: 18 }} />
                                                    <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                                                        {Math.round(quiz.planned_completion_time / 60)} phút
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Level */}
                                        <Box>
                                            <Chip
                                                label={`Level ${quiz.level}`}
                                                size="small"
                                                sx={{
                                                    height: 26,
                                                    bgcolor:
                                                        quiz.level === 'A1' ? '#ffebee' :
                                                            quiz.level === 'A2' ? '#fff3e0' :
                                                                quiz.level === 'B1' ? '#fffde7' :
                                                                    quiz.level === 'B2' ? '#e8f5e9' :
                                                                        '#e3f2fd',
                                                    color:
                                                        quiz.level === 'A1' ? '#c62828' :
                                                            quiz.level === 'A2' ? '#ef6c00' :
                                                                quiz.level === 'B1' ? '#f9a825' :
                                                                    quiz.level === 'B2' ? '#2e7d32' :
                                                                        '#1565c0',
                                                    fontWeight: 700,
                                                    border: '1px solid',
                                                    borderColor: 'transparent',
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                </CardContent>

                                <Box sx={{ p: 2, pt: 1 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<PlayArrowIcon />}
                                        onClick={() => onSelectQuiz(quiz._id)}
                                        sx={{
                                            bgcolor: '#1976d2',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            height: 42,
                                            borderRadius: 2,
                                            boxShadow: 'none',
                                            '&:hover': {
                                                bgcolor: '#1565c0',
                                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                                            }
                                        }}
                                    >
                                        Làm bài ngay
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                '&.Mui-selected': {
                                    bgcolor: '#1976d2',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#1565c0',
                                    }
                                }
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default QuizList;
