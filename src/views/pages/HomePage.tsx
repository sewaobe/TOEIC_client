import { FC, useEffect, useState } from "react";
import HeroSection from "../../components/Home/HeroSection";
import FeatureSection from "../../components/Home/FeatureSection";
import MainLayout from "../layouts/MainLayout";
import { Box } from "@mui/material";
import TestSection from "../../components/Home/TestSection";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";
import testService from "../../services/test.service";
import { ITestCard } from "../../types/Test";

const HomePage: FC = () => {
  const [latestTests, setLatestTests] = useState<ITestCard[]>([]);
  const [userRecentTests, setUserRecentTests] = useState<ITestCard[]>([]);
  useEffect(() => {
    const fetchLatestTests = async () => {
      try {
        const data = await testService.getLatestTests();
        setLatestTests(data);
      } catch (error) {
        console.error("Lỗi khi gọi API LatestTests:", error);
      }
    };

    const fetchRecentTests = async () => {
      try {
        const data = await testService.getUserRecentTest();
        setUserRecentTests(data);
      } catch (error) {
        console.error("Lỗi khi gọi API Recent Test:", error);
      }
    };

    fetchLatestTests();
    fetchRecentTests();
  }, []); // [] để chỉ gọi 1 lần khi mount

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <HeroSection />
        <FeatureSection />
        <TestSection title="Bài làm gần đây" tests={userRecentTests}/>
        {/* Sử dụng component tái sử dụng */}
        <TestSection
          title="Đề thi mới nhất"
          tests={latestTests}
          showViewMoreButton
        />
        <ScrollToTopButton scrollThreshold={700} />
      </Box>
    </MainLayout>
  );
};

export default HomePage;
