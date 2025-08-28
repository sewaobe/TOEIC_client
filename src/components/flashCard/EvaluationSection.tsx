import { Card, Typography } from '@mui/material';
import {
  SentimentSatisfied,
  SentimentNeutral,
  SentimentDissatisfied,
  FastForward,
} from '@mui/icons-material';

interface EvaluationSectionProps {
  onNext: () => void;
}

export default function EvaluationSection({ onNext }: EvaluationSectionProps) {
  return (
    <Card className='mt-6 p-3 flex justify-around items-center flex-wrap gap-2'>
      <div
        className='flex flex-col items-center cursor-pointer hover:bg-green-50 p-2 rounded w-24'
        onClick={onNext}
      >
        <SentimentSatisfied className='text-green-500 text-3xl' />
        <Typography variant='body2'>Dễ</Typography>
      </div>
      <div
        className='flex flex-col items-center cursor-pointer hover:bg-yellow-50 p-2 rounded w-24'
        onClick={onNext}
      >
        <SentimentNeutral className='text-yellow-500 text-3xl' />
        <Typography variant='body2'>Trung bình</Typography>
      </div>
      <div
        className='flex flex-col items-center cursor-pointer hover:bg-red-50 p-2 rounded w-24'
        onClick={onNext}
      >
        <SentimentDissatisfied className='text-red-500 text-3xl' />
        <Typography variant='body2'>Khó</Typography>
      </div>

      <div
        className='flex items-center cursor-pointer hover:bg-blue-50 p-2 rounded'
        onClick={onNext}
      >
        <FastForward className='text-blue-500 mr-1' />
        <Typography variant='body2'>Đã biết, loại khỏi danh sách</Typography>
      </div>
    </Card>
  );
}
