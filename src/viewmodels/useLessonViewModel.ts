import * as React from "react";
import { useNavigate } from "react-router-dom";
import { dayStudyService } from "../services/dayStudy.service";
import { flashCardService } from "../services/flashCard.service";
import { getDurationMinutes, grade } from "../constants/questionBank";
import useLocalStorage from "../hooks/useLocalStorage";
import { LessonItem, QCQuestion } from "../types/Lesson";
import { FlashcardItem } from "../components/modals/CreateFlashcardItemModal";
import quizService from "../services/quiz.service";
import { learningPathActivityService } from "../services/learningPathActivity.service";
import { toast } from "sonner";

export const useLessonViewModel = (dayId: string, week: string) => {
  const navigate = useNavigate();
  // =================================================================
  // 1. STATE MANAGEMENT: Toàn bộ state được quản lý tại đây
  // =================================================================
  const [lessons, setLessons] = useLocalStorage<LessonItem[]>(
    "week_lessons",
    []
  );
  const [currentLesson, setCurrentLesson] = useLocalStorage<LessonItem | null>(
    "current_lesson",
    null
  );
  const [vocabularies, setVocabularies] = useLocalStorage<FlashcardItem[]>(
    "vocabularies",
    []
  );
  const [topicId, setTopicId] = React.useState("");
  const [activityKey, setActivityKey] = React.useState(0);
  const [isReviewMode, setIsReviewMode] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<{
    score?: number;
    type?: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // State for quiz questions fetched from API
  const [quizQuestions, setQuizQuestions] = React.useState<QCQuestion[]>([]);

  // State quản lý vòng đời của bài học
  // For "lesson" type, default to "studying" (no intro needed)
  // For other types, default to "intro"
  const [activityStatus, setActivityStatus] = React.useState<
    "intro" | "studying" | "finished"
  >("studying");

  // State riêng cho Quiz
  const [examStarted, setExamStarted] = React.useState(false);
  const [examStartedAt, setExamStartedAt] = React.useState<number | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = React.useState(0);

  // State mở modal thống kê kết quả
  const [showHistory, setShowHistory] = React.useState(false);

  const isInitialLoad = React.useRef(true);

  // =================================================================
  // 2. MEMOIZED VALUES: Các giá trị được tính toán
  // =================================================================
  const questions = React.useMemo<QCQuestion[]>(() => {
    // Use fetched quiz questions from API if available
    if (currentLesson?.type === "quiz" && quizQuestions.length > 0) {
      return quizQuestions;
    }
    return [];
  }, [currentLesson, quizQuestions]);

  const scorePct = React.useMemo(
    () => grade(questions, answers),
    [questions, answers]
  );

  const mmss = React.useMemo(() => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(timeLeft % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  // Handle Lesson Status
  const startLesson = () => {
    setActivityStatus("studying");
  };
  const finishLesson = () => {
    // Tại đây bạn có thể gọi API để đánh dấu bài học hoàn thành nếu cần
    setActivityStatus("finished");
  };
  const redoLesson = () => setActivityStatus("studying");

  //Handle click modal thống kê
  const handleOpenModalStatistic = () => {
    setShowHistory(true);
  };
  const handleCloseModalStatistic = () => {
    setShowHistory(false);
  };

  // =================================================================
  // 3. SIDE EFFECTS (useEffect): Xử lý gọi API, timer...
  // =================================================================

  // Effect chính: Lấy danh sách bài học của ngày
  React.useEffect(() => {
    if (!dayId) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dayStudyService.getDayStudyById(dayId, week);
        if (!mounted) return;
        setLessons(data);

        if (isInitialLoad.current && currentLesson === null) {
          const inProgressLesson = data.find((l) => l.status === "in_progress");
          setCurrentLesson(inProgressLesson || data[0] || null);
          isInitialLoad.current = false;
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không thể tải dữ liệu.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayId, week]);

  // Lắng nghe sự kiện khi một adjustment request được phản hồi (approve/reject)
  // Nếu thay đổi ảnh hưởng tới ngày hiện tại (dayId) thì reload dữ liệu ngày
  React.useEffect(() => {
    const handler = (e: any) => {
      try {
        const req = e?.detail?.request;
        if (!req || !Array.isArray(req.changes)) return;
        const affectsCurrentDay = req.changes.some(
          (c: any) => c.dayStudyId && String(c.dayStudyId) === String(dayId)
        );
        if (affectsCurrentDay) {
          // Reload dữ liệu ngày
          (async () => {
            try {
              const data = await dayStudyService.getDayStudyById(dayId, week);
              setLessons(data);
              // Nếu currentLesson đang null hoặc hết, cập nhật
              const inProgressLesson = data.find(
                (l) => l.status === "in_progress"
              );
              setCurrentLesson(inProgressLesson || data[0] || null);
            } catch (err) {
              console.error("Lỗi reload dayStudy sau adjustment:", err);
            }
          })();
        }
      } catch (err) {
        console.error("Error handling adjustment:responded event", err);
      }
    };

    window.addEventListener("adjustment:responded", handler as EventListener);
    return () =>
      window.removeEventListener(
        "adjustment:responded",
        handler as EventListener
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayId, week]);

  // Effect: Lấy dữ liệu riêng cho từng bài học (ví dụ: flashcard, quiz)
  React.useEffect(() => {
    if (!currentLesson) return;

    // Reset state của các bài học trước đó
    setExamStarted(false);
    setExamStartedAt(null);
    setAnswers({});
    // Nếu bài đã completed và type KHÔNG phải "lesson", hiển thị finish card
    // Type "lesson" không có finish card, chỉ xem lại video
    if (
      currentLesson.status === "completed" &&
      currentLesson.type !== "lesson"
    ) {
      setActivityStatus("intro"); // Show finish card
    } else {
      setActivityStatus("studying"); // Start directly
    }
    setQuizQuestions([]);

    const fetchLessonSpecificData = async () => {
      if (currentLesson.type === "flash_card") {
        try {
          const { topic_id, dataVocabularies } =
            await flashCardService.getFlashcardById(currentLesson.id);
          setVocabularies(dataVocabularies);
          setTopicId(topic_id);
        } catch (err) {
          console.error("Lỗi lấy flashcards:", err);
        }
      }

      if (currentLesson.type === "quiz") {
        try {
          const res = await quizService.getQuizById(currentLesson.id);

          // Backend trả về { success, data: Quiz, message }
          const quiz = res.data;

          if (quiz && quiz.question_ids && Array.isArray(quiz.question_ids)) {
            // Map backend format to QCQuestion format
            const mappedQuestions: QCQuestion[] = quiz.question_ids.map(
              (q: any) => ({
                id: q._id,
                text: q.textQuestion || q.name || "",
                options: Object.entries(q.choices || {}).map(([key, text]) => ({
                  key,
                  text: text as string,
                })),
                answer: q.correctAnswer,
              })
            );
            setQuizQuestions(mappedQuestions);
          } else {
            console.error("Quiz data invalid or empty:", quiz);
          }
        } catch (err) {
          console.error("Lỗi lấy quiz:", err);
        }
      }
    };

    fetchLessonSpecificData();
  }, [currentLesson]);

  // Effect: Quản lý bộ đếm thời gian cho quiz
  React.useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [examStarted, timeLeft]);

  // =================================================================
  // 4. ACTIONS & EVENT HANDLERS: Các hàm mà View sẽ gọi
  // =================================================================
  const selectLesson = React.useCallback(
    async (targetLesson: LessonItem) => {
      if (
        targetLesson.status === "lock" ||
        targetLesson.id === currentLesson?.id
      )
        return;

      console.log(
        "[useLessonViewModel] selectLesson ->",
        targetLesson.id,
        targetLesson.title
      );
      setIsReviewMode(false);
      setCurrentLesson(targetLesson);
    },
    [currentLesson?.id, setCurrentLesson]
  );

  const completeAndGoToNext = React.useCallback(
    (score?: number) => {
      if (!currentLesson) return;

      const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
      if (currentIndex === -1) return;

      const newList: LessonItem[] = lessons.map((lesson, index) => {
        if (index === currentIndex) return { ...lesson, status: "completed" };
        // Chỉ unlock bài tiếp theo nếu nó đang lock, không động vào bài completed
        if (index === currentIndex + 1 && lesson.status === "lock")
          return { ...lesson, status: "in_progress" };
        return lesson;
      });
      setLessons(newList);

      const nextLesson = newList[currentIndex + 1];
      if (nextLesson) {
        selectLesson(nextLesson);
      } else {
        // Hết bài học trong ngày → Tự động chuyển sang ngày tiếp theo
        toast.success("🎉 Hoàn thành tất cả bài học trong ngày!");

        // Navigate về trang programs để xem dashboard và chọn ngày tiếp theo
        setTimeout(() => {
          navigate("/programs");
        }, 1500);
      }
    },
    [currentLesson, lessons, setLessons, selectLesson, navigate]
  );

  // Đánh dấu bài học hiện tại hoàn thành nhưng KHÔNG điều hướng sang bài tiếp theo
  const markLessonCompletedWithoutNav = React.useCallback(
    (result?: { score?: number; type?: string }) => {
      if (!currentLesson) return;

      const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
      if (currentIndex === -1) return;

      const newList: LessonItem[] = lessons.map((lesson, index) => {
        if (index === currentIndex) return { ...lesson, status: "completed" };
        // Chỉ unlock bài tiếp theo nếu nó đang lock, không động vào bài completed hoặc in_progress
        if (index === currentIndex + 1 && lesson.status === "lock")
          return { ...lesson, status: "in_progress" };
        return lesson;
      });
      setLessons(newList);
      if (result) setLastResult(result);
    },
    [currentLesson, lessons, setLessons]
  );

  const retryLesson = React.useCallback(() => {
    setIsReviewMode(true);
    setActivityKey((prev) => prev + 1);
    if (currentLesson?.type === "quiz") {
      setAnswers({}); // Reset câu trả lời khi làm lại quiz
    }
  }, [currentLesson?.type]);

  // Actions riêng cho Quiz
  const startExam = React.useCallback(() => {
    if (!questions.length) {
      alert("Đang tải đề quiz, vui lòng đợi trong giây lát.");
      return;
    }
    const duration = getDurationMinutes(currentLesson);
    setTimeLeft(duration > 0 ? duration * 60 : 0);
    setExamStarted(true);
    setExamStartedAt(Date.now());
  }, [currentLesson, questions.length]);

  const submitExam = React.useCallback(async () => {
    if (!currentLesson) return;
    if (!dayId) {
      toast.error("Thiếu day_study_id để nộp quiz.");
      return;
    }

    const payloadAnswers = Object.entries(answers).map(
      ([question_id, user_answer]) => ({ question_id, user_answer })
    );
    const time_spent =
      examStartedAt != null
        ? Math.max(0, Math.round((Date.now() - examStartedAt) / 1000))
        : 0;

    try {
      const res = await toast.promise(
        learningPathActivityService.submitQuiz(
          currentLesson.id,
          payloadAnswers,
          dayId,
          time_spent
        ),
        {
          loading: "Đang nộp quiz...",
          success: "Nộp quiz thành công!",
          error: "Nộp quiz thất bại, vui lòng thử lại.",
        }
      );

      const apiScore =
        (res as any)?.data?.score ?? (res as any)?.data?.data?.score;
      const finalScore =
        typeof apiScore === "number" ? apiScore : grade(questions, answers);

      // Thay vì chuyển sang bài tiếp theo, chỉ cập nhật trạng thái hiện tại là hoàn thành
      try {
        markLessonCompletedWithoutNav({ score: finalScore, type: "quiz" });
        finishLesson();
      } catch (e) {
        console.error("Update after submitQuiz failed:", e);
        // fallback: select next lesson to preserve previous behavior
        completeAndGoToNext(finalScore);
      }
    } catch (error) {
      console.error("Nop quiz learning path that bai", error);
    }
  }, [
    answers,
    completeAndGoToNext,
    currentLesson,
    dayId,
    examStartedAt,
    questions,
  ]);

  // =================================================================
  // 5. VIEWMODEL API: Trả về state và actions cho View
  // =================================================================
  return {
    // State & Data
    loading,
    error,
    lessons,
    currentLesson,
    vocabularies,
    topicId,
    isReviewMode,
    activityKey,

    // Quiz State & Data
    examStarted,
    questions,
    answers,
    scorePct,
    mmss,
    timeLeft,

    // Actions
    selectLesson,
    retryLesson,
    completeAndGoToNext,
    startExam,
    submitExam,
    setAnswers, // Cung cấp setAnswers để component con cập nhật

    activityStatus,
    startLesson,
    finishLesson, // Trả ra finishLesson để các component con gọi
    redoLesson,

    showHistory,
    handleOpenModalStatistic,
    handleCloseModalStatistic,
    markLessonCompletedWithoutNav,
    lastResult,
  };
};
