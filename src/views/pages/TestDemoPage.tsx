import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExamById } from "../../stores/examSlice";
import { AppDispatch, RootState } from "../../stores/store";
import TestHeader from "../../components/testDemo/TestHeader";
import RightSidebar from "../../components/testDemo/RightSidebar";
import { AnimatePresence } from "framer-motion";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import ExamContainer from "../../components/testDemo/ExamContainer";
import { setInitialAnswers } from "../../stores/answerSlice";
import { ExamGroup, ExamQuestion } from "../../types/Exam";
import { useNavigate } from "react-router-dom";
import F5Modal from "../../components/modals/F5Modal";

const steps: Step[] = [
  {
    target: '[data-tour-id="time-counter"]',
    content: "Đây là đồng hồ thời gian, hãy chú ý thời gian làm bài.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="submit-button"]',
    content: "Nhấn nút này để nộp bài khi hoàn thành.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="sidebar-toggle"]',
    content: "Nhấn vào đây để xem danh sách câu hỏi bên phải.",
    placement: "bottom",
    disableBeacon: true,
  },
];

const TestDemoPage: FC = () => {
  const navigate = useNavigate();
  const [isShowSideBar, setIsShowSideBar] = useState<boolean>(false);
  const [_, setStepIndex] = useState<number>(0);
  const [isTourRunning, setIsTourRunning] = useState<boolean>(true);
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    // Khi tour kết thúc hoặc bị skip
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setStepIndex(0); // reset tour
      setIsTourRunning(false);
    }
  };

  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector((s: RootState) => s.exam.groups);
  useEffect(() => {
    dispatch(fetchExamById("68af851b1918226d4c424e7f"))
  }, [dispatch]);
  useEffect(() => {
    if (groups.length > 0) {
      const initialAnswers = groups.flatMap((g: ExamGroup) =>
        g.questions.map((q: ExamQuestion) => ({
          _id: q._id,
          question: Number(q.name.replace(/^Question\s*/, "")),
          answer: "",
          isFlagged: false,
        }))
      );
      dispatch(setInitialAnswers(initialAnswers));
    }
  }, [groups, dispatch]);
  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50 overflow-hidden">
      {/* Tour */}
      <Joyride
        steps={steps}
        run={isTourRunning}
        continuous
        showSkipButton
        scrollToFirstStep={false}
        disableScrolling={true}
        callback={handleJoyrideCallback}
      />

      {/* Header */}
      <TestHeader
        setIsShowSideBar={setIsShowSideBar}
        isTourRunning={isTourRunning}
      />

      {/* Main layout */}
      <div className="flex flex-1 max-h-[calc(100vh-100px)] relative">
        <main className="flex-1 p-3 flex">
          <ExamContainer />
        </main>

        <AnimatePresence>
          {isShowSideBar && <RightSidebar isShow={isShowSideBar} />}
        </AnimatePresence>
      </div>

      {/* Modal khi ấn reload */}
      <F5Modal onConfirm={() => navigate('/home')}/>

    </div>
  );
};

export default TestDemoPage;
