import { Card, CardContent, Typography, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import { FC } from 'react';

export interface SkillInfo {
  name: string;
  questions: number;
  timeMinutes: number;
}

interface OverviewCardProps {
  totalScore: number;
  totalTimeMinutes: number;
  skills: SkillInfo[];
  description: string;
}

export const OverviewCard: FC<OverviewCardProps> = ({
  totalScore,
  skills,
  description,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/test-demo');
  };

  return (
    <div className='flex justify-center items-center min-h-screen px-4 bg-gray-50 dark:bg-gray-900'>
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          borderRadius: 3,
          boxShadow: theme.shadows[4],
          bgcolor: 'background.paper',
        }}
        className='p-6'
      >
        <CardContent className='flex flex-col gap-6'>
          <div className='flex items-center gap-3'>
            <SchoolIcon fontSize='large' color='primary' />
            <Typography variant='h4' component='div'>
              TOEIC 2 Skills Overview
            </Typography>
          </div>

          <Typography variant='h6' color='text.secondary'>
            Tổng điểm: {totalScore}
          </Typography>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {skills.map((skill) => (
              <div
                key={skill.name}
                className='p-4 border rounded-md dark:border-gray-700'
              >
                <Typography variant='subtitle1' fontWeight='bold'>
                  {skill.name}
                </Typography>
                <Typography variant='body2'>
                  Số câu: {skill.questions}
                </Typography>
                <Typography variant='body2'>
                  Thời gian: {skill.timeMinutes} phút
                </Typography>
              </div>
            ))}
          </div>

          <Typography variant='body1' color='text.secondary'>
            {description}
          </Typography>

          <Button
            variant='contained'
            color='primary'
            size='large'
            onClick={handleStart}
            className='self-center w-full sm:w-auto'
          >
            Bắt đầu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
