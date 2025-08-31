import React, { FC, useEffect, useState } from "react";
import { Button, useTheme } from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import { useCountdown } from "../../hooks/useCountDown";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import testService from "./../../services/test.service";
import ScoreModal from "../modals/ScoreModal";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../modals/ConfirmModal";

interface TestHeaderProps {
  setIsShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  isTourRunning: boolean;
}
const TestHeader: FC<TestHeaderProps> = ({
  setIsShowSideBar,
  isTourRunning,
}) => {
  const [submitOpen, setSubmitOpen] = useState<boolean>(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const { timeLeft, formatTime } = useCountdown(7200, isTourRunning);
  const answers = useSelector((state: RootState) => state.answer.answers);

  const answeredCount = answers.filter((a) => a.answer !== "").length;
  const userId = useSelector((state: RootState) => state.user.user!._id);
  const testId = useSelector((state: RootState) => state.exam.currentTestId);
  const handleSubmit = async () => {
    const answersMap = answers.map((a) => ({
      question_id: a._id, // hoặc a.question_id nếu bạn lưu sẵn
      selectedOption: a.answer,
    }));
    try {
      const result = await testService.submitTest(testId, userId, answersMap);
      console.log("Chi tiết từng câu:", result.answers);
      console.log("số điểm đạt được:", result.score);
      setScore(result.score);
      setSubmitOpen(false);
      setScoreOpen(true);
    } catch (err) {
      console.error("Submit test failed", err);
      setSubmitOpen(false);
    }
  };
  useEffect(() => {
    if (timeLeft === 0) {
      console.log("Hết giờ làm bài");
    }
  }, [timeLeft]);

  const handleCloseScoreModal = () => {
    setScoreOpen(false);
    navigate('/home');
  }
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
      <div className="flex items-center gap-6" >
        <Button
          data-tour-id="submit-button"
          variant="contained"
          color="secondary"
          className="rounded-lg px-4 py-2 font-semibold"
          onClick={() => setSubmitOpen(true)}
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
        open={submitOpen}
        message="Bạn có chắc chắn muốn nộp bài không?"
        onConfirm={handleSubmit}
        onCancel={() => setSubmitOpen(false)}
      />

      <ScoreModal
        open={scoreOpen}
        score={score}
        onClose={handleCloseScoreModal}
      />

    </header>

  );
};

export default TestHeader;
