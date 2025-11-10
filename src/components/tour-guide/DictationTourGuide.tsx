import React, { useEffect, useState } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface DictationTourGuideProps {
  isRun?: boolean;
}

const DictationTourGuide: React.FC<DictationTourGuideProps> = ({ isRun = true }) => {

  const [run, setRun] = useState<boolean>(isRun);
  useEffect(() => {
    setRun(isRun);
  }, [isRun]);
  const steps: Step[] = [
    {
      target: ".dictation-header",
      title: "Giới thiệu bài luyện nghe",
      content:
        "Đây là tiêu đề và cấp độ của bài nghe chép chính tả. Mỗi bài gồm nhiều câu để bạn luyện từng bước.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".dictation-audio",
      title: "Điều khiển nghe",
      content: "Nhấn Play để nghe câu hiện tại, Replay để nghe lại. Có thể đổi tốc độ ở đây.",
      placement: "bottom",
    },
    {
      target: ".dictation-difficulty",
      title: "Chọn độ khó",
      content: "Có ba chế độ: Dễ, Trung bình và Khó. Càng khó, bạn càng phải điền nhiều từ hơn.",
      placement: "bottom",
    },
    {
      target: ".dictation-sentence",
      title: "Làm bài chép chính tả",
      content:
        "Nghe kỹ câu và điền vào chỗ trống. Khi hoàn tất, nhấn 'Kiểm tra' để xem kết quả.",
      placement: "top",
    },
    {
      target: ".dictation-progress",
      title: "Tiến độ học",
      content: "Theo dõi số câu bạn đã hoàn thành và phần trăm tiến độ ở đây.",
      placement: "left",
    },
    {
      target: ".dictation-check",
      title: "Kiểm tra & Hoàn thành",
      content:
        "Sau khi kiểm tra, bạn sẽ thấy đáp án gốc và có thể phân tích kết quả với AI.",
      placement: "top",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      localStorage.setItem("dictation_tour_seen", "true");
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      disableScrolling
      scrollToFirstStep={false}
      showProgress
      callback={handleJoyrideCallback}
    />
  );
};

export default DictationTourGuide;
