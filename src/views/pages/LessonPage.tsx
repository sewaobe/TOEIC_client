import * as React from "react";
import { Alert, Box, Button, Container, Grid } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import LessonHeader from "../../components/lesson/LessonHeader";
import LessonMedia from "../../components/lesson/LessonMedia";
import LessonNotes from "../../components/lesson/LessonNotes";
import LessonExam from "../../components/lesson/LessTypeStudy/LessonExam";
import LessonSidebarExam from "../../components/lesson/LessonSidebarExam";
import { LessonItem } from "../../types/Lesson";
import LessonIntroExam from "../../components/lesson/LessonIntroExam";
import LessonQueue from "../../components/lesson/LessonSidebar";
import { useSearchParams } from "react-router-dom";
import { LessonFlashcard } from "../../components/lesson/LessTypeStudy/LessonFlashcard";
import { LessonShadowing } from "../../components/lesson/LessTypeStudy/LessonShadowing";
import { LessonDictation } from "../../components/lesson/LessTypeStudy/LessonDictation";
import { LessonIntroCard } from "../../components/lesson/LessTypeStudy/LessonFlashcardIntro";
import { useLessonViewModel } from "../../viewmodels/useLessonViewModel";
import { LessonFinishCard } from "../../components/flashCardItem/FinishedFlashCard";
import { motion, AnimatePresence } from 'framer-motion'; // <-- 1. IMPORT
import { StatisticsModal } from "../../components/flashCardItem/StatisticsModal";
import { LessonContentSkeleton } from "../../components/lesson/LessonSketelon";
import { FlashcardHistoryModal } from "../../components/flashCardItem/FlashCardHistory";

// Transcript giả định
const LessonTranscript = ({ lesson }: { lesson: LessonItem | null }) => {
  const [open, setOpen] = React.useState(false);
  if (!lesson) return null;

  return (
    <div style={{ padding: "12px", border: "1px solid #eee", borderRadius: "12px", height: "100%", background: "#fafafa", display: "flex", flexDirection: "column" }}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setOpen((o) => !o)}
        sx={{ alignSelf: "flex-start", mb: 1 }}
      >
        {open ? "Ẩn transcript" : "📜 Xem transcript"}
      </Button>

      {open && (
        <div style={{ flex: 1, overflowY: "auto", maxHeight: "300px", paddingRight: "6px" }}>
          <h3 className="font-semibold mb-2">Transcript</h3>
          <p className="text-sm text-gray-700">
            Đây là transcript cho video/audio của bài học <b>{lesson.title}</b>.
          </p>
        </div>
      )}
    </div>
  );
};

