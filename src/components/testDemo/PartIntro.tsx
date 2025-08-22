import { FC, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';

export interface PartIntroProps {
  partNumber: number;
  termDesc: string; // HTML content
  audioSrc?: string; // link audio
  totalScore?: number; // ví dụ 0/200
  onStart: () => void;
}

const PartIntro: FC<PartIntroProps> = ({
  partNumber,
  termDesc,
  audioSrc,
  totalScore = 0,
  onStart,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioSrc && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio play prevented by browser autoplay policy:', err);
      });
    }
  }, [audioSrc]);

  return (
    <div className='flex flex-col bg-gray-50 min-h-[400px] p-6 rounded-md shadow-md'>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <Typography variant='h5' fontWeight='bold'>
          Part {partNumber}
        </Typography>
        <div className='btn-test'>
          <Button
            variant='outlined'
            size='small'
            className='text-gray-700 border-gray-300'
          >
            {totalScore}/200
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto'>
        <div
          className='prose max-w-full'
          dangerouslySetInnerHTML={{ __html: termDesc }}
        />
      </div>

      {/* Hidden audio */}
      {audioSrc && <audio ref={audioRef} src={audioSrc} hidden autoPlay />}

      {/* Start button */}
      <Box className='mt-4 flex justify-center'>
        <Button
          variant='contained'
          color='primary'
          onClick={onStart}
          className='uppercase font-bold'
        >
          Bắt đầu
        </Button>
      </Box>
    </div>
  );
};

export default PartIntro;
