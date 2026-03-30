import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import TestCard from "./TestCard";
import { ITestCard } from "../../types/Test";
import { useNavigate } from "react-router-dom";
import { EmptyIcons, EmptySection } from "../common/EmptySection";

interface TestSectionProps {
  title: string;
  tests: any[];
  showViewMoreButton?: boolean;
  no: number;
}

const TestSection: React.FC<TestSectionProps> = ({
  title,
  tests,
  showViewMoreButton = false,
  no
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoToExams = () => {
    // Navigate to exam list
    navigate("/tests");
  };

  const emptyStateMap: Record<number, React.ReactNode> = {
    0: (
      <EmptySection
        isCard
        icon={EmptyIcons.assignment}
        title="Bạn chưa làm bài thi nào"
        description="Luyện tập giúp bạn làm quen với cấu trúc đề thi TOEIC và cải thiện điểm số nhanh chóng. Hãy bắt đầu bài thi đầu tiên ngay!"
        actionLabel="Bắt đầu thi ngay"
        onAction={handleGoToExams}
      />
    ),
    1: (
      <EmptySection
        isCard
        icon={EmptyIcons.quiz}
        title="Hiện tại hệ thống chưa có đề thi nào"
      />
    ),
  };

  const EmptyStateUI =
    emptyStateMap[no] ?? (
      <EmptySection
        isCard
        icon={EmptyIcons.quiz}
        title="Hiện tại hệ thống chưa có đề thi nào"
      />
    );

  return (
    <Box
      component={motion.div}
      className="p-6 md:p-0 rounded-xl max-w-6xl m-auto mt-8"
    // sx={{ background: theme.palette.background.paper }}
    >
      <Box className="flex justify-between items-center mb-6 mr-6">
        <Typography
          variant="h4"
          className="text-2xl md:text-3xl font-bold"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 800, // Thêm dòng này để tăng độ dày
          }}
        >
          {title}
        </Typography>
        {showViewMoreButton && (
          <Button
            variant="text"
            sx={{ color: theme.palette.primary.main, textTransform: "none" }}
            onClick={() => navigate("/tests")}
          >
            Xem kho đề thi
          </Button>
        )}
      </Box>

      <Box className="flex flex-wrap justify-start gap-4">
        {tests.length === 0
          ? EmptyStateUI
          : tests.map((test: ITestCard, index) => (
            <TestCard key={index} {...test} />
          ))}
      </Box>
    </Box>
  );
};

export default TestSection;
