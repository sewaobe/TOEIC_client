import * as React from "react";
import { Box, Container, Grid } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import {
  ensureWeekLessons,
  readCurrentLesson,
  saveCurrentLesson,
  saveWeekLessons,
} from "../../utils/lessonStorage";
import {
  getDurationMinutes,
  getQuestionSet,
  grade,
} from "../../constants/questionBank";
import LessonHeader from "../../components/lesson/LessonHeader";
import LessonMedia from "../../components/lesson/LessonMedia";
import LessonNotes from "../../components/lesson/LessonNotes";
import LessonExam from "../../components/lesson/LessonExam";
import LessonSidebar from "../../components/lesson/LessonSidebar";
import LessonSidebarExam from "../../components/lesson/LessonSidebarExam";
import { CurrentLesson, LessonItem } from "../../types/Lesson";
import LessonIntroExam from "../../components/lesson/LessonIntroExam";

export default function LessonPage() {
  // dữ liệu bài hiện tại + danh sách tuần
  const [lesson, setLesson] = React.useState<CurrentLesson | null>(
    readCurrentLesson()
  );
  const [lessons, setLessons] = React.useState<LessonItem[]>(
    ensureWeekLessons()
  );

  // state câu trả lời
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [examStarted, setExamStarted] = React.useState<boolean>(false);
  const [timeLeft, setTimeLeft] = React.useState<number>(0);

  // index hiện tại
  const currentIndex = React.useMemo(() => {
    if (!lesson) return -1;
    return lessons.findIndex((l) => l.id === lesson.id);
  }, [lesson, lessons]);

  // chuyển sang bài khác
  const goToLesson = (target: LessonItem) => {
    const payload: CurrentLesson = {
      id: target.id,
      title: target.title,
      type: target.type,
      week: target.week,
    };
    saveCurrentLesson(payload);
    setLesson(payload);
    setAnswers({});
    setExamStarted(false);
    setTimeLeft(0);
  };

  // hoàn thành + mở khóa tiếp theo
  const markCompleteAndNext = (scorePct?: number) => {
    if (currentIndex >= 0) {
      const newList = [...lessons];
      const cur = { ...newList[currentIndex] };
      cur.status = "done";
      cur.progress = 100;
      newList[currentIndex] = cur;

      const next = newList[currentIndex + 1];
      if (next && next.status === "locked") next.status = "todo";

      saveWeekLessons(newList);
      setLessons(newList);
    }

    const nextItem = lessons[currentIndex + 1];
    if (nextItem) {
      goToLesson(nextItem);
    }
  };

  // reset khi đổi bài
  React.useEffect(() => {
    setExamStarted(false);
    setAnswers({});
    const durMin = getDurationMinutes(lesson);
    setTimeLeft(durMin > 0 ? durMin * 60 : 0);
  }, [lesson?.id, lesson?.type]);

  // đếm ngược timer
  React.useEffect(() => {
    if (!examStarted || timeLeft <= 0) return;
    const itv = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(itv);
          const qs = getQuestionSet(lesson);
          const sc = grade(qs, answers);
          alert(`Hết giờ! Điểm của bạn: ${sc}%`);
          markCompleteAndNext(sc);
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(itv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examStarted, timeLeft]);

  // format mm:ss
  const mmss = React.useMemo(() => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(timeLeft % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  // điểm hiện tại
  const questions = React.useMemo(
    () => getQuestionSet(lesson),
    [lesson?.id, lesson?.type]
  );
  const scorePct = React.useMemo(
    () => grade(questions, answers),
    [questions, answers]
  );

  return (
    <MainLayout>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          background: "linear-gradient(135deg, #F5F7FA 0%, #E6EDF6 100%)",
          py: "3%",
        }}
      >
        <Container
          className="max-w-[1000px] mx-auto p-4 sm:p-6"
          sx={{
            borderRadius: "36px",
            border: "1px solid rgba(0,0,0,0.06)",
            bgcolor: (t) =>
              t.palette.mode === "light"
                ? "#FFFFFFCC"
                : "rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
          }}
        >
          {/* ===== Header ===== */}
          <LessonHeader lesson={lesson} />

          {/* ===== Main layout: Left / Right ===== */}
          <Grid container spacing={2}>
            {/* LEFT */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* CORE hoặc chưa start */}
              {(!lesson ||
                lesson?.type === "core" ||
                ((lesson?.type === "quiz" || lesson?.type === "mini") &&
                  !examStarted)) && (
                <>
                  {lesson?.type === "core" ? (
                    <>
                      <LessonMedia />
                      <LessonNotes />
                    </>
                  ) : lesson ? (
                    <LessonIntroExam
                      lesson={lesson}
                      onStart={() => {
                        setExamStarted(true);
                        const durMin = getDurationMinutes(lesson);
                        setTimeLeft(durMin > 0 ? durMin * 60 : 0);
                        requestAnimationFrame(() => {
                          document
                            .getElementById("exam-questions")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        });
                      }}
                    />
                  ) : null}
                </>
              )}

              {/* EXAM */}
              {lesson?.type !== "core" && examStarted && (
                <LessonExam
                  questions={questions}
                  answers={answers}
                  setAnswers={setAnswers}
                  scorePct={scorePct}
                  timeLeft={timeLeft}
                  mmss={mmss}
                  lessonType={lesson?.type ?? ""}
                  onSubmit={() => {
                    const sc = scorePct;
                    alert(`Bạn đã nộp bài. Điểm: ${sc}%`);
                    markCompleteAndNext(sc);
                  }}
                />
              )}
            </Grid>

            {/* RIGHT */}
            <Grid size={{ xs: 12, md: 4 }}>
              {(!lesson ||
                lesson?.type === "core" ||
                ((lesson?.type === "quiz" || lesson?.type === "mini") &&
                  !examStarted)) && (
                <LessonSidebar
                  lessons={lessons}
                  lesson={lesson}
                  goToLesson={goToLesson}
                />
              )}

              {lesson?.type !== "core" && examStarted && (
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
          </Grid>
        </Container>
      </Box>
    </MainLayout>
  );
}
// LessonPage.tsx
// import * as React from "react";
// import { Box, Container, Grid } from "@mui/material";
// import MainLayout from "../layouts/MainLayout";
// import {
//   ensureWeekLessons,
//   readCurrentLesson,
//   saveCurrentLesson,
//   saveWeekLessons,
// } from "../../utils/lessonStorage";
// import {
//   getDurationMinutes,
//   getQuestionSet,
//   grade,
// } from "../../constants/questionBank";
// import LessonHeader from "../../components/lesson/LessonHeader";
// import LessonMedia from "../../components/lesson/LessonMedia";
// import LessonNotes from "../../components/lesson/LessonNotes";
// import LessonExam from "../../components/lesson/LessonExam";
// import LessonSidebar from "../../components/lesson/LessonSidebar";
// import LessonSidebarExam from "../../components/lesson/LessonSidebarExam";
// import { CurrentLesson, LessonItem } from "../../types/Lesson";
// import LessonIntroExam from "../../components/lesson/LessonIntroExam";
// import { dayStudyService } from "../../services/dayStudy.service";
// import { useSearchParams } from "react-router-dom";

// // map kind từ BE -> type FE
// function mapKindToType(kind: string): "core" | "quiz" | "mini" {
//   switch (kind) {
//     case "lesson":
//       return "core";
//     case "flash_card":
//     case "listening":
//     case "practice":
//       return "quiz"; // tạm map chung sang quiz
//     case "mini_test":
//       return "mini";
//     default:
//       return "core";
//   }
// }

// export default function LessonPage() {
//   const [lesson, setLesson] = React.useState<CurrentLesson | null>(
//     readCurrentLesson()
//   );
//   const [lessons, setLessons] = React.useState<LessonItem[]>(
//     ensureWeekLessons()
//   );

//   const [answers, setAnswers] = React.useState<Record<string, string>>({});
//   const [examStarted, setExamStarted] = React.useState<boolean>(false);
//   const [timeLeft, setTimeLeft] = React.useState<number>(0);

//   const [searchParams] = useSearchParams();
//   const dayId = searchParams.get("day");
//   console.log("res:", dayId);

//   // index hiện tại
//   const currentIndex = React.useMemo(() => {
//     if (!lesson) return -1;
//     return lessons.findIndex((l) => l.id === lesson.id);
//   }, [lesson, lessons]);

//   // load dayStudy từ BE (giả sử lấy dayId từ localStorage)
//   React.useEffect(() => {
//     if (!dayId) return;

//     dayStudyService.getDayStudyById(dayId).then((res) => {
//       console.log("res:", res);
//       if (res.success && res.data) {
//         const day = res.data;

//         // map sessions -> lessons list
//         const mappedLessons: LessonItem[] = day.sessions.flatMap((s: any) =>
//           s.items.map((it: any, idx: number) => ({
//             id: it.lesson_id?._id || `${s.session_no}-${idx}`,
//             title: it.lesson_id?.title || it.kind,
//             type: mapKindToType(it.kind),
//             week: day.week_id,
//             status: s.status === "in_progress" ? "todo" : s.status,
//             progress: 0,
//           }))
//         );

//         setLessons(mappedLessons);
//         if (mappedLessons.length > 0) {
//           const first = mappedLessons[0];
//           const payload: CurrentLesson = {
//             id: first.id,
//             title: first.title,
//             type: first.type,
//             week: first.week,
//           };
//           saveCurrentLesson(payload);
//           setLesson(payload);
//         }
//       }
//     });
//   }, []);

//   // chuyển sang bài khác
//   const goToLesson = (target: LessonItem) => {
//     const payload: CurrentLesson = {
//       id: target.id,
//       title: target.title,
//       type: target.type,
//       week: target.week,
//     };
//     saveCurrentLesson(payload);
//     setLesson(payload);
//     setAnswers({});
//     setExamStarted(false);
//     setTimeLeft(0);
//   };

//   // hoàn thành + mở khóa tiếp theo
//   const markCompleteAndNext = (scorePct?: number) => {
//     if (currentIndex >= 0) {
//       const newList = [...lessons];
//       const cur = { ...newList[currentIndex] };
//       cur.status = "done";
//       cur.progress = 100;
//       newList[currentIndex] = cur;

//       const next = newList[currentIndex + 1];
//       if (next && next.status === "locked") next.status = "todo";

//       saveWeekLessons(newList);
//       setLessons(newList);
//     }

//     const nextItem = lessons[currentIndex + 1];
//     if (nextItem) {
//       goToLesson(nextItem);
//     }
//   };

//   // reset khi đổi bài
//   React.useEffect(() => {
//     setExamStarted(false);
//     setAnswers({});
//     const durMin = getDurationMinutes(lesson);
//     setTimeLeft(durMin > 0 ? durMin * 60 : 0);
//   }, [lesson?.id, lesson?.type]);

//   // đếm ngược timer
//   React.useEffect(() => {
//     if (!examStarted || timeLeft <= 0) return;
//     const itv = setInterval(() => {
//       setTimeLeft((s) => {
//         if (s <= 1) {
//           clearInterval(itv);
//           const qs = getQuestionSet(lesson);
//           const sc = grade(qs, answers);
//           alert(`Hết giờ! Điểm của bạn: ${sc}%`);
//           markCompleteAndNext(sc);
//         }
//         return s - 1;
//       });
//     }, 1000);
//     return () => clearInterval(itv);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [examStarted, timeLeft]);

//   const mmss = React.useMemo(() => {
//     const m = Math.floor(timeLeft / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = Math.floor(timeLeft % 60)
//       .toString()
//       .padStart(2, "0");
//     return `${m}:${s}`;
//   }, [timeLeft]);

//   const questions = React.useMemo(
//     () => getQuestionSet(lesson),
//     [lesson?.id, lesson?.type]
//   );
//   const scorePct = React.useMemo(
//     () => grade(questions, answers),
//     [questions, answers]
//   );

//   return (
//     <MainLayout>
//       <Box
//         sx={{
//           minHeight: "100vh",
//           width: "100%",
//           background: "linear-gradient(135deg, #F5F7FA 0%, #E6EDF6 100%)",
//           py: "3%",
//         }}
//       >
//         <Container
//           className="max-w-[1000px] mx-auto p-4 sm:p-6"
//           sx={{
//             borderRadius: "36px",
//             border: "1px solid rgba(0,0,0,0.06)",
//             bgcolor: (t) =>
//               t.palette.mode === "light"
//                 ? "#FFFFFFCC"
//                 : "rgba(255,255,255,0.08)",
//             backdropFilter: "blur(18px)",
//             boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
//           }}
//         >
//           {/* ===== Header ===== */}
//           <LessonHeader lesson={lesson} />

//           {/* ===== Main layout: Left / Right ===== */}
//           <Grid container spacing={2}>
//             {/* LEFT */}
//             <Grid size={{ xs: 12, md: 8 }}>
//               {/* CORE hoặc chưa start */}
//               {(!lesson ||
//                 lesson?.type === "core" ||
//                 ((lesson?.type === "quiz" || lesson?.type === "mini") &&
//                   !examStarted)) && (
//                 <>
//                   {lesson?.type === "core" ? (
//                     <>
//                       <LessonMedia />
//                       <LessonNotes />
//                     </>
//                   ) : lesson ? (
//                     <LessonIntroExam
//                       lesson={lesson}
//                       onStart={() => {
//                         setExamStarted(true);
//                         const durMin = getDurationMinutes(lesson);
//                         setTimeLeft(durMin > 0 ? durMin * 60 : 0);
//                         requestAnimationFrame(() => {
//                           document
//                             .getElementById("exam-questions")
//                             ?.scrollIntoView({
//                               behavior: "smooth",
//                               block: "start",
//                             });
//                         });
//                       }}
//                     />
//                   ) : null}
//                 </>
//               )}

//               {/* EXAM */}
//               {lesson?.type !== "core" && examStarted && (
//                 <LessonExam
//                   questions={questions}
//                   answers={answers}
//                   setAnswers={setAnswers}
//                   scorePct={scorePct}
//                   timeLeft={timeLeft}
//                   mmss={mmss}
//                   lessonType={lesson?.type ?? ""}
//                   onSubmit={() => {
//                     const sc = scorePct;
//                     alert(`Bạn đã nộp bài. Điểm: ${sc}%`);
//                     markCompleteAndNext(sc);
//                   }}
//                 />
//               )}
//             </Grid>

//             {/* RIGHT */}
//             <Grid size={{ xs: 12, md: 4 }}>
//               {(!lesson ||
//                 lesson?.type === "core" ||
//                 ((lesson?.type === "quiz" || lesson?.type === "mini") &&
//                   !examStarted)) && (
//                 <LessonSidebar
//                   lessons={lessons}
//                   lesson={lesson}
//                   goToLesson={goToLesson}
//                 />
//               )}

//               {lesson?.type !== "core" && examStarted && (
//                 <LessonSidebarExam
//                   questions={questions}
//                   answers={answers}
//                   scorePct={scorePct}
//                   timeLeft={timeLeft}
//                   mmss={mmss}
//                   onSubmit={() => {
//                     const sc = scorePct;
//                     alert(`Bạn đã nộp bài. Điểm: ${sc}%`);
//                     markCompleteAndNext(sc);
//                   }}
//                 />
//               )}
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>
//     </MainLayout>
//   );
// }
