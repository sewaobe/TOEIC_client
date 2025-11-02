import React from "react";
import {
  Box,
  Typography,
  Button,
  useTheme,
  Chip,
  Tooltip,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  ChatOutlined,
  ModeEditOutlineOutlined,
  ScoreboardOutlined,
  AccessTimeOutlined,
  LibraryBooksOutlined,
  HeadphonesOutlined,
  WorkspacePremiumOutlined,
  NewReleasesOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ITestCard } from "../../types/Test";

const TestCard: React.FC<ITestCard> = ({
  _id,
  title,
  score,
  topic,
  countComment,
  countSubmit,
  isNew,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      component={motion.div}
      className="flex flex-col p-4 rounded-xl shadow-md w-full sm:w-[calc(33.33%-16px)] hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer max-w-[470px]"
      sx={{
        background: theme.palette.background.paper,
        minHeight: 230,
      }}
      onClick={() => navigate(`/tests/${_id}`)}
    >
      {/* ==== Header: Title + Icon Badge ==== */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.2,
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            color: theme.palette.text.primary,
            lineHeight: 1.35,
            wordBreak: "break-word",
            flex: 1,
            pr: 1,
          }}
        >
          {title}
        </Typography>

        {/* ==== Tooltip icon badge ==== */}
        <Tooltip
          title={isNew ? "Đề luyện tập mới" : "Đề TOEIC chuẩn quốc tế"}
          arrow
          placement="top"
        >
          <IconButton
            sx={{
              backgroundColor: isNew
                ? "rgba(34,197,94,0.12)"
                : "rgba(37,99,235,0.12)",
              color: isNew ? "#22c55e" : theme.palette.primary.main,
              "&:hover": {
                backgroundColor: isNew
                  ? "rgba(34,197,94,0.25)"
                  : "rgba(37,99,235,0.25)",
              },
              flexShrink: 0,
              p: 0.7,
              mt: 0.2,
            }}
          >
            {isNew ? (
              <NewReleasesOutlined fontSize="small" />
            ) : (
              <WorkspacePremiumOutlined fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* ==== Meta info ==== */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Tooltip title="Loại đề">
          <Chip
            icon={<LibraryBooksOutlined fontSize="small" />}
            label="Full Test 200 câu"
            size="small"
            sx={{
              bgcolor: "rgba(37,99,235,0.08)",
              color: theme.palette.primary.main,
              fontWeight: 500,
            }}
          />
        </Tooltip>

        <Tooltip title="Thời lượng trung bình">
          <Chip
            icon={<AccessTimeOutlined fontSize="small" />}
            label="120 phút"
            size="small"
            sx={{
              bgcolor: "rgba(16,185,129,0.08)",
              color: theme.palette.success.main,
              fontWeight: 500,
            }}
          />
        </Tooltip>

        <Tooltip title="Kỹ năng chính của đề">
          <Chip
            icon={<HeadphonesOutlined fontSize="small" />}
            label="Listening & Reading"
            size="small"
            sx={{
              bgcolor: "rgba(249,115,22,0.08)",
              color: "#f97316",
              fontWeight: 500,
            }}
          />
        </Tooltip>
      </Box>

      {/* ==== Stats icons ==== */}
      <Box sx={{ display: "flex", gap: 3, mb: 1, alignItems: "center" }}>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
          className="flex items-center gap-[2px]"
        >
          <ModeEditOutlineOutlined fontSize="small" />
          <span>{countSubmit}</span>
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary }}
          className="flex items-center gap-[2px]"
        >
          <ChatOutlined fontSize="small" />
          <span>{countComment}</span>
        </Typography>
      </Box>

      {/* ==== Score ==== */}
      {score !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <ScoreboardOutlined
            sx={{
              color: theme.palette.success.main,
              fontSize: 18,
              mr: 0.5,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: theme.palette.success.main,
            }}
          >
            {score != null ? `Tổng điểm: ${score}` : ""}
          </Typography>
        </Box>
      )}

      {/* ==== Buttons ==== */}
      <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
        <Button
          variant="outlined"
          size="small"
          sx={{
            flex: 1,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              boxShadow: "0 3px 5px rgba(37,99,235,0.2)",
              transform: "scale(1.04)",
            },
          }}
        >
          Xem chi tiết
        </Button>
        <Button
          variant="contained"
          size="small"
          sx={{
            flex: 1,
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              boxShadow: "0 3px 5px rgba(37,99,235,0.3)",
              transform: "scale(1.04)",
            },
          }}
        >
          {score != null ? "Làm lại" : "Bắt đầu làm bài"}
        </Button>
      </Box>
    </Box>
  );
};

export default TestCard;
