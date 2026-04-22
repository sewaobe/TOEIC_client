import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExamById } from "../../stores/examSlice";
import { AppDispatch, RootState } from "../../stores/store";
import TestHeader from "../../components/testDemo/TestHeader";
import RightSidebar from "../../components/testDemo/RightSidebar";
import { AnimatePresence } from "framer-motion";
import Joyride, { Step, STATUS } from "react-joyride";
import ExamContainer from "../../components/testDemo/ExamContainer";
import { setInitialAnswers } from "../../stores/answerSlice";
import { ExamGroup, ExamQuestion } from "../../types/Exam";
import { useNavigate, useSearchParams } from "react-router-dom";
import F5Modal from "../../components/modals/F5Modal";
import AssessmentModal from "../../components/modals/AssessmentModal";

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
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  const partsQuery = searchParams.get("parts"); // ví dụ "1,2"
  const parts = partsQuery ? partsQuery.split(",").map(Number) : undefined;
  const fromLesson = searchParams.get("fromLesson") === "true";

  const navigate = useNavigate();
  const [isShowSideBar, setIsShowSideBar] = useState<boolean>(false);
  const [_, setStepIndex] = useState<number>(0);
  const [isTourRunning, setIsTourRunning] = useState<boolean>(true);
  const [isPlanReady, setIsPlanReady] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const groups = useSelector((s: RootState) => s.exam.groups);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = () => setIsModalOpen(true);
  const handleClose = () => setIsModalOpen(false);

  // fetch test khi vào page
  useEffect(() => {
    if (!testId) return;
    dispatch(fetchExamById({ testId, parts })); // luôn dùng object
  }, [dispatch]);

  // set initial answers khi groups thay đổi
  useEffect(() => {
    if (groups && groups.length > 0) {
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

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setStepIndex(0);
      setIsTourRunning(false);
    }
  };
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
        fromLesson={fromLesson}
        openModal={handleOpen}
        onPlanReady={() => setIsPlanReady(true)}
        setIsSubmitted={setIsSubmitted}
        isSubmitted={isSubmitted}
      />

      {/* Main layout */}
      <div className="flex flex-1 max-h-[calc(100vh-70px)] relative">
        <main className="flex-1 p-3 flex">
          <ExamContainer isSubmitted={isSubmitted} />
        </main>

        <AnimatePresence>
          {isShowSideBar && <RightSidebar isShow={isShowSideBar} />}
        </AnimatePresence>
      </div>

      {/* Modal khi ấn reload */}
      <F5Modal onConfirm={() => navigate("/home")} />

      <AssessmentModal
        open={isModalOpen}
        onClose={handleClose}
      />
    </div>
  );
};

export default TestDemoPage;
