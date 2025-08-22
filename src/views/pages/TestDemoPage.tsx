import { FC, useState } from 'react';
import TestHeader from '../../components/testDemo/TestHeader';
import RightSidebar from '../../components/testDemo/RightSidebar';
import QuestionContent from '../../components/testDemo/QuestionContent';
import { AnimatePresence } from 'framer-motion';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

const steps: Step[] = [
  {
    target: '[data-tour-id="time-counter"]',
    content: 'Đây là đồng hồ thời gian, hãy chú ý thời gian làm bài.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="submit-button"]',
    content: 'Nhấn nút này để nộp bài khi hoàn thành.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour-id="sidebar-toggle"]',
    content: 'Nhấn vào đây để xem danh sách câu hỏi bên phải.',
    placement: 'bottom',
    disableBeacon: true,
  },
];

const TestDemoPage: FC = () => {
  const [isShowSideBar, setIsShowSideBar] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isTourRunning, setIsTourRunning] = useState<boolean>(true);
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    // Khi tour kết thúc hoặc bị skip
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setStepIndex(0); // reset tour
      setIsTourRunning(false);
    }
  };

  return (
    <div className='relative flex flex-col min-h-screen bg-gray-50 overflow-hidden'>
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
      <div className='flex flex-1 max-h-[calc(100vh-100px)] relative'>
        <main className='flex-1 p-3 flex'>
          <QuestionContent />
        </main>

        <AnimatePresence>
          {isShowSideBar && <RightSidebar isShow={isShowSideBar} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TestDemoPage;
