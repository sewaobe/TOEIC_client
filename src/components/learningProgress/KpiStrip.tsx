import { useState } from 'react';
import { Grid, Card, CardContent, Typography, IconButton, Stack, Box, Paper, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion, AnimatePresence } from 'framer-motion';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { LearningProgressResponse } from '../../services/learningPath.service';

// --- 1. Định nghĩa cấu trúc dữ liệu mới ---
interface KpiDetail {
  title: string;
  value: string; // Ví dụ: "+15%"
}

interface KpiCategory {
  main: {
    title: string;
    value: string;
    sub: string;
  };
  details: KpiDetail[];
}

interface KpiData {
  listening: KpiCategory;
  reading: KpiCategory;
}

// --- 2. Dữ liệu giả (Mock Data) ---
// Dữ liệu này thể hiện % tăng so với lúc chưa học
const mockData: KpiData = {
  listening: {
    main: {
      title: "Listening",
      value: "+25%",
      sub: "Kỹ năng nghe"
    },
    details: [
      { title: "Part 1: Mô tả tranh", value: "+30%" },
      { title: "Part 2: Hỏi - Đáp", value: "+20%" },
      { title: "Part 3: Hội thoại ngắn", value: "+22%" },
      { title: "Part 4: Bài nói ngắn", value: "+28%" },
    ]
  },
  reading: {
    main: {
      title: "Reading",
      value: "+18%",
      sub: "Kỹ năng đọc"
    },
    details: [
      { title: "Part 5: Hoàn thành câu", value: "+15%" },
      { title: "Part 6: Hoàn thành đoạn văn", value: "+20%" },
      { title: "Part 7: Đọc hiểu", value: "+19%" },
    ]
  }
};


// --- Component Card tái sử dụng ---
interface KpiCardProps {
  title: string;
  value: string;
  sub?: string;
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, sub, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      borderRadius: 3,
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      } : {}
    }}
  >
    <CardContent>
      {sub && <Typography variant="overline" color="text.secondary">{sub}</Typography>}
      <Typography variant="h4" fontWeight={800} color="primary">{value}</Typography>
      <Typography variant="body1">{title}</Typography>
    </CardContent>
  </Card>
);


// --- Component chính ---
interface InteractiveKpiDashboardProps {
  progressData: LearningProgressResponse;
}

export const InteractiveKpiDashboard: React.FC<InteractiveKpiDashboardProps> = ({ progressData }) => {
  // 3. State để theo dõi danh mục đang được chọn (listening, reading, hoặc null)
  const [selectedCategory, setSelectedCategory] = useState<'listening' | 'reading' | null>(null);
  
  const { overview, weeks } = progressData;

  const variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    // --- 3. Bọc toàn bộ logic render bằng AnimatePresence ---
    // mode="wait" đảm bảo component cũ exit xong thì component mới mới enter
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, borderColor: 'grey.300', position: 'relative', overflow: 'hidden' }}>

      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          // --- 4. Bọc view tổng quan bằng motion.div và gán key ---
          <motion.div
            key="overview" // key là bắt buộc để AnimatePresence nhận diện
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <AssessmentOutlinedIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Tổng quan tiến độ học tập
                </Typography>
              </Stack>
              
              {/* Overview Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">Hoàn thành</Typography>
                      <Typography variant="h4" fontWeight={800} color="success.main">
                        {overview.completion_rate.toFixed(0)}%
                      </Typography>
                      <Typography variant="body2">
                        {overview.completed_lessons}/{overview.total_lessons} bài
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 6, md: 3 }}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">Thời gian học</Typography>
                      <Typography variant="h4" fontWeight={800} color="primary">
                        {Math.floor(overview.total_study_time / 60)}h
                      </Typography>
                      <Typography variant="body2">
                        {overview.total_study_time % 60}p
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 6, md: 3 }}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">Chuỗi ngày</Typography>
                      <Typography variant="h4" fontWeight={800} color="warning.main">
                        🔥 {overview.streak_days}
                      </Typography>
                      <Typography variant="body2">ngày liên tiếp</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 6, md: 3 }}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">Điểm số</Typography>
                      <Typography variant="h4" fontWeight={800} color="info.main">
                        {overview.current_score}
                      </Typography>
                      <Typography variant="body2">
                        Mục tiêu: {overview.target_score}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Weeks Progress */}
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Tiến độ các tuần
              </Typography>
              <Grid container spacing={2}>
                {weeks.map((week) => (
                  <Grid key={week.week_no} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Card 
                      sx={{ 
                        borderRadius: 3, 
                        height: '100%',
                        border: week.is_current ? 2 : 0,
                        borderColor: 'primary.main'
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="overline" color="text.secondary">
                            Tuần {week.week_no}
                          </Typography>
                          {week.is_current && (
                            <Chip label="Hiện tại" size="small" color="primary" />
                          )}
                        </Stack>
                        <Typography variant="h5" fontWeight={800} color="primary">
                          {week.progress.toFixed(0)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Độ chính xác: {week.accuracy.toFixed(0)}%
                        </Typography>
                        <Chip 
                          label={week.status} 
                          size="small" 
                          color={
                            week.status === 'completed' ? 'success' : 
                            week.status === 'in_progress' ? 'warning' : 
                            'default'
                          }
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        ) : (
          // --- 5. Bọc view chi tiết bằng motion.div và gán key ---
          <motion.div
            key={selectedCategory} // key động theo category
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <IconButton onClick={() => setSelectedCategory(null)}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={700}>
                  Chi tiết kỹ năng {mockData[selectedCategory].main.title}
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                {selectedCategory === "listening" && mockData[selectedCategory].details.map((item, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                    <KpiCard {...item} />
                  </Grid>
                ))}
                {selectedCategory === "reading" && mockData[selectedCategory].details.map((item, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                    <KpiCard {...item} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
};