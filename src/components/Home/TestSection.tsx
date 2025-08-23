import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import TestCard from "./TestCard";

interface TestSectionProps {
  title: string;
  tests: {
    id: number;
    title: string;
    score?: number;
    details: string;
    isNew?: boolean;
  }[];
  showViewMoreButton?: boolean;
}

const TestSection: React.FC<TestSectionProps> = ({
  title,
  tests,
  showViewMoreButton = false,
}) => {
  const theme = useTheme();

  return (
    <Box
      component={motion.div}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="p-6 md:p-14 rounded-xl max-w-6xl m-auto mt-8"
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
          >
            Xem kho đề thi
          </Button>
        )}
      </Box>

      <Box className="flex flex-wrap justify-start gap-4">
        {tests.map((test) => (
          <TestCard key={test.id} {...test} />
        ))}
      </Box>
    </Box>
  );
};

export default TestSection;
