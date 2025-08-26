// ExamContainer.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../stores/store';
import PartIntro from './PartIntro';
import QuestionContent from './QuestionContent';
import { setShowIntro } from '../../stores/examSlice';
import { partIntros } from '../../models/QuestionType';

const ExamContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { groups, currentGroupIndex, showIntro } = useSelector(
    (s: RootState) => s.exam,
  );
  const group = groups[currentGroupIndex];

  if (!group) return <div>Không tìm thấy group</div>;

  // Lấy intro cho part hiện tại
  const intro = partIntros.find((p) => p.part === group.part);

  const handleStart = () => {
    dispatch(setShowIntro(false));
  };

  return (
    <>
      {showIntro && intro ? (
        <PartIntro
          partNumber={intro.part}
          termDesc={intro.termDesc}
          audioSrc={intro.audioUrl}
          totalScore={0}
          onStart={handleStart}
        />
      ) : (
        <QuestionContent />
      )}
    </>
  );
};

export default ExamContainer;
