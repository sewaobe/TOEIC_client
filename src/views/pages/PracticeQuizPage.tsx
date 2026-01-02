import { useState, useEffect } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';

import PracticeLayout from '../layouts/PracticeLayout';
import QuizList from '../../components/practices/QuizList';
import QuizPractice from '../../components/practices/QuizPractice';

type ViewState = 'list' | 'practicing';

export default function PracticeQuizPage() {
  const navigate = useNavigate();
  const { id: urlId } = useParams<{ id?: string }>();
  const [viewState, setViewState] = useState<ViewState>('list');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Auto-load quiz if URL has :id param
  useEffect(() => {
    if (urlId) {
      setSelectedQuizId(urlId);
      setViewState('practicing');
    }
  }, [urlId]);

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setViewState('practicing');
  };

  const handleBackToList = () => {
    setViewState('list');
    setSelectedQuizId(null);
  };

  const handleBackToPractice = () => {
    navigate(-1);
  };

  return (
    <PracticeLayout>
      {viewState === 'list' ? (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: '#bdbdbd', borderRadius: '4px', '&:hover': { background: '#9e9e9e' } }
            }}
          >
            <QuizList onSelectQuiz={handleSelectQuiz} />
          </Box>
        </Box>
      ) : (
        selectedQuizId && (
          <QuizPractice
            quizId={selectedQuizId}
            onBack={handleBackToList}
          />
        )
      )}
    </PracticeLayout>
  );
}
