import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import {
  ChatOutlined,
  ModeEditOutlineOutlined,
  ScoreboardOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ITestCard } from "../../types/Test";

const TestCard: React.FC<ITestCard> = ({ _id, title, score, topic, countComment, countSubmit, isNew }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box
      component={motion.div}
      className="flex flex-col gap-2 p-3 rounded-xl shadow-md w-full sm:w-[calc(33.33%-16px)] lg:w-[calc(33.33%-16px)] hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
      sx={{ background: theme.palette.background.paper }}
      onClick={() => navigate(`/tests/${_id}`)}
    >
      <Box className="flex items-center justify-between mb-2">
        <Typography
          variant="h6"
          className="text-base font-bold"
          sx={{ color: theme.palette.text.primary }}
        >
          {title}
        </Typography>
        <span
          className="text-xs font-bold text-white px-2 py-1 rounded-full"
          style={{ background: theme.palette.primary.main }}
        >
          {isNew ? "Đề thi mới" : "Đề thi thật"}
        </span>
      </Box>

      {topic && (
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
        >
          <span>{topic}</span>
          <br />
          <span>• 120 phút • 7 phần thi • 200 câu hỏi</span>
        </Typography>
      )}

      {/* Tổng số người tham gia */}
      <Box className="flex items-center gap-4 mb-1">
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
          className="flex items-center gap-[2px]"
        >
          <ModeEditOutlineOutlined fontSize="small" />
          <span className="flex items-center">{countSubmit}</span>
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
          className="flex items-center gap-[2px]"
        >
          <ChatOutlined fontSize="small" />
          <span className="flex items-center">{countComment}</span>
        </Typography>
      </Box>

      {score !== undefined && (
        <Box className="flex items-center mb-1">
          <ScoreboardOutlined
            sx={{ color: theme.palette.success.main, fontSize: 18 }}
            className="mr-1"
          />
          <Typography
            variant="body2"
            className="font-bold"
            sx={{ color: theme.palette.success.main }}
          >
            {score != null
              ? `Tổng điểm: ${score}`
              : "Làm bài ngay để có điểm nè ><"}
          </Typography>
        </Box>
      )}

      <Box className="flex items-center mt-4 space-x-2">
        <Button
          variant="outlined"
          sx={{
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            textTransform: "none",
            "&:hover": {
              boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
              transform: "scale(1.05)", // Phóng to 5%
            },
          }}
        >
          Xem chi tiết
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            textTransform: "none",
            "&:hover": {
              boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
              transform: "scale(1.05)",
            },
          }}
        >
          {score != null ? "Làm lại" : "Làm bài ngay"}
        </Button>
      </Box>
    </Box>
  );
};

export default TestCard;
