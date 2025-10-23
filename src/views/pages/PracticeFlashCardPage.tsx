import { useState, useEffect, useMemo } from 'react';
import { Box, LinearProgress, Skeleton, Typography } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import Flashcard from '../../components/flashCardItem/FlashCard';
import Header from '../../components/flashCardItem/Header';
import Menu from '../../components/flashCardItem/Menu';
import AlertBox from '../../components/flashCardItem/AlertBox';
import SpeechOptions from '../../components/flashCardItem/SpeechOptions';
import EvaluationSection from '../../components/flashCardItem/EvaluationSection';
import { FlashcardItem } from '../../components/modals/CreateFlashcardItemModal';
import { useFlashcardSession } from '../../hooks/useFlashcardSession';
import { StatisticsModal } from '../../components/flashCardItem/StatisticsModal';
import { toast } from 'sonner';
import PracticeCompletionCard from '../../components/flashCard/PracticeCompletionCard';
import { useNavigate } from 'react-router-dom';

export default function PracticeFlashcardPage() {
  const [words, setWords] = useState<FlashcardItem[]>([]);
  const [topicId, setTopicId] = useState<string>('');
  const [voice, setVoice] = useState<'US' | 'UK'>('US');

  useEffect(() => {
    const stored = localStorage.getItem('vocabularies');
    if (stored) setWords(JSON.parse(stored));

    const storedTopicId = localStorage.getItem('flashcardInfo');
    if (storedTopicId) {
      const parsedInfo = JSON.parse(storedTopicId);
      setTopicId(parsedInfo._id || '');
    }
  }, []);

  const {
    current,
    handleEvaluate,
    currentAttempt,
    openStats,
    setOpenStats,
    logs,
    initialTotal,
    remaining,
  } = useFlashcardSession({
    vocabularies: words,
    topicId,
    withWeight: false,
    onFinish: () => console.log('Hoàn thành luyện tập cá nhân!'),
  });
  const uniqueWords = useMemo(() => {
    const uniqueSet = new Set(logs.map((l) => l.vocab_id));
    return Array.from(uniqueSet);
  }, [logs]);

  // Cảnh báo khi đạt mốc 20 từ duy nhất (và chỉ 1 lần)
  const [warned, setWarned] = useState(false);
  useEffect(() => {
    if (!warned && uniqueWords.length >= 20) {
      toast.info(
        <div>
          Bạn đã học <strong>20 từ</strong> trong buổi này.
          <br />
          Nghỉ ngơi 5 phút nhé! Hôm sau quay lại học tiếp thôi 😊
        </div>
      );
      setWarned(true);
    }
  }, [uniqueWords.length, warned]);


  useEffect(() => {
    if (!current) return;
    const utterance = new SpeechSynthesisUtterance(current.word);
    utterance.lang = voice === 'US' ? 'en-US' : 'en-GB';
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [current, voice]);

  const total = initialTotal || 0;
  const completed = total - remaining; // số từ đã xong (đã bị loại)
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const navigate = useNavigate();
  return (
    <MainLayout>
      <div className='max-w-3xl mx-auto p-4'>
        <Header />
        <Menu />
        <AlertBox
          severity='warning'
          variant='outlined'
          message='Chú ý: bạn được học tối đa 20 từ mới mỗi ngày. Đây là lượng từ phù hợp để bạn có thể học hiệu quả.'
          mb={6}
        />

        {/* Thanh tiến độ */}
        {total > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant='body2' sx={{ fontWeight: 500, mb: 0.5 }}>
              Tiến độ học: {completed}/{total} từ ({progress}%)
            </Typography>
            <LinearProgress
              variant='determinate'
              value={progress}
              sx={{
                height: 10,
                borderRadius: 2,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}

        {current ? (
          <div className='relative'>
            <Flashcard word={current} voice={voice} />
            <SpeechOptions voice={voice} setVoice={setVoice} />
            <EvaluationSection onNext={handleEvaluate} />
          </div>
        ) : currentAttempt ? (
          <PracticeCompletionCard
            type="flashcard"
            accuracy={currentAttempt.accuracy}
            total={currentAttempt.total}
            avgTime={currentAttempt.avg_time}
            onRetry={() => window.location.reload()} // học lại buổi này
            onViewStats={() => setOpenStats(true)}  // xem chi tiết kết quả
            onGoHome={() => navigate('/flash-cards')} // quay lại danh sách chủ đề
          />
        ) : (
          <Box
            sx={{
              mt: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 400,
                height: 280,
                borderRadius: 2,
                position: 'relative',
                boxShadow: 2,
                overflow: 'hidden',
              }}
            >
              <Skeleton
                variant='rectangular'
                width='100%'
                height='100%'
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant='circular'
                width={36}
                height={36}
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
              />
            </Box>
            <Box sx={{ width: '80%', textAlign: 'center' }}>
              <Skeleton variant='text' width='60%' sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant='text' width='40%' sx={{ mx: 'auto' }} />
              <Typography
                variant='body2'
                sx={{ mt: 2, color: 'text.secondary' }}
              >
                Đang tải dữ liệu flashcards...
              </Typography>
            </Box>
          </Box>
        )}

        {openStats && currentAttempt && (
          <StatisticsModal
            open={openStats}
            onClose={() => setOpenStats(false)}
            logs={currentAttempt.logs}
          />
        )}
      </div>
    </MainLayout>
  );
}
