import React, { FC, useEffect, useReducer, useState } from "react";
import { Button, useTheme } from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import { useCountdown } from "../../hooks/useCountDown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../stores/store";
import testService from "./../../services/test.service";
import { mapAnswersToParts } from "../../utils/mapAnswersToParts";
import { ResultPayload } from "../modals/ToeicQuickResultModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmModal from "../modals/ConfirmModal";
import ToeicQuickResultModal from "../modals/ToeicQuickResultModal";
import { setInitialAnswers } from "../../stores/answerSlice";

interface TestHeaderProps {
  setIsShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  isTourRunning: boolean;
  fromLesson?: boolean;
}

type State = {
  submitOpen: boolean;
  scoreOpen: boolean;
  score: number;
};

type Action =
  | { type: "OPEN_SUBMIT" }
  | { type: "CLOSE_SUBMIT" }
  | { type: "OPEN_SCORE"; payload: number }
  | { type: "CLOSE_SCORE" };

const initialState: State = {
  submitOpen: false,
  scoreOpen: false,
  score: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_SUBMIT":
      return { ...state, submitOpen: true };
    case "CLOSE_SUBMIT":
      return { ...state, submitOpen: false };
    case "OPEN_SCORE":
      return {
        ...state,
        scoreOpen: true,
        score: action.payload,
        submitOpen: false,
      };
    case "CLOSE_SCORE":
      return { ...state, scoreOpen: false };
    default:
      return state;
  }
}

