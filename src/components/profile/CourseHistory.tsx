// src/components/profile/CourseHistory.tsx
import { Box, Card, CardContent, List, ListItem, ListItemText, LinearProgress, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

const CourseHistory: React.FC<any> = ({ courses }) => {
    const theme = useTheme();
  return (
    <Card className="rounded-xl shadow-lg bg-background-paper p-3">
      <CardContent>
        <Typography variant="h6" className="font-bold text-text-primary mb-4"
        sx={{color: theme.palette.primary.main}}>
          Lịch sử khóa học
        </Typography>
        <List className="space-y-4">
          {courses.map((course: any, index: number) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <ListItem className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <ListItemText
                  primary={
                    <Typography variant="body1" className="font-medium text-text-primary">
                      {course.name}
                    </Typography>
                  }
                  secondary={
                    <Box className="flex items-center mt-1">
                      <LinearProgress
                        variant="determinate"
                        value={course.completion}
                        color="success"
                        className="w-24 h-2 rounded-full mr-2"
                      />
                      <Typography variant="body2" className="text-text-secondary">
                        {course.completion}% Hoàn thành
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </motion.div>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default CourseHistory;