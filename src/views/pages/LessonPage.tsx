import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import MainLayout from "../layouts/MainLayout";
import LessonHeader from "../../components/lesson/LessonHeader";
import { InteractiveVideo } from "../../components/common/InteractiveVideo";
import LessonNotes from "../../components/lesson/LessonNotes";
import { lessonService } from "../../services/lesson.service";
import LessonExam from "../../components/lesson/LessTypeStudy/LessonExam";
import LessonIntroExam from "../../components/lesson/LessonIntroExam";
import LessonQueue from "../../components/lesson/LessonSidebar";
import { useSearchParams } from "react-router-dom";
import { LessonFlashcard } from "../../components/lesson/LessTypeStudy/LessonFlashcard";
import LessonDictation from "../../components/lesson/LessTypeStudy/LessonDictation";
import ShadowingContent from "../../components/practices/ShadowingPractice";
import LessonShadowing from "../../components/lesson/LessTypeStudy/LessonShadowing";
import { LessonIntroCard } from "../../components/lesson/LessTypeStudy/LessonFlashcardIntro";
import { useLessonViewModel } from "../../viewmodels/useLessonViewModel";
import { LessonFinishCard } from "../../components/flashCardItem/FinishedFlashCard";
import { motion, AnimatePresence } from "framer-motion"; // <-- 1. IMPORT
import { LessonContentSkeleton } from "../../components/lesson/LessonSketelon";
import { FlashcardHistoryModal } from "../../components/flashCardItem/FlashCardHistory";
import {
  HistoryModalShell,
  HistoryLessonType,
  BaseAttemptSummary,
} from "../../components/history/HistoryModalShell";
import { historyService } from "../../services/history.service";
import { learningPathActivityService } from "../../services/learningPathActivity.service";

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
    activityKey,
    examStarted,
    questions,
    answers,
    scorePct,
    mmss,
    timeLeft,
    selectLesson,
    completeAndGoToNext,
    startExam,
    submitExam,
    setAnswers,
    activityStatus,
    startLesson,
    finishLesson,
    redoLesson,
    markLessonCompletedWithoutNav,
    lastResult,
    showHistory,
    handleOpenModalStatistic,
    handleCloseModalStatistic,
  } = useLessonViewModel(dayId, week);

  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [historyAttempts, setHistoryAttempts] = React.useState<
    BaseAttemptSummary[]
  >([]);
  const [selectedAttemptId, setSelectedAttemptId] = React.useState<
    string | undefined
  >();
  const lessonStartedAt = React.useRef<number | null>(null);

  const renderHistoryDetail = React.useCallback(
    (attempt?: BaseAttemptSummary) => {
      if (!attempt) {
        return (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Chọn một lần học ở danh sách bên trái để xem chi tiết.
          </Typography>
        );
      }

      const meta = attempt.meta || {};

      if (attempt.type === "flash_card") {
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Lịch sử ôn từ vựng
            </Typography>
            <Typography variant="body2">Điểm: {attempt.scoreLabel}</Typography>
            {attempt.durationSec != null && (
              <Typography variant="body2">
                Thời lượng: {Math.round(attempt.durationSec / 60)} phút
              </Typography>
            )}
            {meta.wordsReviewed != null && (
              <Typography variant="body2">
                Số từ đã ôn: {meta.wordsReviewed}
              </Typography>
            )}
            {(meta.easy != null ||
              meta.medium != null ||
              meta.hard != null) && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Phân bổ độ khó: dễ {meta.easy ?? 0}, vừa {meta.medium ?? 0}, khó{" "}
                {meta.hard ?? 0}
              </Typography>
            )}
            {meta.avgResponseTime != null && (
              <Typography variant="body2">
                Thời gian phản hồi trung bình: {meta.avgResponseTime.toFixed(1)}{" "}
                giây
              </Typography>
            )}
            {Array.isArray(meta.wordSummaries) &&
              meta.wordSummaries.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Chi tiết từng từ
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 220 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Từ vựng</TableCell>
                          <TableCell>Đánh giá</TableCell>
                          <TableCell align="right">Thời gian (s)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {meta.wordSummaries.map((w: any, idx: number) => (
                          <TableRow key={idx} hover>
                            <TableCell>{w.vocabText}</TableCell>
                            <TableCell>{w.eval_type}</TableCell>
                            <TableCell align="right">
                              {w.response_time.toFixed(1)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
          </Box>
        );
      }

      if (attempt.type === "quiz") {
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Lịch sử làm bài kiểm tra
            </Typography>
            <Typography variant="body2">Điểm: {attempt.scoreLabel}</Typography>
            {attempt.durationSec != null && (
              <Typography variant="body2">
                Thời lượng: {Math.round(attempt.durationSec / 60)} phút
              </Typography>
            )}
            {meta.totalQuestions != null && (
              <Typography variant="body2">
                Số câu hỏi: {meta.totalQuestions}
              </Typography>
            )}
            {meta.correct != null && (
              <Typography variant="body2">
                Số câu đúng: {meta.correct}
              </Typography>
            )}
            {Array.isArray(meta.perQuestion) && meta.perQuestion.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Chi tiết từng câu hỏi
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 240 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Câu</TableCell>
                        <TableCell>Nội dung</TableCell>
                        <TableCell>Đáp án bạn chọn</TableCell>
                        <TableCell>Đáp án đúng</TableCell>
                        <TableCell align="center">Kết quả</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {meta.perQuestion.map((q: any) => (
                        <TableRow key={q.index} hover>
                          <TableCell>{q.index}</TableCell>
                          <TableCell>{q.questionText}</TableCell>
                          <TableCell>
                            {q.chosenKey}. {q.chosenText}
                          </TableCell>
                          <TableCell>
                            {q.correctKey}. {q.correctText}
                          </TableCell>
                          <TableCell align="center">
                            {q.correct ? "Đúng" : "Sai"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        );
      }

      if (attempt.type === "dictation") {
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Lịch sử nghe chép
            </Typography>
            <Typography variant="body2">
              Độ chính xác: {attempt.scoreLabel}
            </Typography>
            {attempt.durationSec != null && (
              <Typography variant="body2">
                Thời lượng: {Math.round(attempt.durationSec / 60)} phút
              </Typography>
            )}
            {meta.totalSegments != null && (
              <Typography variant="body2">
                Số câu/đoạn: {meta.totalSegments}
              </Typography>
            )}
            {meta.mistakes != null && (
              <Typography variant="body2">Số lỗi: {meta.mistakes}</Typography>
            )}
            {Array.isArray(meta.segments) && meta.segments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Chi tiết từng câu
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 240 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Câu</TableCell>
                        <TableCell>Đáp án đúng</TableCell>
                        <TableCell>Câu bạn ghi</TableCell>
                        <TableCell align="center">Kết quả</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {meta.segments.map((s: any) => (
                        <TableRow key={s.index} hover>
                          <TableCell>{s.index}</TableCell>
                          <TableCell>{s.correctText}</TableCell>
                          <TableCell>{s.userText}</TableCell>
                          <TableCell align="center">
                            {s.isCorrect ? "Đúng" : "Sai"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        );
      }

      if (attempt.type === "shadowing") {
        return (
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Lịch sử nói đuôi
            </Typography>
            <Typography variant="body2">
              Mức độ giống: {attempt.scoreLabel}
            </Typography>
            {attempt.durationSec != null && (
              <Typography variant="body2">
                Thời lượng: {Math.round(attempt.durationSec / 60)} phút
              </Typography>
            )}
            {meta.scores && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Accuracy: {meta.scores.accuracy}% â€“ Fluency:{" "}
                  {meta.scores.fluency}% â€“ Intonation:{" "}
                  {meta.scores.intonation}%
                </Typography>
              </Box>
            )}
            {meta.overall_feedback && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Nhận xét tổng quan: {meta.overall_feedback}
              </Typography>
            )}
            {meta.audioUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Nghe lại bản ghi
                </Typography>
                <audio controls src={meta.audioUrl} style={{ width: "100%" }} />
              </Box>
            )}
            {Array.isArray(meta.wordFeedback) &&
              meta.wordFeedback.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Điểm phát âm theo từ
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 220 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Từ</TableCell>
                          <TableCell align="right">Điểm (%)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {meta.wordFeedback.map((w: any, idx: number) => (
                          <TableRow key={idx} hover>
                            <TableCell>{w.word}</TableCell>
                            <TableCell align="right">{w.score}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
          </Box>
        );
      }

      return (
        <Box>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Chi tiết lần học
          </Typography>
          <Typography variant="body2">Điểm: {attempt.scoreLabel}</Typography>
          {attempt.durationSec != null && (
            <Typography variant="body2">
              Thời lượng: {Math.round(attempt.durationSec / 60)} phút
            </Typography>
          )}
        </Box>
      );
    },
    []
  );

  // Auto Scroll top
  React.useEffect(() => {
    window.scroll(0, 0);
  }, [currentLesson]);

  // Calculate progress
  const completedCount = lessons.filter((l) => l.status === "completed").length;
  const totalCount = lessons.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Determine timer display
  const showTimer =
    currentLesson?.type === "quiz" && examStarted ? mmss : undefined;

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

  React.useEffect(() => {
    if (currentLesson?.type === "lesson" && activityStatus === "studying") {
      lessonStartedAt.current = Date.now();
    }
  }, [activityStatus, currentLesson]);

  const handleOpenHistoryFromHeader = async () => {
    if (!currentLesson) return;
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const type = currentLesson.type as HistoryLessonType;
      const data = await historyService.getLessonHistory(
        type,
        currentLesson.id
      );
      setHistoryAttempts(data);
      setSelectedAttemptId(data[0]?.id);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCompleteLesson = React.useCallback(async () => {
    if (!currentLesson || currentLesson.type !== "lesson") return;
    const spent =
      lessonStartedAt.current != null
        ? Math.max(1, Math.round((Date.now() - lessonStartedAt.current) / 1000))
        : 0;
    try {
      await learningPathActivityService.submitLesson(
        currentLesson.id,
        dayId,
        spent
      );
      // Cập nhật UI rightbar: đánh dấu lesson hoàn thành nhưng KHÔNG chuyển nội dung
      try {
        markLessonCompletedWithoutNav();
        finishLesson();
      } catch (e) {
        // Nếu cập nhật viewmodel bị lỗi thì chỉ log
        console.error("Update local lesson status failed:", e);
      }
    } catch (error) {
      console.error("Submit lesson failed:", error);
    }
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
            dayId={dayId}
            lessonId={currentLesson.id}
            onFinish={finishLesson}
            onSubmitted={() => {
              markLessonCompletedWithoutNav();
              finishLesson();
            }}
          />
        );
      case "shadowing":
        return (
          <LessonShadowingAdapter
            lessonId={currentLesson.id}
            dayId={dayId}
            onSubmitted={() => {
              markLessonCompletedWithoutNav();
              finishLesson();
            }}
          />
        );
      case "dictation":
        return (
          <LessonDictationAdapter
            lessonId={currentLesson.id}
            dayId={dayId}
            key={activityKey}
            onSubmitted={(score) => {
              markLessonCompletedWithoutNav({ score, type: "dictation" });
              finishLesson();
            }}
          />
        );
      case "quiz":
        if (!questions.length) {
          return (
            <Box textAlign="center" mt={4}>
              <CircularProgress />
              <Typography mt={2} color="text.secondary">
                Đang tải đề quiz...
              </Typography>
            </Box>
          );
        }
        return (
          <>
            <Grid size={{ xs: 12, md: 12 }}>
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
          </>
        );
      case "lesson":
        // If we have lessonDetail from API, prefer its first media for LessonMedia and pass detail to LessonNotes
        const mediaSection = lessonDetail?.sections_id?.find(
          (s: any) => s.type === "media" && s.medias_id?.length
        );
        const firstMedia = mediaSection ? mediaSection.medias_id[0] : null;
        const mediaMarkers = mediaSection?.markers || [];

        return (
          <>
            <Grid
              size={{ xs: 12 }}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  maxWidth: "1000px",
                }}
              >
                <InteractiveVideo
                  videoUrl={firstMedia?.url || "https://youtu.be/4QnqpWLT5m4"}
                  markers={mediaMarkers || []}
                  title={lessonDetail?.title || "Bài học video"}
                  onVideoEnd={handleCompleteLesson}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box>
                <LessonNotes
                  lessonData={lessonDetail}
                  week={week}
                  day_id={dayId}
                />
              </Box>
            </Grid>
            <Grid
              size={{ xs: 12 }}
              sx={{ display: "flex", justifyContent: "center", mt: 2 }}
            >
              <Button variant="contained" onClick={handleCompleteLesson}>
                Hoàn thành bài học
              </Button>
            </Grid>
          </>
        );
      default:
        return <div>Loại bài học không xác định.</div>;
    }
  };

  /* Adapter components: fetch the full lesson data and render practice UIs */
  function LessonDictationAdapter({
    lessonId,
    dayId,
    onSubmitted,
  }: {
    lessonId: string;
    dayId: string;
    onSubmitted: (score?: number) => void;
  }) {
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
    }, [dayId, lessonId]);

    if (loading || !data)
      return (
        <Box textAlign="center" mt={6}>
          <CircularProgress />
        </Box>
      );
    return (
      <LessonDictation
        dictation={data}
        dayStudyId={dayId}
        onSubmitted={onSubmitted}
      />
    );
  }

  function LessonShadowingAdapter({
    lessonId,
    dayId,
    onSubmitted,
  }: {
    lessonId: string;
    dayId: string;
    onSubmitted: () => void;
  }) {
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
    }, [dayId, lessonId]);

    if (loading || !data)
      return (
        <Box textAlign="center" mt={6}>
          <CircularProgress />
        </Box>
      );
    return (
      <LessonShadowing
        lesson={data}
        dayStudyId={dayId}
        onSubmitted={onSubmitted}
      />
    );
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
          score={lastResult?.score}
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
            score={lastResult?.score}
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
            position: "relative",
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
                  style={{
                    position: "absolute",
                    right: 24,
                    top: 24,
                    zIndex: 10,
                  }}
                >
                  <Tooltip title="Hiện danh sách bài học">
                    <IconButton
                      onClick={() => setIsSidebarOpen(true)}
                      sx={{
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&:hover": { bgcolor: "background.paper" },
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
              transition={{
                layout: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
              }}
            >
              <Box
                sx={{
                  bgcolor: (t) =>
                    t.palette.mode === "light"
                      ? "#FFFFFFCC"
                      : "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(18px)",
                  borderRadius: "24px",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
                  p: { xs: 2, md: 4 },
                  minHeight: "80vh",
                }}
              >
                <LessonHeader
                  lesson={currentLesson}
                  progress={progress}
                  timer={showTimer}
                  onOpenHistory={handleOpenHistoryFromHeader}
                />

                <Grid
                  container
                  spacing={2}
                  sx={{ mt: 2, justifyContent: "center", minHeight: "340px" }}
                >
                  {loading ? (
                    <LessonContentSkeleton
                      lessonType={
                        currentLesson ? currentLesson.type : "flash_card"
                      }
                    />
                  ) : error ? (
                    <Alert severity="error">{error}</Alert>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
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
                  sx={{ width: "100%" }}
                >
                  <Box
                    sx={{ position: "sticky", top: 24, height: "fit-content" }}
                  >
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

          <HistoryModalShell
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            lessonTitle={currentLesson?.title}
            lessonType={currentLesson?.type as HistoryLessonType | undefined}
            loading={historyLoading}
            attempts={historyAttempts}
            selectedAttemptId={selectedAttemptId}
            onSelectAttempt={setSelectedAttemptId}
            renderAttemptDetail={renderHistoryDetail}
          />
        </Container>
      </Box>
    </MainLayout>
  );
}
