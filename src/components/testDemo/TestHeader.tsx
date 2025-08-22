import React, { FC, useEffect } from 'react';
import { Button, useTheme } from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import { useCountdown } from '../../hooks/useCountDown';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
interface TestHeaderProps {
  setIsShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  isTourRunning: boolean;
}
const TestHeader: FC<TestHeaderProps> = ({
  setIsShowSideBar,
  isTourRunning,
}) => {
  const theme = useTheme();
  const { timeLeft, formatTime } = useCountdown(7200, isTourRunning);
  const answers = useSelector((state: RootState) => state.answer.answers);

  const answeredCount = answers.filter((a) => a.answer !== '').length;

  const handleSubmit = () => {
    console.log(answers);
  };
  useEffect(() => {
    if (timeLeft === 0) {
      console.log('Hết giờ làm bài');
    }
  }, [timeLeft]);

  return (
    <header className='w-full bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm'>
      {/* Logo / Tiêu đề */}
      <h1
        style={{ color: theme.palette.primary.main }}
        className='text-xl font-bold'
      >
        TOEIC Online Test
      </h1>

      {/* Thời gian còn lại */}
      <span
        data-tour-id='time-counter'
        className='font-medium'
        style={{ color: theme.palette.text.primary }}
      >
        Thời gian: {formatTime()}
      </span>

      {/* Thông tin cơ bản */}
      <div className='flex items-center gap-6' onClick={handleSubmit}>
        <Button
          data-tour-id='submit-button'
          variant='contained'
          color='secondary'
          className='rounded-lg px-4 py-2 font-semibold'
        >
          Nộp bài
        </Button>

        <span
          className='font-medium'
          style={{ color: theme.palette.text.secondary }}
        >
          Câu đã làm: {answeredCount}/200
        </span>

        <div
          data-tour-id='sidebar-toggle'
          className='p-2 rounded-lg shadow-lg cursor-pointer'
          style={{ backgroundColor: theme.palette.primary.main }}
          onClick={() => setIsShowSideBar((prev) => !prev)}
        >
          <AppsIcon className='text-white' />
        </div>
      </div>
    </header>
  );
};

export default TestHeader;
