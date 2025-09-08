import React, { FC, useEffect, useReducer, useState } from "react";
import { Button, useTheme } from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import { useCountdown } from "../../hooks/useCountDown";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import testService from "./../../services/test.service";
import ScoreModal, { ResultPayload } from "../modals/ToeicQuickResultModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmModal from "../modals/ConfirmModal";
import ToeicQuickResultModal from "../modals/ToeicQuickResultModal";

interface TestHeaderProps {
  setIsShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  isTourRunning: boolean;
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
      return { ...state, scoreOpen: true, score: action.payload, submitOpen: false };
    case "CLOSE_SCORE":
      return { ...state, scoreOpen: false };
    default:
      return state;
  }
}

const TestHeader: FC<TestHeaderProps> = ({ setIsShowSideBar, isTourRunning }) => {
  const [state, dispatchLocal] = useReducer(reducer, initialState);
  const [answerTest, setAnswerTest] = useState<ResultPayload>({ score: 0, answers: [] });
  const navigate = useNavigate();
  const theme = useTheme();
  const answers = useSelector((state: RootState) => state.answer.answers);

  // 👇 Lấy query params trực tiếp
  const [searchParams] = useSearchParams();
  const timeLimitParam = searchParams.get("timeLimit"); // phút
  const parts = searchParams.get("parts"); // nếu có parts thì là practice
  const isDemoTest = searchParams.get("demo_test") === 'true';

  const duration = timeLimitParam
    ? parseInt(timeLimitParam, 10) * 60 // practice có giới hạn
    : parts
      ? Infinity // practice không giới hạn
      : 120 * 60; // full test mặc định 120 phút

  const { timeLeft, formatTime } = useCountdown(duration, isTourRunning);

  const answeredCount = answers.filter((a) => a.answer !== "").length;
  const userId = useSelector((state: RootState) => state.user.user!._id);
  const testId = useSelector((state: RootState) => state.exam.currentTestId);

  const [startTime] = useState(Date.now());

  const handleSubmit = async () => {
    const answersMap = answers.map((a) => ({
      question_id: a._id,
      selectedOption: a.answer,
    }));
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    // Xác định completedPart dựa trên logic mới
    let completedPart = "";
    if (isDemoTest) {
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
          question_no: index + 1
        }))
      });
      dispatchLocal({ type: "OPEN_SCORE", payload: result.score });
    } catch (err) {
      console.error("Submit test failed", err);
      dispatchLocal({ type: "CLOSE_SUBMIT" });
    }
  };

  useEffect(() => {
    if (timeLeft === 0) {
      console.log("Hết giờ làm bài");
    }
  }, [timeLeft]);

  const handleCloseScoreModal = () => {
    dispatchLocal({ type: "CLOSE_SCORE" });
    navigate("/home");
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
        Thời gian: {formatTime()}
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

        <span
          className="font-medium"
          style={{ color: theme.palette.text.secondary }}
        >
          Câu đã làm: {answeredCount}/200
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
        onReviewDetails={() => navigate(`/tests/${testId}/result/1`)}
        onSuggestPlan={() => navigate('/plan')}
        onClose={handleCloseScoreModal}
      />
    </header>
  );
};

export default TestHeader;