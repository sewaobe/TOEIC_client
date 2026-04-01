import { FC, useEffect, useState } from "react";
import HeroSection from "../../components/Home/HeroSection";
import FeatureSection from "../../components/Home/FeatureSection";
import MainLayout from "../layouts/MainLayout";
import { Box } from "@mui/material";
import TestSection from "../../components/Home/TestSection";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";
import testService from "../../services/test.service";
import { ITestCard } from "../../types/Test";
import { toast } from "sonner";
import ClaimResultModal from "../../components/modals/ClaimResultModal";
import { useNavigate } from "react-router-dom";

const HomePage: FC = () => {
  const navigate = useNavigate();
  const [latestTests, setLatestTests] = useState<ITestCard[]>([]);
  const [userRecentTests, setUserRecentTests] = useState<ITestCard[]>([]);

  // State cho Modal
  const [openClaimModal, setOpenClaimModal] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [testId, setTestId] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchRecentTests = async () => {
    try {
      const data = await testService.getUserRecentTest();
      setUserRecentTests(data);
    } catch (error) {
      console.error("Lỗi khi gọi API Recent Test:", error);
    }
  };

  useEffect(() => {
    const fetchLatestTests = async () => {
      try {
        const data = await testService.getLatestTests();
        setLatestTests(data);
      } catch (error) {
        console.error("Lỗi khi gọi API LatestTests:", error);
      }
    };

    fetchLatestTests();
    fetchRecentTests();

    // LOGIC CHECK GUEST RESULT
    const savedGuestData = localStorage.getItem("guest_result_id");

    if (savedGuestData) {
      try {
        const parsed = JSON.parse(savedGuestData);
        if (parsed.resultId && parsed.testId) {
          setResultId(parsed.resultId);
          setTestId(parsed.testId);
          // Thêm một chút delay để user không bị "ngợp" ngay khi vừa load trang
          const timer = setTimeout(() => setOpenClaimModal(true), 1000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error("Lỗi parse dữ liệu guest từ localStorage");
        localStorage.removeItem("guest_result_id");
      }
    }
  }, []);

  const handleConfirmClaim = async () => {
    if (!resultId) return;
    setIsClaiming(true);
    try {
      // 1. Call API Claim kết quả
      await testService.claimGuestResult(resultId);

      // 2. Tạo chương trình học/lộ trình học
      // const roadmap = await roadmapService.createFromTest(resultId);

      toast.success("Tuyệt vời! Đã lưu kết quả.", {
        action: {
          label: "Xem ngay",
          onClick: () => navigate(`/tests/${testId}/result/${resultId}`), // Hoặc navigate tới trang lộ trình
        },
        duration: 6000
      });

      localStorage.removeItem("guest_result_id");
      setOpenClaimModal(false);
      fetchRecentTests(); // Load lại danh sách bài làm
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xử lý dữ liệu.");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCancelClaim = () => {
    localStorage.removeItem("guest_result_id");
    setOpenClaimModal(false);
    toast.info("Dữ liệu tạm thời đã được xóa.");
  };

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <HeroSection />
        <FeatureSection />
        
        {/* Chỉ hiện section này nếu có bài làm */}
        {userRecentTests.length > 0 && (
          <TestSection title="Bài làm gần đây" tests={userRecentTests} no={0} />
        )}

        <TestSection
          title="Đề thi mới nhất"
          tests={latestTests}
          showViewMoreButton
          no={1}
        />
        <ScrollToTopButton scrollThreshold={700} />
      </Box>

      <ClaimResultModal
        open={openClaimModal}
        onConfirm={handleConfirmClaim}
        onCancel={handleCancelClaim}
        loading={isClaiming}
      />
    </MainLayout>
  );
}

export default HomePage;