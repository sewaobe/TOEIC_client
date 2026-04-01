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
    const savedGuestId = localStorage.getItem("guest_result_id");

    if (savedGuestId) {
      const json = JSON.parse(savedGuestId);
      setResultId(json.resultId);
      setTestId(json.testId);
      setOpenClaimModal(true);
    }
  }, []);

  const navigate = useNavigate();

  const handleConfirmClaim = async () => {
    if (!resultId) return;
    setIsClaiming(true);
    try {
      await testService.claimGuestResult(resultId);
      toast.success("Đã lưu kết quả vào tài khoản của bạn!", {
        description: "Bạn có muốn xem lại chi tiết bài làm không?",
        action: {
          label: "Xem ngay",
          onClick: () => navigate(`/tests/${testId}/result/${resultId}`),
        },
        duration: 5000
      });

      localStorage.removeItem("guest_result_id");
      setOpenClaimModal(false);
      fetchRecentTests();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu kết quả.");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCancelClaim = () => {
    localStorage.removeItem("guest_result_id");
    setOpenClaimModal(false);
    toast.info("Kết quả tạm thời đã bị xóa.");
  };

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <HeroSection />
        <FeatureSection />
        <TestSection title="Bài làm gần đây" tests={userRecentTests} no={0} />
        <TestSection
          title="Đề thi mới nhất"
          tests={latestTests}
          showViewMoreButton
          no={1}
        />
        <ScrollToTopButton scrollThreshold={700} />
      </Box>

      {/* Modal xác nhận */}
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