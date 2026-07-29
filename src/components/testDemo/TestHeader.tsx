import React, { FC, useEffect, useReducer, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import { useCountdown } from "../../hooks/useCountDown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../stores/store";
import testService, { UserTestSubmitType } from "./../../services/test.service";
import { getPartFromQuestionNo as getPartFromQuestionNumber } from "../../utils/mapAnswersToParts";
import { ResultPayload } from "../modals/ToeicQuickResultModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmModal from "../modals/ConfirmModal";
import ToeicQuickResultModal from "../modals/ToeicQuickResultModal";
import { setInitialAnswers } from "../../stores/answerSlice";
import learningPathV2Service, {
  LearningPathV2AssessmentType,
} from "../../services/learning_path_v2.service";

interface TestHeaderProps {
  setIsShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  isTourRunning: boolean;
  fromLesson?: boolean;
  openModal?: () => void;
  onPlanReady?: () => void;
  setIsSubmitted: (val: boolean) => void;
  isSubmitted: boolean;
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
  setIsSubmitted,
  isSubmitted
}) => {
  const [state, dispatchLocal] = useReducer(reducer, initialState);
  const [answerTest, setAnswerTest] = useState<ResultPayload>({
    score: 0,
    answers: [],
  });
  const [isMockDialogOpen, setIsMockDialogOpen] = useState(false);
  const [mockAccuracy, setMockAccuracy] = useState(60);
  const [mockScenarioOverride, setMockScenarioOverride] = useState<"PLATEAU" | undefined>();
  const [customPartAccuracy, setCustomPartAccuracy] = useState(false);
  const [partAccuracies, setPartAccuracies] = useState<Record<number, number>>({});
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
  const assessmentTypeParam = searchParams.get("assessmentType");

  const duration = timeLimitParam
    ? parseInt(timeLimitParam, 10) * 60 // practice có giới hạn
    : parts
      ? Infinity // practice không giới hạn
      : 120 * 60; // full test mặc định 120 phút

  const shouldPause = isTourRunning || isSubmitted || groups.length === 0;

  const { timeLeft, formatTime } = useCountdown(duration, shouldPause);

  // Format time hiển thị, nếu vô hạn thì hiển thị ∞
  const displayTime = duration === Infinity ? "Vô hạn" : formatTime();

  const answeredCount = answers.filter((a) => a.answer !== "").length;
  const totalQuestions = answers.length; // Tổng số câu hỏi (có thể là 200 cho full test hoặc ít hơn cho practice)
  const userId = useSelector((state: RootState) => state.user.user?._id) || "guest";
  const testId = useSelector((state: RootState) => state.exam.currentTestId);

  const [startTime] = useState(Date.now());

  type AnswerItem = RootState["answer"]["answers"][number];
  type LearningPathAssessmentReturn = {
    dayId?: string;
    week?: string | number;
    testId?: string;
    learningPathId?: string;
    weekStudyId?: string;
    dayStudyId?: string;
    assessmentType?: LearningPathV2AssessmentType;
  };

  const getLearningPathAssessmentReturn = (): LearningPathAssessmentReturn | null => {
    const raw = localStorage.getItem("learning_path_assessment_return");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.warn("Không parse được learning_path_assessment_return", e);
      }
    }

    const learningPathId = searchParams.get("learningPathId") || undefined;
    if (!learningPathId) return null;

    const assessmentTypeParam = searchParams.get("assessmentType");
    const assessmentType: LearningPathV2AssessmentType =
      assessmentTypeParam === "full_test" ? "full_test" : "mini_test";

    return {
      learningPathId,
      testId: testId || undefined,
      assessmentType,
    };
  };

  const buildLessonReturnUrl = (returnInfo: LearningPathAssessmentReturn): string => {
    const params = new URLSearchParams();
    if (returnInfo.dayId) params.set("day", String(returnInfo.dayId));
    if (returnInfo.week) params.set("week", String(returnInfo.week));
    if (returnInfo.learningPathId) {
      params.set("learningPathId", returnInfo.learningPathId);
    }

    return `/lesson?${params.toString()}`;
  };

  const submitPreparedAnswers = async (preparedAnswers: AnswerItem[]) => {
    if (!testId) {
      console.warn("Thiếu testId để nộp bài");
      return;
    }

    setIsSubmitted(true);

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

    let submitType: UserTestSubmitType | undefined;
    if (isDemoTest) {
      submitType = "initial_assessment";
    }

    try {
      let result: {
        score: number;
        answers: any[];
      } = { score: 0, answers: [] };
      if (fromLesson) {
        // Mark LessonPage to open the LearningPath v2 assessment animation.
        try {
          localStorage.setItem("learning_path_assessment_show", "true");
        } catch (e) {
          console.warn("Không lưu được learning_path_assessment_show", e);
        }

        const assessmentReturn = getLearningPathAssessmentReturn();
        const learningPathId = assessmentReturn?.learningPathId;
        if (!learningPathId) {
          console.error("Thiếu learningPathId để nộp LearningPath v2 assessment.");
          dispatchLocal({ type: "CLOSE_SUBMIT" });
          setIsSubmitted(false);
          return;
        }

        const dayStudyId = assessmentReturn.dayStudyId ?? assessmentReturn.dayId;
        const assessmentType =
          assessmentReturn.assessmentType ?? ("mini_test" as LearningPathV2AssessmentType);

        (async () => {
          try {

            const response = await learningPathV2Service.submitAssessment(
              learningPathId,
              {
                test_id: testId,
                answers: answersMap,
                duration: elapsed,
                assessment_type: assessmentType,
                week_study_id: assessmentReturn.weekStudyId,
                day_study_id: dayStudyId,
                ...(assessmentType === "mini_test" && mockScenarioOverride
                  ? { debug_scenario_override: mockScenarioOverride }
                  : {}),
              }
            );

            result = {
              score: response.data?.score ?? 0,
              answers: response.data?.detailedAnswers ?? [],
            };
          } catch (e) {
            console.error("learning path assessment submit failed", e);
          }
        })();
      } else {
        result = await testService.submitTest(
          userId === "guest",
          testId,
          userId,
          answersMap,
          elapsed,
          completedPart,
          submitType,
        );
      }
      console.log("Chi tiết từng câu:", result.answers);
      console.log("số điểm đạt được:", result.score);
      setAnswerTest({
        score: result.score,
        answers: result.answers.map((answer, index) => ({
          ...answer,
          question_no: index + 1,
        })),
      });
      // Nếu là mini test bắt nguồn từ Lesson (fromLesson=true), không hiện modal kết quả,
      // thay vào đó điều hướng ngay về LessonPage để hiển thị kết quả trong context của lộ trình học.
      if (fromLesson) {
        const returnInfo = localStorage.getItem("learning_path_assessment_return");
        try {
          if (returnInfo) {
            navigate(buildLessonReturnUrl(JSON.parse(returnInfo)));
          } else {
            navigate("/home");
          }
        } catch (e) {
          console.warn("Error navigating back to lesson after mini_test", e);
          navigate("/home");
        }
        return; // skip opening the modal
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

  const buildMockCorrectSetByPart = (
    questionMetas: Array<{ questionNumber: number; part: number }>,
    correctCountByPart: Map<number, number>,
  ): Set<number> => {
    const questionsByPart: Map<number, number[]> = new Map();

    questionMetas.forEach((meta) => {
      if (!questionsByPart.has(meta.part)) {
        questionsByPart.set(meta.part, []);
      }
      questionsByPart.get(meta.part)!.push(meta.questionNumber);
    });

    const correctQuestions: number[] = [];
    questionsByPart.forEach((questions, part) => {
      const targetCorrect = correctCountByPart.get(part) ?? 0;
      const shuffled = shuffleArray(questions);

      correctQuestions.push(...shuffled.slice(0, targetCorrect));
    });

    return new Set(correctQuestions);
  };

  const getQuestionCountsByPart = (): Map<number, number> => {
    const counts = new Map<number, number>();
    groups.forEach((group) => {
      const part = group.part ?? getPartFromQuestionNumber(group.questions[0]?.questionNumber ?? 1);
      counts.set(part, (counts.get(part) ?? 0) + group.questions.length);
    });
    return counts;
  };

  const openMockDialog = () => {
    if (!groups || groups.length === 0) {
      console.warn("Chưa có dữ liệu câu hỏi để cấu hình mock");
      return;
    }
    const nextPartAccuracies = Object.fromEntries(
      Array.from(getQuestionCountsByPart().keys()).map((part) => [part, mockAccuracy])
    );
    setPartAccuracies(nextPartAccuracies);
    setCustomPartAccuracy(false);
    setMockScenarioOverride(undefined);
    setIsMockDialogOpen(true);
  };

  const applyMockPreset = (
    accuracy: number,
    scenarioOverride?: "PLATEAU",
  ) => {
    setMockAccuracy(accuracy);
    setMockScenarioOverride(scenarioOverride);
    setPartAccuracies(
      Object.fromEntries(
        Array.from(getQuestionCountsByPart().keys()).map((part) => [part, accuracy])
      )
    );
  };

  const stopActiveMedia = () => {
    document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((media) => {
      media.pause();
    });
  };

  const handleMockSubmit = async () => {
    if (!groups || groups.length === 0 || !answers || answers.length === 0) {
      console.warn("Chưa có dữ liệu câu hỏi để nộp nhanh");
      return;
    }

    stopActiveMedia();

    // Build questionMetas với part từ group.part (không dùng questionNumber nữa)
    const questionMetas = groups.flatMap((group) =>
      group.questions.map((q) => {
        const questionNumber = q.questionNumber;
        const options = Object.keys(q.choices || {});
        // Lấy part từ group.part (mini test có sẵn), fallback dùng questionNumber cho full test
        const part = group.part ?? getPartFromQuestionNumber(questionNumber);
        return {
          questionNumber,
          part, // Thêm field part
          correctAnswer: q.correctAnswer,
          options,
        };
      })
    );

    if (questionMetas.length === 0) {
      console.warn("Không tìm thấy câu hỏi để nộp nhanh");
      return;
    }

    const metaMap = new Map<
      number,
      { correctAnswer: string; options: string[]; part: number }
    >();
    questionMetas.forEach((meta) => {
      metaMap.set(meta.questionNumber, {
        correctAnswer: meta.correctAnswer,
        options: meta.options,
        part: meta.part,
      });
    });

    const questionCountsByPart = getQuestionCountsByPart();
    const correctCountByPart = new Map<number, number>();
    questionCountsByPart.forEach((questionCount, part) => {
      const accuracy = customPartAccuracy
        ? (partAccuracies[part] ?? mockAccuracy)
        : mockAccuracy;
      correctCountByPart.set(part, Math.round((questionCount * accuracy) / 100));
    });

    const correctSet = buildMockCorrectSetByPart(questionMetas, correctCountByPart);
    console.log(
      "Mock assessment config:",
      {
        overallAccuracy: mockAccuracy,
        customPartAccuracy,
        partAccuracies,
        correctCountByPart: Object.fromEntries(correctCountByPart),
      }
    );

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
    setIsMockDialogOpen(false);
    await submitPreparedAnswers(autoFilledAnswers);
  };

  const isMockFullTest = !fromLesson || assessmentTypeParam === "full_test";
  const mockPresets: Array<{
    label: string;
    accuracy: number;
    scenarioOverride?: "PLATEAU";
  }> = isMockFullTest
    ? [
      { label: "Dưới mục tiêu", accuracy: 40 },
      { label: "Gần mục tiêu", accuracy: 60 },
      { label: "Kết quả cao", accuracy: 80 },
    ]
    : [
      { label: "Plateau", accuracy: 30, scenarioOverride: "PLATEAU" as const },
      { label: "Tiến bộ", accuracy: 85 },
      { label: "Kết quả cao", accuracy: 100 },
    ];

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
    if (userId === "guest") {
      navigate("/landing-page", { replace: true });
      return;
    }

    if (fromLesson) {
      const returnInfo = localStorage.getItem("learning_path_assessment_return");
      try {
        console.log("learning_path_assessment_return:", returnInfo);
      } catch (e) { }
      if (returnInfo) {
        // LessonPage is mounted at `/lesson` route
        navigate(buildLessonReturnUrl(JSON.parse(returnInfo)), { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    } else {
      navigate("/home", { replace: true });
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
        {!parts && import.meta.env.DEV && (
          <Button
            variant="outlined"
            color="primary"
            className="rounded-lg px-4 py-2 font-semibold"
            onClick={openMockDialog}
          >
            Nộp mock
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
        isEntry={isDemoTest}
        isGuest={userId === "guest"}
        open={state.scoreOpen}
        data={answerTest}
        onReviewDetails={(id) => navigate(`/tests/${testId}/result/${id}`, { replace: true })}
        onSuggestPlan={() => navigate(`/plan?score=${answerTest.score}`, { replace: true })}
        onClose={handleCloseScoreModal}
        testId={testId}
        practicedParts={parts ? parts.split(",").map(Number) : undefined}
      />
      <Dialog
        open={isMockDialogOpen}
        onClose={() => setIsMockDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Cấu hình nộp mock {isMockFullTest ? "Full Test" : "Mini Test"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Đáp án được sinh từ đúng đề đang hiển thị. Bạn có thể chọn preset hoặc điều chỉnh tỷ lệ câu đúng.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 3 }}>
            {mockPresets.map((preset) => (
              <Button
                key={preset.label}
                variant={mockAccuracy === preset.accuracy ? "contained" : "outlined"}
                onClick={() => applyMockPreset(preset.accuracy, preset.scenarioOverride)}
              >
                {preset.label} ({preset.accuracy}%)
              </Button>
            ))}
          </Stack>
          <Typography fontWeight={700}>Tỷ lệ đúng tổng: {mockAccuracy}%</Typography>
          <Slider
            value={mockAccuracy}
            onChange={(_, value) => {
              const accuracy = value as number;
              setMockAccuracy(accuracy);
              setMockScenarioOverride(undefined);
              if (!customPartAccuracy) applyMockPreset(accuracy);
            }}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            step={5}
          />
          <FormControlLabel
            control={
              <Switch
                checked={customPartAccuracy}
                onChange={(event) => {
                  setCustomPartAccuracy(event.target.checked);
                  setMockScenarioOverride(undefined);
                }}
              />
            }
            label="Tùy chỉnh tỷ lệ đúng theo từng Part"
          />
          {customPartAccuracy && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {Array.from(getQuestionCountsByPart().entries()).map(([part, questionCount]) => (
                <Box key={part}>
                  <Typography variant="body2" fontWeight={600}>
                    Part {part} · {questionCount} câu · {partAccuracies[part] ?? mockAccuracy}% đúng
                  </Typography>
                  <Slider
                    value={partAccuracies[part] ?? mockAccuracy}
                    onChange={(_, value) =>
                      setPartAccuracies((current) => ({ ...current, [part]: value as number }))
                    }
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                    step={5}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsMockDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleMockSubmit}>Tạo đáp án và nộp</Button>
        </DialogActions>
      </Dialog>
    </header>
  );
};

export default TestHeader;
