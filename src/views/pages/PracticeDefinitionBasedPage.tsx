import { Box, Button, Stack, Typography } from "@mui/material";
import PracticeLayout from "../layouts/PracticeLayout";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { practiceDefinitionService } from "../../services/practice_definition.service";
import { practiceSessionService } from "../../services/practice_session.service";
import { PracticeSession } from "../../types/PracticeSession";
import { EmptyState } from "../../components/common/EmptyState";
import LessonCardsPanel from "../../components/practices/definition/LessonCardsPanel";
import PaginationContainer from "../../components/common/PaginationContainer";
import { PracticeTopicVocabulary } from "../../types/PracticeDefinition";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const PracticeDefinitionBasedPage = () => {
  const [lessons, setLessons] = useState<PracticeTopicVocabulary[]>([]);
  const [sessions, setSessions] = useState<Record<string, PracticeSession>>({});
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDataLessons = async () => {
    try {
      setLoading(true);

      // Fetch lessons từ API mới
      const res = await practiceDefinitionService.getTopics({ page, limit: 9 });
      setLessons(res.items);
      setPageCount(res.pageCount);

      // Fetch sessions để hiển thị progress
      const sessionsRes = await practiceSessionService.getUserSessions(
        "definition_based"
      );

      // Map sessions theo topic_id
      const sessionsMap: Record<string, PracticeSession> = {};
      sessionsRes.items.forEach((session) => {
        sessionsMap[session.topic_id] = session;
      });
      setSessions(sessionsMap);
    } catch {
      toast.error("Lấy danh sách bài học thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataLessons();
  }, [page]);

  const handleStartLesson = (lessonId: string) => {
    navigate(lessonId);
  };

  const handleBack = () => {
    navigate(-1);
  };
  if (loading) return <EmptyState mode="loading" />;

  return (
    <PracticeLayout>
      {/* ===== Header ===== */}
      <Box
        my={3}
        alignItems="center"
        display="flex"
        flexDirection="column"
        textAlign="center"
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <Button startIcon={<ArrowBack />} onClick={handleBack}></Button>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            Luyện tập định nghĩa từ vựng
          </Typography>
        </Stack>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 800 }}
        >
          Hãy chọn một chủ đề để xem các bài học. Trong mỗi bài, bạn sẽ thử định
          nghĩa lại từ vựng bằng chính ngôn ngữ của mình để hệ thống kiểm tra độ
          hiểu và gợi ý khi cần.
        </Typography>
      </Box>

      {/* ===== Nội dung ===== */}
      {lessons.length === 0 ? (
        <EmptyState
          mode="empty"
          title="Không có bài học nào"
          description="Hãy chọn một chủ đề để bắt đầu luyện tập."
        />
      ) : (
        <Box display="flex" flexDirection="column" mb={4}>
          <PaginationContainer
            items={lessons}
            page={page}
            pageCount={pageCount}
            onPageChange={(newPage) => {
              setPage(newPage);
            }}
            renderItem={(lesson) => (
              <Box
                key={lesson._id}
                sx={{
                  flex: "1 1 calc(33.33% - 16px)",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <LessonCardsPanel
                  lesson={lesson}
                  session={sessions[lesson._id]}
                  onStartLesson={handleStartLesson}
                />
              </Box>
            )}
            contentSx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "flex-start",
              alignItems: "stretch",
              px: 2,
            }}
            containerSx={{
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          />
        </Box>
      )}
    </PracticeLayout>
  );
};

export default PracticeDefinitionBasedPage;
