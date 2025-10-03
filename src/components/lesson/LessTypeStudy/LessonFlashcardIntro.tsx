// components/common/LessonIntroCard.jsx

import React from 'react';
import { Button, Card, CardContent, Typography, Box } from "@mui/material";
import { motion } from 'framer-motion';

// Import các icon cần thiết từ Material-UI
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StyleIcon from '@mui/icons-material/Style'; // Dùng cho Flashcard
import QuizIcon from '@mui/icons-material/Quiz'; // Dùng cho Quiz
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'; // Dùng cho Shadowing
import CreateIcon from '@mui/icons-material/Create'; // Dùng cho Dictation (viết)
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'; // Dùng cho bài học video/chung
import SchoolIcon from '@mui/icons-material/School'; // Icon mặc định
import { LessonType } from '../../../types/Lesson';


interface LessonIntroCardProps {
  title: string;
  description: string;
  onStart: () => void;
  /** Thêm prop `type` để quyết định icon sẽ hiển thị */
  type: LessonType;
}

// Tạo một đối tượng ánh xạ (map) từ type sang component Icon tương ứng
const iconMap: Record<LessonType | 'default', React.ElementType> = {
  flash_card: StyleIcon,
  quiz: QuizIcon,
  shadowing: RecordVoiceOverIcon,
  dictation: CreateIcon,
  lesson: PlayCircleOutlineIcon,
  default: SchoolIcon,
};

export const LessonIntroCard: React.FC<LessonIntroCardProps> = ({ 
  title, 
  description, 
  onStart,
  type
}) => {
  // Lấy component Icon tương ứng từ map, nếu không có thì dùng icon mặc định
  const IconComponent = iconMap[type] || iconMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      className="max-w-lg mx-auto mt-10"
    >
      {/* Box ngoài cùng để tạo hiệu ứng Gradient Border */}
      <Box
        sx={{
          height: '268px',
          p: '2px', // Độ dày của border
          borderRadius: '26px', // Bo tròn nhiều hơn 1 chút so với card bên trong
          boxShadow: '0 8px 32px -12px rgba(0, 123, 255, 0.3)',
        }}
      >
        <Card 
          className="flex flex-col w-full h-full" // Thêm w-full, h-full
          sx={{
            borderRadius: '24px', // Bo tròn bên trong
            backgroundColor: '#ffffff',
            // Bỏ boxShadow của card vì đã có ở Box ngoài
          }}
        >
          {/* Phần nội dung chính */}
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
            <Box sx={{ mb: 2 }}>
              {/* Render Icon động tại đây */}
              <IconComponent sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            
            <Typography 
              variant="h5" 
              component="h2" 
              fontWeight={800}
              sx={{ color: '#1a202c', mb: 1 }}
            >
              {title}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ color: '#4a5568', flexGrow: 1 }}
            >
              {description}
            </Typography>
          </CardContent>
          
          {/* Nút Bắt đầu */}
          <Box sx={{ px: 3, pb: 3 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              onClick={onStart}
              sx={{
                borderRadius: '12px',
                fontWeight: 700,
                py: 1.5,
                color: 'white',
                background: 'linear-gradient(45deg, #1DA1F2 30%, #007BFF 90%)',
                boxShadow: '0 4px 12px 0 rgba(0, 123, 255, 0.3)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 20px 0 rgba(0, 123, 255, 0.4)',
                },
              }}
            >
              Bắt đầu
            </Button>
          </Box>
        </Card>
      </Box>
    </motion.div>
  );
};