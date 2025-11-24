import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import MainLayout from "../layouts/MainLayout";
import LessonHeader from "../../components/lesson/LessonHeader";
import LessonMedia from "../../components/lesson/LessonMedia";
import LessonNotes from "../../components/lesson/LessonNotes";
import { lessonService } from "../../services/lesson.service";
import LessonExam from "../../components/lesson/LessTypeStudy/LessonExam";
import LessonSidebarExam from "../../components/lesson/LessonSidebarExam";
import LessonIntroExam from "../../components/lesson/LessonIntroExam";
import LessonQueue from "../../components/lesson/LessonSidebar";
import { useSearchParams } from "react-router-dom";
import { LessonFlashcard } from "../../components/lesson/LessTypeStudy/LessonFlashcard";
// We'll reuse the practice UI inside lesson flow by mounting practice components
import DictationContent from "../../components/practices/DictationContent";
import ShadowingContent from "../../components/practices/ShadowingPractice";
import { LessonIntroCard } from "../../components/lesson/LessTypeStudy/LessonFlashcardIntro";
import { useLessonViewModel } from "../../viewmodels/useLessonViewModel";
import { LessonFinishCard } from "../../components/flashCardItem/FinishedFlashCard";
import { motion, AnimatePresence } from "framer-motion"; // <-- 1. IMPORT
import { LessonContentSkeleton } from "../../components/lesson/LessonSketelon";
import { FlashcardHistoryModal } from "../../components/flashCardItem/FlashCardHistory";

