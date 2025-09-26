import * as React from "react";
import { Box, Button, Container, Grid } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import {
  getDurationMinutes,
  getQuestionSet,
  grade,
} from "../../constants/questionBank";
import LessonHeader from "../../components/lesson/LessonHeader";
import LessonMedia from "../../components/lesson/LessonMedia";
import LessonNotes from "../../components/lesson/LessonNotes";
import LessonExam from "../../components/lesson/LessTypeStudy/LessonExam";
import LessonSidebarExam from "../../components/lesson/LessonSidebarExam";
import { LessonItem } from "../../types/Lesson";
import LessonIntroExam from "../../components/lesson/LessonIntroExam";
import LessonQueue from "../../components/lesson/LessonSidebar";
import { useSearchParams } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage"; // hook bạn viết
import { dayStudyService } from "../../services/dayStudy.service";
import Flashcard, { Word } from "../../components/flashCardItem/FlashCard";
import { LessonFlashcard } from "../../components/lesson/LessTypeStudy/LessonFlashcard";
import { flashCardService } from "../../services/flashCard.service";
import { LessonShadowing } from "../../components/lesson/LessTypeStudy/LessonShadowing";
import { LessonDictation } from "../../components/lesson/LessTypeStudy/LessonDictation";

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
  const [lessons, setLessons] = useLocalStorage<LessonItem[]>("week_lessons", []);
  const [lesson, setLesson] = useLocalStorage<LessonItem | null>("current_lesson", null);
  const [vocabularies, setVocabularies] = useLocalStorage<Word[]>("vocabularies", []);
  const [topicId, setTopicId] = React.useState(""); // dùng để lưu topic_id khi lesson = flash card.
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [examStarted, setExamStarted] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(0);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const currentIndex = React.useMemo(() => {
    if (!lesson) return -1;
    return lessons.findIndex((l) => l.id === lesson.id);
  }, [lesson, lessons]);

  // Call API
  React.useEffect(() => {
    let mounted = true;
    if (!dayId) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data: LessonItem[] = await dayStudyService.getDayStudyById(dayId, week);
        if (!mounted) return;
        setLessons(data);

        // Set bài học hiện tại, nếu tất cả đều khác in_progress thì mặc định lấy bài đầu
        const cur = data.find((l) => l.status === "in_progress");
        if (cur) setLesson(cur);
        else setLesson(data[0]);


      } catch (e: any) {
        console.error(e);
        if (!mounted) return;
        setError(e?.message || "Không thể tải dữ liệu ngày học.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayId]);

  React.useEffect(() => {
    if (!lesson) return;

    const fetchFlashcards = async () => {
      if (lesson.type === "flash_card") {
        try {
          const { topic_id, dataVocabularies } = await flashCardService.getFlashcardById(lesson.id);
          setVocabularies(dataVocabularies);
          setTopicId(topic_id)
        } catch (err) {
          console.error("❌ Lỗi lấy flashcards:", err);
          setVocabularies([]);
        }
      }
    };

    fetchFlashcards();
  }, [lesson?.id, lesson?.type]);

  const goToLesson = async (target: LessonItem) => {
    if (target.status === "lock") return;
    if (target.type === "flash_card") {
      const { topic_id, dataVocabularies } = await flashCardService.getFlashcardById(target.id);
      setVocabularies(dataVocabularies);
      setTopicId(topic_id)
    }
    setLesson(target);
    setAnswers({});
    setExamStarted(false);
    setTimeLeft(0);
    requestAnimationFrame(() => {
      document.getElementById("lesson-top")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const markCompleteAndNext = (scorePct?: number) => {
    if (currentIndex >= 0) {
      const newList = [...lessons];
      const cur = { ...newList[currentIndex] };
      cur.status = "completed";
      newList[currentIndex] = cur;

      const next = newList[currentIndex + 1];
      if (next && next.status === "lock") next.status = "in_progress";

      setLessons(newList); // hook auto lưu localStorage
    }

    const nextItem = lessons[currentIndex + 1];
    if (nextItem) goToLesson(nextItem);
  };

  React.useEffect(() => {
    setExamStarted(false);
    setAnswers({});
    const durMin = getDurationMinutes(lesson);
    setTimeLeft(durMin > 0 ? durMin * 60 : 0);
  }, [lesson?.id, lesson?.type]);

  const questions = React.useMemo(
    () => getQuestionSet(lesson),
    [lesson?.id, lesson?.type]
  );
  const scorePct = React.useMemo(
    () => grade(questions, answers),
    [questions, answers]
  );

  const mmss = React.useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = Math.floor(timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);
  console.log("Lesson", lesson);
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
          <LessonHeader lesson={lesson} />

          <Grid container spacing={2}>
            {lesson?.type === "lesson" && (
              <>
                <Grid size={{ xs: 12, md: 8 }}>
                  <LessonMedia src="https://youtu.be/4QnqpWLT5m4?list=PLNPwQbkRm9Gu9eiGlHuzrHL6pCSj2Y8qJ" type="video" />
                  <Box mt={2}>
                    <LessonNotes />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <LessonTranscript lesson={lesson} />
                </Grid>
              </>
            )}

            {lesson?.type === "flash_card" && vocabularies.length > 0 && (
              <LessonFlashcard vocabularies={vocabularies} topicId={topicId} activityId={lesson.id} dayId={dayId}/>
            )}

            {lesson?.type === "shadowing" && (
              <LessonShadowing />
            )}

            {lesson?.type === "dictation" && (
              <LessonDictation />
            )}

            {lesson?.type === "quiz" && (
              <>
                <Grid size={{ xs: 12, md: 8 }}>
                  {!examStarted ? (
                    <LessonIntroExam
                      lesson={lesson}
                      onStart={() => {
                        setExamStarted(true);
                        const durMin = getDurationMinutes(lesson);
                        setTimeLeft(durMin > 0 ? durMin * 60 : 0);
                      }}
                    />
                  ) : (
                    <LessonExam
                      questions={questions}
                      answers={answers}
                      setAnswers={setAnswers}
                      scorePct={scorePct}
                      timeLeft={timeLeft}
                      mmss={mmss}
                      lessonType={lesson.type}
                      onSubmit={() => {
                        const sc = scorePct;
                        alert(`Bạn đã nộp bài. Điểm: ${sc}%`);
                        markCompleteAndNext(sc);
                      }}
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
                      onSubmit={() => {
                        const sc = scorePct;
                        alert(`Bạn đã nộp bài. Điểm: ${sc}%`);
                        markCompleteAndNext(sc);
                      }}
                    />
                  )}
                </Grid>
              </>
            )}
          </Grid>

          <LessonQueue
            lessons={lessons}
            currentLesson={lesson}
            onSelect={goToLesson}
          />
        </Container>
      </Box>
    </MainLayout>
  );
}
