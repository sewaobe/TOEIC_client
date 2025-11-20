import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { Question } from '../../services/quiz.service';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  onShowExplanation: () => void;
  showExplanation: boolean;
  readOnly?: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onShowExplanation,
  showExplanation,
  readOnly = false,
}) => {
  const choices = Object.entries(question.choices || {});
  const isAnswered = !!selectedAnswer;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const showFeedback = !!readOnly; // only reveal correct/incorrect in review mode

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Question header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 600 }}>
          Câu {questionNumber} <Typography component="span" color="textSecondary">/ {totalQuestions}</Typography>
        </Typography>
        {question.planned_time > 0 && (
          <Typography variant="caption" sx={{ color: '#64748b', bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
            {question.planned_time}s
          </Typography>
        )}
      </Box>

      {/* Question text */}
      <Card sx={{ bgcolor: '#f8faff', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#1e293b', fontWeight: 500, lineHeight: 1.6 }}>
            {question.textQuestion}
          </Typography>
          {question.tags && question.tags.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {question.tags.map((tag) => (
                <Typography
                  key={tag}
                  variant="caption"
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </Typography>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Answer choices */}
      <Box>
        <RadioGroup
          value={selectedAnswer || ''}
          onChange={(e) => {
            if (!readOnly) onAnswerSelect(e.target.value);
          }}
        >
          <Stack spacing={2}>
            {choices.map(([key, value]) => (
              <Box
                key={key}
                onClick={() => {
                  if (!readOnly) onAnswerSelect(key);
                }}
                sx={{
                  border: '2px solid',
                  borderColor: selectedAnswer === key
                    ? showFeedback
                      ? isCorrect
                        ? '#2e7d32'
                        : '#d32f2f'
                      : '#1976d2'
                    : '#e2e8f0',
                  borderRadius: 2,
                  cursor: readOnly ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: selectedAnswer === key
                    ? showFeedback
                      ? isCorrect
                        ? '#e8f5e9'
                        : '#ffebee'
                      : '#e8f0ff'
                    : 'white',
                  '&:hover': readOnly
                    ? {}
                    : {
                        bgcolor: selectedAnswer === key ? undefined : '#f8faff',
                        borderColor: selectedAnswer === key ? undefined : '#1976d2',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      },
                  position: 'relative',
                }}
              >
                <FormControlLabel
                  value={key}
                  control={
                    <Radio
                      disabled={!!readOnly}
                      sx={{
                        color: '#94a3b8',
                        '&.Mui-checked': {
                          color: showFeedback ? (isCorrect ? '#2e7d32' : '#d32f2f') : '#1976d2',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography variant="body1" sx={{ fontWeight: selectedAnswer === key ? 600 : 400, color: '#334155' }}>
                        {value}
                      </Typography>
                      {selectedAnswer === key && showFeedback && (
                        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                          {isCorrect ? (
                            <CheckCircleIcon sx={{ color: '#2e7d32' }} />
                          ) : (
                            <CancelIcon sx={{ color: '#d32f2f' }} />
                          )}
                        </Box>
                      )}
                    </Box>
                  }
                  sx={{ width: '100%', m: 0, alignItems: 'center', '& .MuiFormControlLabel-label': { width: '100%' } }}
                />
              </Box>
            ))}
          </Stack>
        </RadioGroup>
      </Box>

      {/* Show explanation button: only available in read-only (review) mode */}
      {isAnswered && readOnly && (
        <Button
          variant="outlined"
          startIcon={<LightbulbIcon />}
          onClick={onShowExplanation}
          sx={{ 
            alignSelf: 'flex-start', 
            borderColor: '#ed6c02', 
            color: '#ed6c02',
            '&:hover': {
                borderColor: '#e65100',
                bgcolor: '#fff3e0',
            }
          }}
        >
          {showExplanation ? 'Ẩn' : 'Xem'} giải thích
        </Button>
      )}

      {/* Explanation section */}
      {showExplanation && (
        <Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ p: 3, bgcolor: '#fff8e1', borderRadius: 2, border: '1px solid #ffe0b2' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbIcon sx={{ color: '#ed6c02' }} />
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#e65100' }}>
                  Giải thích chi tiết
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#4e342e', lineHeight: 1.6 }}>
                {question.explanation}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'white', p: 1.5, borderRadius: 1, width: 'fit-content', border: '1px solid #ffe0b2' }}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: '#5d4037' }}>
                  ĐÁP ÁN ĐÚNG:
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#2e7d32',
                    fontWeight: 800,
                  }}
                >
                  {question.correctAnswer}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      )}

      {/* Status message */}
      {isAnswered && showFeedback && (
        <Alert
          severity={isCorrect ? 'success' : 'error'}
          icon={isCorrect ? <CheckCircleIcon fontSize="inherit" /> : <CancelIcon fontSize="inherit" />}
          sx={{
            borderRadius: 2,
            '& .MuiAlert-message': { fontWeight: 500 },
          }}
        >
          {isCorrect
            ? 'Chính xác! Bạn đã trả lời đúng câu hỏi này.'
            : 'Chưa chính xác. Hãy xem giải thích để hiểu rõ hơn nhé.'}
        </Alert>
      )}
    </Box>
  );
};

export default QuizQuestion;
