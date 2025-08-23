import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import {  ScoreboardOutlined } from '@mui/icons-material';

interface TestCardProps {
  title: string;
  score?: number;
  details?: string; // Thêm prop này để chứa thông tin chi tiết
  isNew?: boolean;
}

const TestCard: React.FC<TestCardProps> = ({ title, score, details}) => {
  const theme = useTheme();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  } as const;

  return (
    <Box
      component={motion.div}
      variants={cardVariants}
      className="flex flex-col gap-2 p-3 rounded-xl shadow-md w-full sm:w-[calc(33.33%-16px)] lg:w-[calc(33.33%-16px)]" // Chiếm 1/3 chiều rộng và có khoảng trống
      sx={{ background: theme.palette.background.paper }}
    >
      <Box className="flex items-center justify-between mb-2">
        <Typography variant="h6" className="text-base font-bold" sx={{ color: theme.palette.text.primary }}>
          {title}
        </Typography>
          <span className="text-xs font-bold text-white px-2 py-1 rounded-full" style={{ background: theme.palette.primary.main }}>
            Đề thi thật
          </span>
      </Box>

      {details && (
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} className="mb-2">
          <p>{details}</p>
          <p>• 120 phút • 7 phần thi • 200 câu hỏi</p>
        </Typography>
      )}

      {score !== undefined && (
        <Box className="flex items-center mb-1">
          <ScoreboardOutlined sx={{ color: theme.palette.success.main, fontSize: 18 }} className="mr-1" />
          <Typography variant="body2" className="font-bold" sx={{ color: theme.palette.success.main }}>
            Tổng điểm: {score}
          </Typography>
        </Box>
      )}

      <Box className="flex items-center mt-4 space-x-2">
        <Button
          variant="outlined"
          sx={{
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
            },
          }}
        >
          Xem đáp án
        </Button>
        <Button
          variant="contained"
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            // backgroundColor: theme.palette.primary.main,
            color: '#fff',
            textTransform: 'none',
            '&:hover': {
              boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            },
          }}
        >
          Làm lại
        </Button>
      </Box>
    </Box>
  );
};

export default TestCard;