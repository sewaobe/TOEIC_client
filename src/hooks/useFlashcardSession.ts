import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { flashCardService } from "../services/flashCard.service";
import { EvalType } from "../components/flashCardItem/EvaluationSection";
import { FlashcardItem } from "../components/modals/CreateFlashcardItemModal";

export interface Log {
    vocab_id: string;
    vocab_word: string;
    eval_type: EvalType;
    response_time: number;
    attempted_at: string;
}

export interface Attempt {
    _id: string;
    started_at: string;
    finished_at: string;
    accuracy: number;
    avg_time: number;
    total: number;
    logs: Log[];
}

interface UseFlashcardSessionProps {
    vocabularies: FlashcardItem[];
    topicId: string;
    dayId?: string;
    activityId?: string;
    withWeight?: boolean; // true: sắp theo weight, false: random
    onFinish?: () => void;
}

export const useFlashcardSession = ({
    vocabularies,
    topicId,
    dayId,
    activityId,
    withWeight = false,
    onFinish,
}: UseFlashcardSessionProps) => {
    const [queue, setQueue] = useState<FlashcardItem[]>([]);
    const [current, setCurrent] = useState<FlashcardItem | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [openStats, setOpenStats] = useState(false);
    const [initialTotal, setInitialTotal] = useState(0);

    // 🔹 Khởi tạo queue
    useEffect(() => {
        if (!vocabularies.length) return;
        let sorted = [...vocabularies];
        if (withWeight) {
            sorted = sorted.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
        } else {
            // random cho ôn luyện cá nhân
            sorted = sorted.sort(() => Math.random() - 0.5);
        }
        setQueue(sorted);
        setInitialTotal(sorted.length);
        setCurrent(sorted[0]);
        setLogs([]);
        setStartTime(Date.now());
    }, [vocabularies, withWeight]);

    // 🔹 Xử lý khi đánh giá
    const handleEvaluate = useCallback(
        (type: EvalType) => {
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
            // skip => không thêm lại

            setQueue(newQueue);
            setCurrent(newQueue[0] ?? null);
            setStartTime(Date.now());
        },
        [queue, current, startTime]
    );

    // 🔹 Tính toán Attempt hiện tại
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

    // 🔹 Khi hết từ => submit tự động
    useEffect(() => {
        if (!current && logs.length > 0 && currentAttempt) {
            onFinish?.();
            console.log("Hoàn thành luyện tập cá nhân!", currentAttempt);
            // toast.promise(
            //     flashCardService.submitAttemptFlashCard(
            //         topicId,
            //         currentAttempt.total,
            //         currentAttempt.accuracy,
            //         currentAttempt.started_at,
            //         currentAttempt.finished_at,
            //         currentAttempt.logs,
            //         dayId,
            //         activityId
            //     ),
            //     {
            //         loading: "Đang lưu kết quả...",
            //         success: () => {
            //             setOpenStats(true);
            //             return "Lưu thành công!";
            //         },
            //         error: "Lưu thất bại!",
            //     }
            // );
        }
    }, [current, logs, currentAttempt]);

    return {
        queue,
        current,
        logs,
        currentAttempt,
        openStats,
        setOpenStats,
        handleEvaluate, 
        initialTotal,             // tổng số từ ngay lúc bắt đầu
        remaining: queue.length,  // số từ còn lại trong queue
    };
};
