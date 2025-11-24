import * as React from "react";
import { dayStudyService } from "../services/dayStudy.service";
import { flashCardService } from "../services/flashCard.service";
import quizService from "../services/quiz.service";
import { getDurationMinutes, grade } from "../constants/questionBank";
import useLocalStorage from "../hooks/useLocalStorage";
import { LessonItem, QCQuestion } from "../types/Lesson";
import { Word } from "../components/flashCardItem/FlashCard";

export const useLessonViewModel = (dayId: string, week: string) => {
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
  const [vocabularies, setVocabularies] = useLocalStorage<Word[]>(
    "vocabularies",
    []
  );
  const [topicId, setTopicId] = React.useState("");
  const [activityKey, setActivityKey] = React.useState(0);
  const [isReviewMode, setIsReviewMode] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // State for quiz questions fetched from API
  const [quizQuestions, setQuizQuestions] = React.useState<QCQuestion[]>([]);

  // State quản lý vòng đời của bài học
  const [activityStatus, setActivityStatus] = React.useState("intro"); // Mặc định là intro

  // State riêng cho Quiz
  const [examStarted, setExamStarted] = React.useState(false);
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
    console.log(
      "[useLessonViewModel] startLesson",
      currentLesson?.id,
      currentLesson?.title
    );
    setActivityStatus("studying");
  };
  const finishLesson = () => {
    console.log(
      "[useLessonViewModel] finishLesson",
      currentLesson?.id,
      currentLesson?.title
    );
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

        if (isInitialLoad.current) {
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

  // Effect: Lấy dữ liệu riêng cho từng bài học (ví dụ: flashcard, quiz)
  React.useEffect(() => {
    if (!currentLesson) return;

    // Reset state của các bài học trước đó
    setExamStarted(false);
    setAnswers({});
    setActivityStatus("studying");
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
          console.log("Quiz API response:", res);

          // Backend trả về { success, data: Quiz, message }
          const quiz = res.data?.data || res.data;

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
            console.log("Mapped quiz questions:", mappedQuestions);
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

      console.log(
        "[useLessonViewModel] completeAndGoToNext for",
        currentLesson.id
      );

      const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
      if (currentIndex === -1) return;

      const newList: LessonItem[] = lessons.map((lesson, index) => {
        if (index === currentIndex) return { ...lesson, status: "completed" };
        if (index === currentIndex + 1 && lesson.status === "lock")
          return { ...lesson, status: "in_progress" };
        return lesson;
      });
      setLessons(newList);

      const nextLesson = newList[currentIndex + 1];
      if (nextLesson) {
        console.log(
          "[useLessonViewModel] unlocking + selecting next lesson",
          nextLesson.id
        );
        selectLesson(nextLesson);
      } else {
        alert("Hoàn thành tất cả bài học!");
      }
    },
    [currentLesson, lessons, setLessons, selectLesson]
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
    const duration = getDurationMinutes(currentLesson);
    setTimeLeft(duration > 0 ? duration * 60 : 0);
    setExamStarted(true);
  }, [currentLesson]);

  const submitExam = React.useCallback(() => {
    const finalScore = grade(questions, answers);
    alert(`Bạn đã nộp bài. Điểm: ${finalScore}%`);
    completeAndGoToNext(finalScore);
  }, [questions, answers, completeAndGoToNext]);

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
  };
};
