import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PracticeLayout from "../layouts/PracticeLayout";
import { Box, CircularProgress, Typography } from "@mui/material";
import SidebarPractice from "../../components/practices/SidebarPractice";
import DictationContent from "../../components/practices/DictationContent";
import DictationList from "../../components/practices/DictationList";
import { Dictation } from "../../types/Dictation";
import { dictationService } from "../../services/dictation.service";

const PracticeDictationPage = () => {
  const { id: urlId } = useParams<{ id?: string }>();
  const [selectedLesson, setSelectedLesson] = useState<Dictation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    part_type?: number;
    tags?: string;
  } | null>(null);

  // Auto-load dictation if URL has :id param
  useEffect(() => {
    if (urlId) {
      handleSelectLesson(urlId);
    }
  }, [urlId]);

  const handleSelectPart = (partNumber: number) => {
    // Click vào Part → hiện danh sách tất cả bài của Part đó
    setFilters({ part_type: partNumber });
    setSelectedLesson(null); // Reset bài đang học
  };

  const handleSelectTagFilter = (partNumber: number, tag: string) => {
    // Click vào Tag → hiện danh sách bài theo Part + Tag
    setFilters({ part_type: partNumber, tags: tag });
    setSelectedLesson(null); // Reset bài đang học
  };

  const handleSelectLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      const lesson = await dictationService.getDictationById(lessonId);
      setSelectedLesson(lesson);
      setFilters(null); // Ẩn list, hiện content
    } catch (error) {
      console.error("Failed to select lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PracticeLayout>
      <Box display="flex" flex={1} className="overflow-y-auto">
        <SidebarPractice
          skillType="dictation"
          onSelectPart={handleSelectPart}
          onSelectTagFilter={handleSelectTagFilter}
        />

        <Box flex={1} className="!overflow-y-auto">
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : selectedLesson ? (
            // Đang học 1 bài cụ thể
            <DictationContent dictation={selectedLesson} />
          ) : filters ? (
            // Đang xem danh sách bài (theo Part hoặc Tag)
            <DictationList
              filters={filters}
              onSelectLesson={handleSelectLesson}
            />
          ) : (
            // Chưa chọn gì
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Typography color="text.secondary">
                Chọn một Part hoặc Tag từ sidebar để xem danh sách bài luyện tập
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </PracticeLayout>
  );
};

export default PracticeDictationPage;
