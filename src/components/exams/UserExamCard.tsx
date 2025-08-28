import { FC } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { BarChart, Edit } from '@mui/icons-material';

interface UserExamCardProps {
  userId: string;
  examDate: string; // ISO string hoặc format DD/MM/YYYY
  daysLeft: number;
  targetScore: number;
  onEditDate?: () => void;
  onViewStats?: () => void;
}

const UserExamCard: FC<UserExamCardProps> = ({
  userId,
  examDate,
  daysLeft,
  targetScore,
  onEditDate,
  onViewStats,
}) => {
  return (
    <Card
      className='!rounded-xl shadow-md w-full max-w-sm md:max-w-md'
      sx={{ backgroundColor: 'background.paper' }}
    >
      <CardContent className='flex flex-col items-center p-6'>
        {/* Avatar */}
        <Avatar sx={{ width: 55, height: 55 }} />

        {/* User ID */}
        <Typography
          variant='h6'
          className='mt-3 font-semibold'
          color='text.primary'
        >
          {userId}
        </Typography>

        <Divider className='!my-2 w-full ' />

        {/* Exam Info */}
        <Box className='w-full space-y-2 text-left'>
          <Typography
            variant='subtitle2'
            color='text.primary'
            className='font-extrabold'
          >
            TOEIC
          </Typography>

          <Box className='flex items-center justify-between'>
            <Typography variant='body2' color='text.secondary'>
              Ngày dự thi:
            </Typography>
            <Box className='flex items-center gap-1'>
              <Typography
                variant='body2'
                color='text.primary'
                className='font-semibold'
              >
                {examDate}
              </Typography>
              <IconButton size='small' onClick={onEditDate}>
                <Edit fontSize='small' />
              </IconButton>
            </Box>
          </Box>

          <Box className='flex items-center justify-between'>
            <Typography variant='body2' color='text.secondary'>
              Tới kỳ thi:
            </Typography>
            <Typography
              variant='body2'
              color='text.primary'
              className='font-semibold'
            >
              {daysLeft} ngày
            </Typography>
          </Box>

          <Box className='flex items-center justify-between'>
            <Typography variant='body2' color='text.secondary'>
              Điểm mục tiêu:
            </Typography>
            <Typography
              variant='body2'
              color='text.primary'
              className='font-semibold'
            >
              {targetScore}
            </Typography>
          </Box>
        </Box>

        {/* Action Button */}
        <Button
          variant='outlined'
          color='primary'
          className='!mt-5 rounded-full px-6 py-2 flex items-center gap-2'
          onClick={onViewStats}
          fullWidth
        >
          <BarChart fontSize='small' />
          Thống kê kết quả
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserExamCard;
