import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ScoreIcon from '@mui/icons-material/Grade';
import TimeIcon from '@mui/icons-material/Timer';
import { Quiz } from '../../services/quiz.service';

interface Answer {
  questionId: string;
  answer: string;
}

interface QuizResultProps {
  quiz: Quiz;
  answers: Answer[];
  timeElapsed: number;
  onReviewAgain: () => void;
  onCompleted: () => void;
  onViewDetails?: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({
  quiz,
  answers,
  timeElapsed,
  onReviewAgain,
  onCompleted,
  onViewDetails,
}) => {
  // Calculate statistics
  let correctCount = 0;
  quiz.question_ids.forEach((question) => {
    const answer = answers.find((a) => a.questionId === question._id);
    if (answer && answer.answer === question.correctAnswer) {
      correctCount++;
    }
  });

  const totalCount = quiz.question_ids.length;
  const score = (correctCount / totalCount) * 100;
  const unansweredCount = totalCount - answers.filter(a => a.answer).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Xuất sắc';
    if (score >= 60) return 'Tốt';
    if (score >= 40) return 'Đạt';
    return 'Cần cải thiện';
  };

  const results = quiz.question_ids.map((question) => {
    const answer = answers.find((a) => a.questionId === question._id);
    const isCorrect = answer?.answer === question.correctAnswer;
    const isAnswered = !!answer?.answer;

    return {
      question,
      userAnswer: answer?.answer || 'Không trả lời',
      correctAnswer: question.correctAnswer,
      isCorrect,
      isAnswered,
    };
  });

  return (
    <Box sx={{ p: 3, overflow: 'auto', minHeight: '100vh', bgcolor: '#f0f7ff' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
            {quiz.title}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Kết quả bài kiểm tra của bạn
          </Typography>
        </Box>

        {/* Score card */}
        <Card 
          sx={{ 
            mb: 4, 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(25, 118, 210, 0.25)'
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <ScoreIcon sx={{ fontSize: 48, color: '#ffb74d' }} />
              <Typography variant="h1" fontWeight="800" sx={{ fontSize: '4rem' }}>
                {score.toFixed(0)}%
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#e3f2fd' }}>
              {getScoreLabel(score)}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Bạn đã trả lời đúng <Box component="span" sx={{ fontWeight: 'bold', color: '#fff' }}>{correctCount}</Box> trên tổng số <Box component="span" sx={{ fontWeight: 'bold', color: '#fff' }}>{totalCount}</Box> câu hỏi
            </Typography>
          </CardContent>
        </Card>

        {/* Statistics grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Stack spacing={1} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: '#e8f5e9' }}>
                    <CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
                  </Box>
                  <Typography variant="body2" color="textSecondary" fontWeight="500">
                    Câu đúng
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#2e7d32' }}>
                    {correctCount}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Stack spacing={1} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: '#ffebee' }}>
                    <CancelIcon sx={{ fontSize: 32, color: '#d32f2f' }} />
                  </Box>
                  <Typography variant="body2" color="textSecondary" fontWeight="500">
                    Câu sai
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#d32f2f' }}>
                    {totalCount - correctCount - unansweredCount}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Stack spacing={1} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: '#fff3e0' }}>
                    <Typography variant="h6" sx={{ color: '#ed6c02', fontWeight: 'bold', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary" fontWeight="500">
                    Chưa trả lời
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#ed6c02' }}>
                    {unansweredCount}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Stack spacing={1} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: '#e3f2fd' }}>
                    <TimeIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                  </Box>
                  <Typography variant="body2" color="textSecondary" fontWeight="500">
                    Thời gian
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976d2' }}>
                    {formatTime(timeElapsed)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed results */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #eee' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                Chi tiết từng câu
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8faff' }}>
                  <TableRow>
                    <TableCell width="5%" sx={{ fontWeight: 600, color: '#64748b' }}>STT</TableCell>
                    <TableCell width="40%" sx={{ fontWeight: 600, color: '#64748b' }}>Câu hỏi</TableCell>
                    <TableCell width="20%" sx={{ fontWeight: 600, color: '#64748b' }}>Câu trả lời của bạn</TableCell>
                    <TableCell width="20%" sx={{ fontWeight: 600, color: '#64748b' }}>Đáp án đúng</TableCell>
                    <TableCell width="15%" align="center" sx={{ fontWeight: 600, color: '#64748b' }}>Kết quả</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={result.question._id} hover>
                      <TableCell sx={{ color: '#64748b' }}>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                          {result.question.textQuestion.substring(0, 60)}
                          {result.question.textQuestion.length > 60 ? '...' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: result.isCorrect ? '#2e7d32' : '#d32f2f',
                            fontWeight: result.isAnswered ? 600 : 400,
                          }}
                        >
                          {result.userAnswer}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={result.correctAnswer}
                          size="small"
                          sx={{ 
                            bgcolor: '#e8f5e9', 
                            color: '#2e7d32', 
                            fontWeight: 700,
                            borderRadius: 1
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {result.isAnswered ? (
                          result.isCorrect ? (
                            <CheckCircleIcon sx={{ color: '#2e7d32' }} />
                          ) : (
                            <CancelIcon sx={{ color: '#d32f2f' }} />
                          )
                        ) : (
                          <Typography variant="caption" sx={{ color: '#ed6c02', bgcolor: '#fff3e0', px: 1, py: 0.5, borderRadius: 1 }}>
                            Bỏ qua
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', pb: 4 }}>
          {onViewDetails && (
            <Button
              variant="contained"
              size="large"
              onClick={onViewDetails}
              sx={{
                bgcolor: '#ed6c02',
                px: 4,
                fontWeight: 600,
                '&:hover': { bgcolor: '#e65100' },
              }}
            >
              Xem chi tiết đáp án
            </Button>
          )}
          <Button 
            variant="outlined" 
            size="large" 
            onClick={onReviewAgain}
            sx={{ 
              borderColor: '#1976d2', 
              color: '#1976d2',
              px: 4,
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#e3f2fd',
                borderColor: '#1565c0'
              }
            }}
          >
            Làm lại bài thi
          </Button>
          <Button 
            variant="contained" 
            size="large" 
            onClick={onCompleted}
            sx={{ 
              bgcolor: '#1976d2',
              px: 4,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            Hoàn tất & Thoát
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default QuizResult;
