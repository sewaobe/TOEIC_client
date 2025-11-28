import React from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimerIcon from "@mui/icons-material/Timer";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

interface MiniTestIntroProps {
  title: string;
  description: string;
  onStart: () => void;
  questionCount?: number;
  duration?: number; // minutes
  parts?: string[]; // e.g. ["Part 1", "Part 2"]
}

export const MiniTestIntro: React.FC<MiniTestIntroProps> = ({
  title,
  description,
  onStart,
  questionCount = 100,
  duration = 60,
  parts = [],
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      className="max-w-2xl mx-auto mt-10"
    >
      <Box
        sx={{
          p: "2px",
          borderRadius: "26px",
          boxShadow: "0 8px 32px -12px rgba(76, 175, 80, 0.3)",
        }}
      >
        <Card
          className="flex flex-col w-full h-full"
          sx={{
            borderRadius: "24px",
            backgroundColor: "#ffffff",
          }}
        >
          <CardContent
            sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 4 }}
          >
            <Box sx={{ mb: 2 }}>
              <AssignmentIcon sx={{ fontSize: 48, color: "success.main" }} />
            </Box>

            <Typography
              variant="h4"
              component="h2"
              fontWeight={800}
              sx={{ color: "#1a202c", mb: 1 }}
            >
              {title}
            </Typography>

            <Typography variant="body1" sx={{ color: "#4a5568", mb: 3 }}>
              {description}
            </Typography>

            {/* Stats */}
            <Stack
              direction="row"
              spacing={2}
              sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
            >
              <Chip
                icon={<QuestionAnswerIcon />}
                label={`${questionCount} câu hỏi`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<TimerIcon />}
                label={`${duration} phút`}
                color="warning"
                variant="outlined"
              />
            </Stack>

            {/* Parts */}
            {parts.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#718096", mb: 1, fontWeight: 600 }}
                >
                  Các phần thi:
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", gap: 0.5 }}
                >
                  {parts.map((part, idx) => (
                    <Chip
                      key={idx}
                      label={part}
                      size="small"
                      sx={{ backgroundColor: "#e6f7ff", color: "#0050b3" }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>

          {/* Start Button */}
          <Box sx={{ px: 4, pb: 4 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              onClick={onStart}
              sx={{
                borderRadius: "12px",
                fontWeight: 700,
                py: 1.5,
                color: "white",
                background: "linear-gradient(45deg, #4CAF50 30%, #45a049 90%)",
                boxShadow: "0 4px 12px 0 rgba(76, 175, 80, 0.3)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 6px 20px 0 rgba(76, 175, 80, 0.4)",
                },
              }}
            >
              Bắt đầu làm bài kiểm tra
            </Button>
          </Box>
        </Card>
      </Box>
    </motion.div>
  );
};
