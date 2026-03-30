import React, { useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import AlertBox from "../../components/flashCardItem/AlertBox";
import FlashcardsList from "../../components/flashCard/FlashcardList";
import FlashcardsHeader from "../../components/flashCard/FlashCardHeader";
import { VideoModal } from "../../components/modals/VideoModal";
import SmartReviewBanner from "../../components/flashCard/SmartReviewBanner";
// src/mock/flashcardMock.ts
export interface FlashcardList {
  _id: string;
  title: string;
  description: string;
  vocabularies_id: string[];
  tags: string[];
  isPublic: boolean;
  created_at: string;
  wordCount?: number;
}

const FlashcardsPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<"myList" | "learning" | "explore">(
    "myList",
  );
  const [openVideoModal, setOpenVideoModal] = useState(false);
  const handleOpen = () => setOpenVideoModal(true);
  const handleClose = () => setOpenVideoModal(false);

  return (
    <MainLayout>
      <Box
        sx={{
          p: { xs: 3, md: 6 },
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
          {/* Header */}
          <FlashcardsHeader activeTab={activeTab} onChangeTab={setActiveTab} />

          {/* Smart Review Banner */}
          <SmartReviewBanner />

          {/* Content */}
          <Box
            sx={{
              bgcolor: "background.paper",
              p: { xs: 3, md: 6 },
              borderRadius: "0 0 16px 16px",
              mt: 0,
              boxShadow: 3,
            }}
          >
            <AlertBox
              severity="info"
              message={
                <>
                  Bạn có thể tạo flashcards từ highlights trong trang chi tiết
                  kết quả bài thi.{" "}
                  <Typography
                    component="span"
                    variant="body2"
                    onClick={handleOpen}
                    sx={{
                      color: "#1976d2", // Màu giống <a> mặc định của MUI (blue[700])
                      fontWeight: 500,
                      cursor: "pointer",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      "&:hover": {
                        color: "#0d47a1", // xanh đậm hơn khi hover
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Xem Video Giới Thiệu
                  </Typography>
                </>
              }
            />

            {/* Nội dung thay đổi theo activeTab */}
            {activeTab === "myList" && (
              <FlashcardsList activeTab="myList" title="List từ đã tạo" />
            )}
            {activeTab === "learning" && (
              <FlashcardsList
                activeTab="learning"
                title="Danh sách từ đang học"
              />
            )}
            {activeTab === "explore" && (
              <FlashcardsList
                activeTab="explore"
                title="Khám Phá Flashcards Mới"
              />
            )}
          </Box>
        </Box>
      </Box>

      <VideoModal
        open={openVideoModal}
        onClose={handleClose}
        videoUrl="https://youtu.be/RGNMCXzvt4s"
        title="Giới thiệu về Flashcards"
      />
    </MainLayout>
  );
};

export default FlashcardsPage;
