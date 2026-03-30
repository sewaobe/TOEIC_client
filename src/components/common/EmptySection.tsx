import React from "react";
import { Box, Typography, Paper, Button, Zoom, Fade } from "@mui/material";

// Icons từ MUI
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";

interface EmptySectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isCard?: boolean;
  // Props cho Action
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: "contained" | "outlined" | "text";
}

export const EmptySection: React.FC<EmptySectionProps> = ({
  title,
  description,
  icon,
  isCard = false,
  actionLabel,
  onAction,
  actionVariant = "contained",
}) => {
  const content = (
    <Box className="flex flex-col items-center justify-center py-8 px-6 text-center">
      {/* Icon Section với hiệu ứng Zoom từ MUI */}
      <Zoom in style={{ transitionDelay: '100ms' }}>
        <Box
          className="mb-6 rounded-full flex items-center justify-center shadow-sm"
          sx={{
            width: 100,
            height: 100,
            background: "linear-gradient(135deg, #F0F7FF 0%, #E0F2FE 100%)",
            border: "2px solid #DBEAFE",
          }}
        >
          {icon || <InboxOutlinedIcon sx={{ fontSize: 48, color: "#2563EB" }} />}
        </Box>
      </Zoom>

      {/* Text Section */}
      <Fade in timeout={800}>
        <Box className="flex flex-col items-center">
          <Typography
            variant="h6"
            className="font-bold !mb-2"
            sx={{ color: "#1F2937", fontSize: "1.25rem" }}
          >
            {title}
          </Typography>

          {description && (
            <Typography
              variant="body2"
              className={`max-w-xs md:max-w-md ${actionLabel ? "!mb-6" : "!mb-0"}`}
              sx={{ color: "#6B7280", lineHeight: 1.6 }}
            >
              {description}
            </Typography>
          )}

          {/* Action Button */}
          {actionLabel && onAction && (
            <Button
              variant={actionVariant}
              onClick={onAction}
              size="large"
              className="px-8 py-2.5 rounded-lg capitalize font-semibold shadow-none hover:shadow-lg transition-all"
              sx={{
                textTransform: "none",
                fontSize: "1rem",
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Box>
      </Fade>

      {/* Decorative Dots - Tối ưu bằng Tailwind & MUI sx */}
      <Box className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            className="animate-pulse"
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#DBEAFE",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <div className="w-full transition-all">
      {isCard ? (
        <Paper
          elevation={0}
          className="!rounded-lg border border-gray-100 shadow-sm overflow-hidden"
          sx={{ backgroundColor: "#fff" }}
        >
          {content}
        </Paper>
      ) : (
        content
      )}
    </div>
  );
};

// Map icons để dễ quản lý và tái sử dụng
export const EmptyIcons = {
  default: <InboxOutlinedIcon sx={{ fontSize: 48, color: "#3B82F6" }} />,
  assignment: <AssignmentOutlinedIcon sx={{ fontSize: 48, color: "#3B82F6" }} />,
  school: <SchoolOutlinedIcon sx={{ fontSize: 48, color: "#3B82F6" }} />,
  quiz: <QuizOutlinedIcon sx={{ fontSize: 48, color: "#3B82F6" }} />,
};