export default function LessonPage() {
  const [searchParam] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const dayId = (searchParam.get("day") || "").toString();
  const week = (searchParam.get("week") || "").toString();

  // sử dụng hook custom cho state
  const {
    loading,
    error,
    lessons,
    currentLesson,
    vocabularies,
    topicId,
    isReviewMode,
    activityKey,
    examStarted,
    questions,
    answers,
    scorePct,
    mmss,
    timeLeft,
    selectLesson,
    retryLesson,
    completeAndGoToNext,
    startExam,
    submitExam,
    setAnswers,
    activityStatus,
    startLesson,
    finishLesson,
    redoLesson,
    showHistory,
    handleOpenModalStatistic,
    handleCloseModalStatistic,
  } = useLessonViewModel(dayId, week);

  // Auto Scroll top
  React.useEffect(() => {
    window.scroll(0, 0);
  }, [currentLesson]);

  // Calculate progress
  const completedCount = lessons.filter(l => l.status === 'completed').length;
  const totalCount = lessons.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Determine timer display
  const showTimer = (currentLesson?.type === 'quiz' && examStarted) ? mmss : undefined;

  // Load lesson detail when currentLesson is a lesson (for media + insight tab)
  const [lessonDetail, setLessonDetail] = React.useState<any>(null);
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!currentLesson || currentLesson.type !== "lesson") {
        setLessonDetail(null);
        return;
      }
      try {
        const d = await lessonService.getLessonById(currentLesson.id, dayId);
        if (mounted) setLessonDetail(d);
      } catch (err) {
        console.error("Lỗi khi load lesson detail:", err);
        if (mounted) setLessonDetail(null);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [currentLesson, dayId]);
  // Một hàm phụ để render nội dung bài học đang hoạt động
  const renderActiveLesson = () => {
    if (!currentLesson) return null;

    // Đây là logic switch-case cũ của bạn, giờ được đặt trong một hàm riêng
    switch (currentLesson.type) {
      case "flash_card":
        return (
          <LessonFlashcard
            vocabularies={vocabularies}
            topicId={topicId}
            activityId={activityStatus}
            dayId={dayId}
            onFinish={finishLesson}
          />
        );
      case "shadowing":
        return <LessonShadowingAdapter lessonId={currentLesson.id} />;
      case "dictation":
        return (
          <LessonDictationAdapter
            lessonId={currentLesson.id}
            key={activityKey}
          />
        );
      case "quiz":
        return (
          <>
            <Grid size={{ xs: 12, md: 8 }}>
              {!examStarted ? (
                <LessonIntroExam lesson={currentLesson} onStart={startExam} />
              ) : (
                <LessonExam
                  questions={questions}
                  answers={answers}
                  setAnswers={setAnswers}
                  scorePct={scorePct}
                  timeLeft={timeLeft}
                  mmss={mmss}
                  lessonType={currentLesson.type}
                  onSubmit={submitExam}
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              {examStarted && (
                <LessonSidebarExam
                  questions={questions}
                  answers={answers}
                  scorePct={scorePct}
                  timeLeft={timeLeft}
                  mmss={mmss}
                  onSubmit={submitExam}
                />
              )}
            </Grid>
          </>
        );
      case "lesson":
        // If we have lessonDetail from API, prefer its first media for LessonMedia and pass detail to LessonNotes
        const firstMedia = lessonDetail?.sections_id?.find(
          (s: any) => s.type === "media" && s.medias_id?.length
        )
          ? lessonDetail.sections_id.find((s: any) => s.type === "media")
              .medias_id[0]
          : null;

        return (
          <>
            <Grid size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "center" }}>
              <Box sx={{ width: "100%", display:"flex", justifyContent: "center", maxWidth: "1000px" }}>
                <LessonMedia
                  src={firstMedia?.url || "https://youtu.be/4QnqpWLT5m4"}
                  type={firstMedia?.type === "audio" ? "audio" : "video"}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box>
                <LessonNotes lessonData={lessonDetail} />
              </Box>
            </Grid>
          </>
        );
      default:
        return <div>Loại bài học không xác định.</div>;
    }
  };

  /* Adapter components: fetch the full lesson data and render practice UIs */
  function LessonDictationAdapter({ lessonId }: { lessonId: string }) {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
      let mounted = true;
      const load = async () => {
        setLoading(true);
        try {
          const { dictationService } = await import(
            "../../services/dictation.service"
          );
          const d = await dictationService.getDictationById(lessonId);
          if (mounted) setData(d);
        } catch (err) {
          console.error("Không thể load dictation:", err);
        } finally {
          if (mounted) setLoading(false);
        }
      };
      load();
      return () => {
        mounted = false;
      };
    }, [lessonId]);

    if (loading || !data)
      return (
        <Box textAlign="center" mt={6}>
          <CircularProgress />
        </Box>
      );
    return <DictationContent dictation={data} />;
  }

  function LessonShadowingAdapter({ lessonId }: { lessonId: string }) {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
      let mounted = true;
      const load = async () => {
        setLoading(true);
        try {
          const { shadowingService } = await import(
            "../../services/shadowing.service"
          );
          const d = await shadowingService.getShadowingById(lessonId);
          if (mounted) setData(d);
        } catch (err) {
          console.error("Không thể load shadowing:", err);
        } finally {
          if (mounted) setLoading(false);
        }
      };
      load();
      return () => {
        mounted = false;
      };
    }, [lessonId]);

    if (loading || !data)
      return (
        <Box textAlign="center" mt={6}>
          <CircularProgress />
        </Box>
      );
    return <ShadowingContent lesson={data} />;
  }

  const renderLessonContent = () => {
    if (!currentLesson) return <Box>Chọn một bài học để bắt đầu.</Box>;

    if (currentLesson.status === "completed" && activityStatus === "intro") {
      return (
        <LessonFinishCard
          title={"Bài học đã được hoàn thành"}
          onRedo={redoLesson} // Hàm từ ViewModel
          onNext={completeAndGoToNext} // Hàm từ ViewModel
          onStats={handleOpenModalStatistic}
        />
      );
    }

    // Logic render giờ đây cực kỳ rõ ràng, chỉ dựa vào activityStatus
    switch (activityStatus) {
      case "intro":
        return (
          <LessonIntroCard
            title={currentLesson.title}
            description="Sẵn sàng để bắt đầu bài học mới. Nhấn nút bên dưới để tiếp tục."
            onStart={startLesson}
            type={currentLesson.type}
          />
        );
      case "studying":
        return renderActiveLesson();
      case "finished":
        return (
          <LessonFinishCard
            title={"🎉 Chúc mừng bạn đã hoàn thành!"}
            onRedo={redoLesson} // Hàm từ ViewModel
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
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background: "linear-gradient(135deg, #F5F7FA 0%, #E6EDF6 100%)",
          py: "2%",
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: "1600px",
            mx: "auto",
            p: { xs: 2, md: 4 },
            position: 'relative'
          }}
        >
          {!isSidebarOpen && (
             <AnimatePresence>
               {!isSidebarOpen && (
                 <motion.div
                   key="openSidebarBtn"
                   initial={{ opacity: 0, scale: 0.96 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.96 }}
                   transition={{ duration: 0.18 }}
                   style={{ position: 'absolute', right: 24, top: 24, zIndex: 10 }}
                 >
                   <Tooltip title="Hiện danh sách bài học">
                     <IconButton
                       onClick={() => setIsSidebarOpen(true)}
                       sx={{
                         bgcolor: 'background.paper',
                         boxShadow: 1,
                         '&:hover': { bgcolor: 'background.paper' },
                       }}
                     >
                       <KeyboardDoubleArrowLeftIcon />
                     </IconButton>
                   </Tooltip>
                 </motion.div>
               )}
             </AnimatePresence>
          )}

           <Grid container spacing={3}>
             {/* Main Content */}
             <Grid
               size={{ xs: 12, md: isSidebarOpen ? 9 : 12 }}
               component={motion.div}
               // avoid initial layout animation on first mount
               initial={false}
               layout
               transition={{ layout: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }}
             >
                <Box sx={{ 
                    bgcolor: (t) => t.palette.mode === "light" ? "#FFFFFFCC" : "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(18px)",
                    borderRadius: "24px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
                    p: { xs: 2, md: 4 },
                    minHeight: '80vh'
                }}>
                    <LessonHeader 
                        lesson={currentLesson} 
                        progress={progress}
                        timer={showTimer}
                    />
                    
                    <Grid container spacing={2} sx={{ mt: 2, justifyContent: "center", minHeight: "340px" }}>
                        {loading ? (
                            <LessonContentSkeleton
                                lessonType={currentLesson ? currentLesson.type : "flash_card"}
                            />
                        ) : error ? (
                            <Alert severity="error">{error}</Alert>
                        ) : (
                            <Box sx={{ width: "100%", position: "relative", overflow: 'hidden' }}>
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={activityKey || currentLesson?.id}
                                  layout
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -15 }}
                                  transition={{
                                    duration: 0.4,
                                    ease: [0.4, 0, 0.2, 1],
                                    layout: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
                                  }}
                                >
                                  {renderLessonContent()}
                                </motion.div>
                              </AnimatePresence>
                            </Box>
                        )}
                    </Grid>
                </Box>
             </Grid>

             {/* Sidebar (animated) */}
             <AnimatePresence mode="wait">
               {isSidebarOpen && (
                 <Grid
                   component={motion.div}
                   key="sidebar"
                   size={{ xs: 12, md: 3 }}
                   initial={{ opacity: 0, x: 18 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 18 }}
                   transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                   sx={{ width: '100%' }}
                 >
                   <Box sx={{ position: 'sticky', top: 24, height: 'fit-content' }}>
                     <LessonQueue
                       lessons={lessons}
                       currentLesson={currentLesson}
                       onSelect={selectLesson}
                       variant="vertical"
                       onToggleSidebar={() => setIsSidebarOpen(false)}
                     />
                   </Box>
                 </Grid>
               )}
             </AnimatePresence>
          </Grid>

          {showHistory && (
            <FlashcardHistoryModal
              open={showHistory}
              onClose={handleCloseModalStatistic}
              topicId={topicId}
            />
          )}
        </Container>
      </Box>
    </MainLayout>
  );
}
