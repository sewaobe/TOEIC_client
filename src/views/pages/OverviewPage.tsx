import { FC } from 'react';
import {
  OverviewCard,
  SkillInfo,
} from '../../components/testDemo/OverviewCard';

const OverviewPage: FC = () => {
  const skills: SkillInfo[] = [
    { name: 'Listening', questions: 100, timeMinutes: 45 },
    { name: 'Reading', questions: 100, timeMinutes: 75 },
  ];

  const description =
    'Bài thi TOEIC gồm 2 kỹ năng: Listening và Reading. Hãy làm bài cẩn thận, đọc kỹ câu hỏi, quản lý thời gian hợp lý và sử dụng các mẹo nhanh để đạt điểm cao.';

  return (
    <>
      <OverviewCard
        totalScore={200}
        totalTimeMinutes={120}
        skills={skills}
        description={description}
      />
    </>
  );
};
export default OverviewPage;
