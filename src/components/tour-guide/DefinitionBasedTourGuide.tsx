import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface DefinitionBasedTourGuideProps {
    isRun?: boolean;
}

export const DefinitionBasedTourGuide = ({ isRun = true }: DefinitionBasedTourGuideProps) => {
    const [run, setRun] = useState<boolean>(isRun);

    useEffect(() => {
        setRun(isRun);
    }, [isRun]);


    const steps: Step[] = [
        {
            target: '[data-tour="header-banner"]',
            title: "Chào mừng bạn!",
            content: "Đây là khu vực tiêu đề hiển thị tiến độ tổng thể và mục tiêu luyện tập.",
            disableBeacon: true,
            placement: "bottom",
        },
        {
            target: '[data-tour="word-section"]',
            title: "Từ vựng & phát âm",
            content: "Bạn sẽ luyện tập định nghĩa bằng cách diễn giải lại nghĩa của từ này theo cách hiểu của mình.",
            placement: "right",
        },
        {
            target: '[data-tour="definition-input"]',
            title: "Nhập định nghĩa của bạn",
            content: "Hãy mô tả ý nghĩa của từ theo cách bạn hiểu. Đừng lo đúng – sai, quan trọng là phải thử!",
            placement: "top",
        },
        {
            target: '[data-tour="check-button"]',
            title: "Nhấn để kiểm tra",
            content: "Sau khi nhập xong, nhấn vào đây để xem phản hồi và độ chính xác.",
            placement: "left",
        },
        {
            target: '[data-tour="prev-button"]',
            title: "Quay lại câu trước",
            content: "Bạn có thể xem lại các từ vựng đã làm trước đó.",
            placement: "top",
        },
        {
            target: '[data-tour="next-button"]',
            title: "Tới từ tiếp theo",
            content: "Khi đã đạt đủ độ chính xác, bạn có thể chuyển sang từ tiếp theo.",
            placement: "top",
        },
        {
            target: '[data-tour="attempt-list"]',
            title: "Tiến trình luyện tập",
            content: "Danh sách bên phải giúp bạn theo dõi lại tất cả câu trả lời và độ chính xác từng từ.",
            placement: "left",
        },
        {
            target: '[data-tour="definition-input"]',
            title: "Sẵn sàng bắt đầu!",
            content: "Giờ bạn có thể luyện tập đầy đủ các tính năng rồi. Chúc bạn học tốt!",
            placement: "center",
        },
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
            localStorage.setItem("definition_based_tour_seen", "true");
            setRun(false);
        }
    };

    return (
        <Joyride
            run={run}
            steps={steps}
            continuous
            scrollToFirstStep
            showProgress
            showSkipButton
            disableScrolling
            callback={handleJoyrideCallback}
        />
    );
};
