import { FC, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Flashcard, { Word } from "../../flashCardItem/FlashCard";
import SpeechOptions from "../../flashCardItem/SpeechOptions";
import EvaluationSection, { EvalType } from "../../flashCardItem/EvaluationSection";
import { StatisticsModal, Log } from "../../flashCardItem/StatisticsModal";
import { toast } from "sonner";
import { flashCardService } from "../../../services/flashCard.service";
import { FlashcardHistoryModal } from "../../flashCardItem/FlashCardHistory";
import F5Modal from "../../modals/F5Modal";
import { useNavigate } from "react-router-dom";

interface LessonFlashcardProps {
    vocabularies: Word[];
    topicId: string;
    activityId: string;
    dayId: string;
    onFinish: () => void
}

type Attempt = {
    _id: string;
    started_at: string;
    finished_at: string;
    accuracy: number; // %
    avg_time: number; // seconds
    total: number;
    logs: Log[];
};

export const LessonFlashcard: FC<LessonFlashcardProps> = ({
    vocabularies,
    topicId,
    activityId,
    dayId,
    onFinish }) => {
    const [queue, setQueue] = useState<Word[]>([]);
    const [current, setCurrent] = useState<Word | null>(null);
    const [voice, setVoice] = useState<"US" | "UK">("US");

    // Modal / overlay states
    const [showFinished, setShowFinished] = useState(false); // hiển thị FinishedFlashCard
    const [openStats, setOpenStats] = useState(false);     // StatisticModal (session hiện tại)
    const [openHistory, setOpenHistory] = useState(false); // FlashcardHistory

    // Logs cho session hiện tại
    const [logs, setLogs] = useState<Log[]>([]);
    const [startTime, setStartTime] = useState<number>(Date.now());

    const navigate = useNavigate();

    // Khi hết queue → show FinishedFlashCard trước, rồi mở StatisticModal sau
    useEffect(() => {
        if (!current && logs.length > 0) {
            setShowFinished(true); // hiển thị card trước
            onFinish();
            // gọi API + toast loading
            toast.promise(
                (async () => {
                    console.log("Logs ", logs)
                    console.log("Topic Id", topicId)
                    console.log("Attempt", currentAttempt);
                    if (!currentAttempt) throw new Error("Không có dữ liệu attempt");

                    await flashCardService.submitAttemptFlashCard(
                        topicId,
                        currentAttempt.total,
                        currentAttempt.accuracy,
                        currentAttempt.started_at,
                        currentAttempt.finished_at,
                        currentAttempt.logs,
                        dayId,
                        activityId
                    )
                })(),
                {
                    loading: "Đang lưu trong hệ thống...",
                    success: () => {
                        setOpenStats(true); // mở modal sau khi API thành công
                        return "Lưu thành công!";
                    },
                    error: "Lưu thất bại!",
                }
            );
        }
    }, [current, logs.length]);

    // Khởi tạo queue sort theo weight
    useEffect(() => {
        if (vocabularies.length) {
            const sorted = [...vocabularies].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
            setQueue(sorted);
            setCurrent(sorted[0]);
            setStartTime(Date.now());
            setLogs([]); // reset logs cho session mới
        }
    }, [vocabularies]);

    // Đọc từ khi current/voice thay đổi
    useEffect(() => {
        if (current) {
            const utterance = new SpeechSynthesisUtterance(current.word);
            utterance.lang = voice === "US" ? "en-US" : "en-GB";
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
            setStartTime(Date.now());
        }
    }, [current, voice]);

    // Xử lý đánh giá
    const handleEvaluate = (type: EvalType) => {
        if (!current) return;
        const endTime = Date.now();
        const duration = endTime - startTime;

        const newLog: Log = {
            vocab_id: current._id ?? current.word,
            vocab_word: current.word,
            eval_type: type,
            response_time: duration,
            attempted_at: new Date().toISOString(),
        };
        setLogs((prev) => [...prev, newLog]);

        // xử lý queue
        const newQueue = [...queue];
        newQueue.shift();

        if (type === "easy") {
            newQueue.push(current);
        } else if (type === "medium") {
            const pos = Math.min(newQueue.length, 5 + Math.floor(Math.random() * 6));
            newQueue.splice(pos, 0, current);
        } else if (type === "hard") {
            const pos = Math.min(newQueue.length, 1 + Math.floor(Math.random() * 3));
            newQueue.splice(pos, 0, current);
        }
        // skip → không thêm lại

        setQueue(newQueue);
        setCurrent(newQueue[0] ?? null);
    };

    // Tính summary cho session hiện tại để đẩy vào Attempt
    const currentAttempt: Attempt | null = useMemo(() => {
        if (logs.length === 0) return null;
        const started_at = logs[0].attempted_at;
        const finished_at = logs[logs.length - 1].attempted_at;
        const total = logs.length;

        const easy = logs.filter((l) => l.eval_type === "easy").length;
        const medium = logs.filter((l) => l.eval_type === "medium").length;
        const hard = logs.filter((l) => l.eval_type === "hard").length;
        const skip = logs.filter((l) => l.eval_type === "skip").length;

        const avg_time = Math.round(
            logs.reduce((a, b) => a + b.response_time, 0) / total / 1000
        );

        const accuracy = Math.round(
            ((skip * 1 + easy * 0.9 + medium * 0.6 + hard * 0.3) / total) * 100
        );

        return {
            _id: `attempt-${Date.now()}`,
            started_at,
            finished_at,
            accuracy,
            avg_time,
            total,
            logs,
        };
    }, [logs]);

    // Case: còn từ → UI học
    if (current) {
        return (
            <div className="w-2/3 max-w-3xl mx-auto p-4 relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.word}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="relative">
                            <Flashcard word={current} voice={voice} />
                            <SpeechOptions voice={voice} setVoice={setVoice} />
                        </div>
                        <EvaluationSection onNext={(type: EvalType) => handleEvaluate(type)} />
                    </motion.div>
                </AnimatePresence>
                {/* Modal khi ấn reload */}
                <F5Modal
                    title="Cảnh báo rời khỏi bài học"
                    content="Bạn có chắc chắn muốn rời khỏi trang không? Mọi dữ liệu chưa lưu có thể bị mất."
                    onConfirm={() => navigate("/home")} />
            </div>
        );
    }

    // Case: hết từ → theo flow bạn yêu cầu
    return (
        <>
            {/* 1) Vừa hoàn thành → mở FinishedFlashCard và StatisticModal của session hiện tại */}
            {/* <AnimatePresence>
                {showFinished && (
                    <motion.div
                        key="finished"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <FinishedFlashCard
                            onStats={() => setOpenHistory(true)}
                            onRetry={() => {
                                const sorted = [...vocabularies].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
                                setQueue(sorted);
                                setCurrent(sorted[0] ?? null);
                                setStartTime(Date.now());
                                setLogs([]);
                                setShowFinished(false);
                                setOpenStats(false);
                            }}
                            onNext={() => console.log("Đi tới bài tiếp theo")}
                        />
                    </motion.div>
                )}
            </AnimatePresence> */}

            {openStats && currentAttempt && (
                <StatisticsModal
                    open={openStats}
                    onClose={() => setOpenStats(false)}
                    logs={currentAttempt.logs}
                />
            )}

            {/* 2) FlashcardHistory (accordion theo ngày) */}
            {openHistory && (
                <FlashcardHistoryModal
                    open={openHistory}
                    onClose={() => setOpenHistory(false)}
                    topicId={topicId}
                />
            )}
        </>
    );
};
