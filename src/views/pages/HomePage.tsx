import { FC } from "react";
import HeroSection from "../../components/Home/HeroSection";
import FeatureSection from "../../components/Home/FeatureSection";
import MainLayout from "../layouts/MainLayout";
import { Box } from "@mui/material";
import TestSection from "../../components/Home/TestSection";
const recentTestsData = [
  {
    id: 1,
    title: "ETS 23 TOEIC Test 1",
    score: 850,
    details: "Bộ đề thi: ETS 23 ",
  },
  {
    id: 2,
    title: "ETS 23 TOEIC Test 2",
    score: 780,
    details: "Bộ đề thi: ETS 23 ",
  },
  {
    id: 3,
    title: "ETS 23 TOEIC Test 3",
    score: 920,
    details: "Bộ đề thi: ETS 23 ",
  },
];

const newestTestsData = [
  {
    id: 1,
    title: "ETS 23 TOEIC Test 4",
    details: "Bộ đề thi: ETS 23 ",
    isNew: true,
  },
  {
    id: 2,
    title: "ETS 23 TOEIC Test 5",
    details: "Bộ đề thi: ETS 23 ",
    isNew: true,
  },
  {
    id: 3,
    title: "ETS 23 TOEIC Test 6",
    details: "Bộ đề thi: ETS 23 ",
    isNew: true,
  },
];
const HomePage: FC = () => {
  return (
    <MainLayout>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <HeroSection />
        <FeatureSection />
        <TestSection title="Bài làm gần đây" tests={recentTestsData} />{" "}
        {/* Sử dụng component tái sử dụng */}
        <TestSection
          title="Đề thi mới nhất"
          tests={newestTestsData}
          showViewMoreButton
        />{" "}
        {/* Sử dụng component tái sử dụng */}
      </Box>
    </MainLayout>
  );
};

export default HomePage;
