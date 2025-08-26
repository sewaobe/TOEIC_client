// src/components/profile/ProgressChart.tsx
import { Box, Card, CardContent, Typography, LinearProgress, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const ProgressChart: React.FC<any> = ({ data }) => {
    const theme = useTheme();
  const listeningProgress = data.listening;
  const readingProgress = data.reading;

  return (
    <Card className="rounded-xl shadow-lg bg-background-paper p-3">
      <CardContent>
        <Typography variant="h6" className="font-bold text-text-primary mb-4"
        sx={{color: theme.palette.primary.main}}>
          Tiến độ học tập
        </Typography>
        <div className="space-y-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${listeningProgress}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="relative"
          >
            <Typography variant="body1" className="font-semibold mb-2 text-text-secondary">
              Listening ({listeningProgress}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={listeningProgress}
              color="primary"
              className="h-2 rounded-full"
            />
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${readingProgress}%` }}
            transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
            className="relative"
          >
            <Typography variant="body1" className="font-semibold mb-2 text-text-secondary">
              Reading ({readingProgress}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={readingProgress}
              color="secondary"
              className="h-2 rounded-full"
            />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;