export default function LessonPage() {
  const [searchParam] = useSearchParams();
  const dayId = (searchParam.get("day") || "").toString();
  const week = (searchParam.get("week") || "").toString();

  // sử dụng hook custom cho state
  const {
    loading, error, lessons, currentLesson, vocabularies, topicId, isReviewMode, activityKey,
    examStarted, questions, answers, scorePct, mmss, timeLeft,
    selectLesson, retryLesson, completeAndGoToNext, startExam, submitExam, setAnswers,
    activityStatus, startLesson, finishLesson, redoLesson,
    showHistory, handleOpenModalStatistic, handleCloseModalStatistic
  } = useLessonViewModel(dayId, week);
  
  // Auto Scroll top
  React.useEffect(() => {
    window.scroll(0, 0);
  }, [currentLesson])
  // Một hàm phụ để render nội dung bài học đang hoạt động
  const renderActiveLesson = () => {
    if (!currentLesson) return null;

    // Đây là logic switch-case cũ của bạn, giờ được đặt trong một hàm riêng
    switch (currentLesson.type) {
      case 'flash_card':
        return <LessonFlashcard vocabularies={vocabularies} topicId={topicId} activityId={activityStatus} dayId={dayId} onFinish={finishLesson} />;
      case 'shadowing':
        return <LessonShadowing />;
      case 'dictation':
        return <LessonDictation key={activityKey} />;
      case 'quiz':
        return (
          <>
            <Grid size={{ xs: 12, md: 8 }}>
              {!examStarted ? (
                <LessonIntroExam lesson={currentLesson} onStart={startExam} />
              ) : (
                <LessonExam questions={questions} answers={answers} setAnswers={setAnswers}
                  scorePct={scorePct} timeLeft={timeLeft} mmss={mmss}
                  lessonType={currentLesson.type} onSubmit={submitExam} />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {examStarted && (
                <LessonSidebarExam questions={questions} answers={answers} scorePct={scorePct}
                  timeLeft={timeLeft} mmss={mmss} onSubmit={submitExam} />
              )}
            </Grid>
          </>
        );
      case 'lesson':
        return (
          <>
            <Grid size={{ xs: 12, md: 8 }}>
              <LessonMedia src="https://youtu.be/4QnqpWLT5m4" type="video" />
              <Box mt={2}><LessonNotes /></Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <LessonTranscript lesson={currentLesson} />
            </Grid>
          </>
        );
      default:
        return <div>Loại bài học không xác định.</div>;
    }
  };

  const renderLessonContent = () => {
    if (!currentLesson) return <Box>Chọn một bài học để bắt đầu.</Box>;

    if (currentLesson.status === "completed" && activityStatus === "intro") {
      return <LessonFinishCard
        title={"Bài học đã được hoàn thành"}
        onRedo={redoLesson}    // Hàm từ ViewModel
        onNext={completeAndGoToNext} // Hàm từ ViewModel
        onStats={handleOpenModalStatistic}
      />
    }

    // Logic render giờ đây cực kỳ rõ ràng, chỉ dựa vào activityStatus
    switch (activityStatus) {
      case 'intro':
        return <LessonIntroCard
          title={currentLesson.title}
          description="Sẵn sàng để bắt đầu bài học mới. Nhấn nút bên dưới để tiếp tục."
          onStart={startLesson}
          type={currentLesson.type} />;
      case 'studying':
        return renderActiveLesson();
      case 'finished':
        return (
          <LessonFinishCard
            title={"🎉 Chúc mừng bạn đã hoàn thành!"}
            onRedo={redoLesson}    // Hàm từ ViewModel
            onNext={completeAndGoToNext} // Hàm từ ViewModel
            onStats={handleOpenModalStatistic}
          />
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Box sx={{ minHeight: "100vh", width: "100%", background: "linear-gradient(135deg, #F5F7FA 0%, #E6EDF6 100%)", py: "3%" }}>
        <Container
          id="lesson-top"
          className="max-w-[1000px] mx-auto p-4 sm:p-6"
          sx={{
            borderRadius: "36px",
            border: "1px solid rgba(0,0,0,0.06)",
            bgcolor: (t) => t.palette.mode === "light" ? "#FFFFFFCC" : "rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
            pb: 2,
          }}
        >
          <LessonHeader lesson={currentLesson} />

          <Grid container spacing={2} sx={{ mt: 2, justifyContent: "center", minHeight: "340px" }}>
            {loading ? (
              <LessonContentSkeleton lessonType={currentLesson ? currentLesson.type : "flash_card"} />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              // --- PHẦN NÂNG CẤP CHÍNH NẰM Ở ĐÂY ---
              <Box sx={{ width: '100%', position: 'relative' }}>
                <AnimatePresence mode="wait">
                  {/* Mỗi khi currentLesson thay đổi, `activityKey` cũng thay đổi.
                    AnimatePresence sẽ nhận biết sự thay đổi `key` này để chạy animation.
                  */}
                  <motion.div
                    key={activityKey || currentLesson?.id} // Sử dụng activityKey hoặc id của lesson

                    // Thêm prop "thần thánh" layout
                    layout="position"

                    // Hiệu ứng mờ dần ra/vào
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}

                    // Thời gian và kiểu chuyển động
                    transition={{
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1] // Easing mượt mà
                    }}
                  >
                    {renderLessonContent()}
                  </motion.div>
                </AnimatePresence>
              </Box>
            )}
          </Grid>

          <LessonQueue
            lessons={lessons}
            currentLesson={currentLesson}
            onSelect={selectLesson}
          />

          {showHistory && <FlashcardHistoryModal
            open={showHistory}
            onClose={handleCloseModalStatistic}
            topicId={topicId} />}
        </Container>
      </Box>
    </MainLayout>
  );
}