const TestHeader: FC<TestHeaderProps> = ({
  setIsShowSideBar,
  isTourRunning,
  fromLesson = false,
}) => {
  const [state, dispatchLocal] = useReducer(reducer, initialState);
  const [answerTest, setAnswerTest] = useState<ResultPayload>({
    score: 0,
    answers: [],
  });
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const answers = useSelector((state: RootState) => state.answer.answers);
  const groups = useSelector((state: RootState) => state.exam.groups);

  // 👇 Lấy query params trực tiếp
  const [searchParams] = useSearchParams();
  const timeLimitParam = searchParams.get("timeLimit"); // phút
  const parts = searchParams.get("parts"); // nếu có parts thì là practice
  const isDemoTest = searchParams.get("demo_test") === "true";

  const duration = timeLimitParam
    ? parseInt(timeLimitParam, 10) * 60 // practice có giới hạn
    : parts
    ? Infinity // practice không giới hạn
    : 120 * 60; // full test mặc định 120 phút

  const { timeLeft, formatTime } = useCountdown(duration, isTourRunning);

  // Format time hiển thị, nếu vô hạn thì hiển thị ∞
  const displayTime = duration === Infinity ? "Vô hạn" : formatTime();

  const answeredCount = answers.filter((a) => a.answer !== "").length;
  const totalQuestions = answers.length; // Tổng số câu hỏi (có thể là 200 cho full test hoặc ít hơn cho practice)
  const userId = useSelector((state: RootState) => state.user.user!._id);
  const testId = useSelector((state: RootState) => state.exam.currentTestId);

  const [startTime] = useState(Date.now());

  type AnswerItem = RootState["answer"]["answers"][number];

  const submitPreparedAnswers = async (preparedAnswers: AnswerItem[]) => {
    if (!testId || !userId) {
      console.warn("Thiếu testId hoặc userId để nộp bài");
      return;
    }

    const answersMap = preparedAnswers.map((a) => ({
      question_id: a._id,
      selectedOption: a.answer,
    }));
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    // Xác định completedPart dựa trên logic mới
    let completedPart = "";
    if (fromLesson) {
      completedPart = "mini_test";
    } else if (isDemoTest) {
      completedPart = "demo_test";
    } else if (parts) {
      completedPart = parts;
    } else {
      completedPart = "full_test";
    }

    try {
      const result = await testService.submitTest(
        testId,
        userId,
        answersMap,
        elapsed,
        completedPart
      );
      console.log("Chi tiết từng câu:", result.answers);
      console.log("số điểm đạt được:", result.score);
      setAnswerTest({
        score: result.score,
        answers: result.answers.map((answer, index) => ({
          ...answer,
          question_no: index + 1,
        })),
      });
      // --- Persist a lightweight summary (parts accuracy + score) to localStorage ---
      try {
        // Prefer server-provided parts summary if available
        let partsSummary: { part_name: string; accuracy: number }[] = [];

        if (
          result &&
          Array.isArray((result as any).parts) &&
          (result as any).parts.length > 0
        ) {
          partsSummary = (result as any).parts.map((p: any) => {
            const name = p?.part_name ?? p?.name ?? p?.part ?? "";
            let acc = typeof p?.accuracy === "number" ? p.accuracy : 0;
            // normalize fraction -> percent
            if (acc <= 1) acc = acc * 100;
            return { part_name: String(name), accuracy: acc };
          });
        } else if (result && Array.isArray((result as any).answers)) {
          // Fallback: try to map answers to parts using local exam `groups` to find question numbers
          try {
            // build map questionId -> question_no using groups if available
            const qIdToNo = new Map<string, number>();
            if (groups && Array.isArray(groups)) {
              let fallback = 1;
              for (const g of groups) {
                for (const q of (g.questions || []) as any[]) {
                  const qRaw: any = q;
                  const rawId = qRaw._id
                    ? typeof qRaw._id === "string"
                      ? qRaw._id
                      : qRaw._id.$oid ?? String(qRaw._id)
                    : undefined;
                  const match = qRaw.name?.match(/\d+/);
                  const qNo = match ? parseInt(match[0], 10) : fallback++;
                  if (rawId) qIdToNo.set(rawId, qNo);
                }
              }
            }

            const rawAnswers = ((result as any).answers as any[]).map(
              (a, idx) => {
                const qidObj = a.question_id;
                const qid =
                  typeof qidObj === "string"
                    ? qidObj
                    : qidObj?.$oid ?? qidObj?._id ?? undefined;
                const question_no = qIdToNo.get(qid) ?? idx + 1;
                return {
                  question_id: qid,
                  question_no,
                  selectedOption: a.selectedOption,
                  isCorrect: !!a.isCorrect,
                  tags: a.tags || undefined,
                } as any;
              }
            );

            const partsMap = mapAnswersToParts(rawAnswers as any);
            partsSummary = Object.keys(partsMap).map((p) => {
              const arr = partsMap[Number(p) as 1 | 2 | 3 | 4 | 5 | 6 | 7];
              const total = arr.length;
              const correct = arr.filter((a) => !!a.isCorrect).length;
              const accuracy = total > 0 ? (correct / total) * 100 : 0;
              return { part_name: `Part ${p}`, accuracy };
            });
          } catch (e) {
            console.warn("Fallback mapping answers->parts failed", e);
          }
        }

        const payload = {
          testId,
          userId,
          score: result.score,
          parts: partsSummary,
          submit_at: new Date().toISOString(),
        };

        try {
          localStorage.setItem("last_test_result", JSON.stringify(payload));
          if (isDemoTest) {
            localStorage.setItem("demo_test_result", JSON.stringify(payload));
          }
        } catch (e) {
          console.warn("Không lưu được last_test_result vào localStorage", e);
        }
        // Nếu là mini test bắt nguồn từ Lesson (fromLesson=true), không hiện modal kết quả,
        // thay vào đó điều hướng ngay về LessonPage để hiển thị kết quả trong context của lộ trình học.
        if (fromLesson) {
          const returnInfo = localStorage.getItem("mini_test_return");
          try {
            if (returnInfo) {
              const { dayId, week } = JSON.parse(returnInfo);
              navigate(`/lesson?day=${dayId}&week=${week}`);
            } else {
              navigate("/home");
            }
          } catch (e) {
            console.warn("Error navigating back to lesson after mini_test", e);
            navigate("/home");
          }
          return; // skip opening the modal
        }
      } catch (e) {
        console.warn("Tính toán parts summary thất bại", e);
      }
      dispatchLocal({ type: "OPEN_SCORE", payload: result.score });
    } catch (err) {
      console.error("Submit test failed", err);
      dispatchLocal({ type: "CLOSE_SUBMIT" });
    }
  };

  const handleSubmit = async () => {
    await submitPreparedAnswers(answers);
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const cloned = [...arr];
    for (let i = cloned.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
  };

  const handleQuickSubmit = async () => {
    if (!groups || groups.length === 0 || !answers || answers.length === 0) {
      console.warn("Chưa có dữ liệu câu hỏi để nộp nhanh");
      return;
    }

    let fallbackNumber = 1;
    const questionMetas = groups.flatMap((group) =>
      group.questions.map((q) => {
        const match = q.name?.match(/\d+/);
        const questionNumber = match
          ? parseInt(match[0], 10)
          : fallbackNumber++;
        if (match) {
          fallbackNumber = questionNumber + 1;
        }
        const options = Object.keys(q.choices || {});
        return {
          questionNumber,
          correctAnswer: q.correctAnswer,
          options,
        };
      })
    );

    if (questionMetas.length === 0) {
      console.warn("Không tìm thấy câu hỏi để nộp nhanh");
      return;
    }

    const questionNumbers = questionMetas.map((q) => q.questionNumber);
    // Mục tiêu điểm ~400-420 → đặt tỷ lệ đúng khoảng 40% - 42%
    const correctRatio = 0.4 + Math.random() * 0.02; // ~400-420 điểm
    const targetCorrect = Math.max(
      1,
      Math.round(questionMetas.length * correctRatio)
    );
    const shuffledNumbers = shuffleArray(questionNumbers);
    const correctSet = new Set(shuffledNumbers.slice(0, targetCorrect));

    const metaMap = new Map<
      number,
      { correctAnswer: string; options: string[] }
    >();
    questionMetas.forEach((meta) => {
      metaMap.set(meta.questionNumber, {
        correctAnswer: meta.correctAnswer,
        options: meta.options,
      });
    });

    const autoFilledAnswers: AnswerItem[] = answers.map((item) => {
      const meta = metaMap.get(item.question);
      if (!meta) return item;

      const { correctAnswer, options } = meta;
      const shouldBeCorrect = correctSet.has(item.question);

      let selected = correctAnswer;
      if (!shouldBeCorrect) {
        const wrongChoices = options.filter((opt) => opt !== correctAnswer);
        if (wrongChoices.length > 0) {
          selected =
            wrongChoices[Math.floor(Math.random() * wrongChoices.length)];
        }
      }

      return {
        ...item,
        answer: selected,
        isFlagged: false,
      };
    });

    dispatch(setInitialAnswers(autoFilledAnswers));
    await submitPreparedAnswers(autoFilledAnswers);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      console.log("Hết giờ làm bài");
    }
  }, [timeLeft]);

  const handleCloseScoreModal = () => {
    dispatchLocal({ type: "CLOSE_SCORE" });

    // Debug log to help trace close action
    try {
      console.log("handleCloseScoreModal called", { fromLesson });
    } catch (e) {
      /* ignore */
    }

    // Nếu là mini test từ lesson, navigate về LessonPage
    if (fromLesson) {
      const returnInfo = localStorage.getItem("mini_test_return");
      try {
        console.log("mini_test_return:", returnInfo);
      } catch (e) {}
      if (returnInfo) {
        const { dayId, week } = JSON.parse(returnInfo);
        // LessonPage is mounted at `/lesson` route
        navigate(`/lesson?day=${dayId}&week=${week}`);
      } else {
        navigate("/home");
      }
    } else {
      navigate("/home");
    }
  };

  return (
    <header className="w-full bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Logo / Tiêu đề */}
      <h1
        style={{ color: theme.palette.primary.main }}
        className="text-xl font-bold"
      >
        TOEIC Online Test
      </h1>

      {/* Thời gian còn lại */}
      <span
        data-tour-id="time-counter"
        className="font-medium"
        style={{ color: theme.palette.text.primary }}
      >
        Thời gian: {displayTime}
      </span>

      {/* Thông tin cơ bản */}
      <div className="flex items-center gap-6">
        <Button
          data-tour-id="submit-button"
          variant="contained"
          color="secondary"
          className="rounded-lg px-4 py-2 font-semibold"
          onClick={() => dispatchLocal({ type: "OPEN_SUBMIT" })}
        >
          Nộp bài
        </Button>

        {/* Chỉ hiển thị nút Nộp nhanh khi làm full test (không có parts param) */}
        {!parts && (
          <Button
            variant="outlined"
            color="primary"
            className="rounded-lg px-4 py-2 font-semibold"
            onClick={handleQuickSubmit}
          >
            Nộp nhanh (mock)
          </Button>
        )}

        <span
          className="font-medium"
          style={{ color: theme.palette.text.secondary }}
        >
          Câu đã làm: {answeredCount}/{totalQuestions}
        </span>

        <div
          data-tour-id="sidebar-toggle"
          className="p-2 rounded-lg shadow-lg cursor-pointer"
          style={{ backgroundColor: theme.palette.primary.main }}
          onClick={() => setIsShowSideBar((prev) => !prev)}
        >
          <AppsIcon className="text-white" />
        </div>
      </div>

      <ConfirmModal
        open={state.submitOpen}
        message="Bạn có chắc chắn muốn nộp bài không?"
        onConfirm={handleSubmit}
        onCancel={() => dispatchLocal({ type: "CLOSE_SUBMIT" })}
      />

      <ToeicQuickResultModal
        open={state.scoreOpen}
        data={answerTest}
        onReviewDetails={(id) => navigate(`/tests/${testId}/result/${id}`)}
        onSuggestPlan={() => navigate(`/plan?score=${answerTest.score}`)}
        onClose={handleCloseScoreModal}
        testId={testId}
        practicedParts={parts ? parts.split(",").map(Number) : undefined}
      />
    </header>
  );
};

export default TestHeader;
