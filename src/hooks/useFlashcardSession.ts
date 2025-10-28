import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { EvalType } from "../components/flashCardItem/EvaluationSection";
import { FlashcardItem } from "../components/modals/CreateFlashcardItemModal";
import { flashCardProgressService } from "../services/flashcard_progress.service";
// import { lessonFlashcardService } from "../services/lesson_flashcard.service"; // (future)

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
    resumeSessionId?: string; // 🔄 nếu có → load lại session
    withWeight?: boolean;
    onFinish?: () => void;
}

export const useFlashcardSession = ({
    vocabularies,
    topicId,
    dayId,
    activityId,
    resumeSessionId,
    withWeight = false,
    onFinish,
}: UseFlashcardSessionProps) => {
    const [queue, setQueue] = useState<FlashcardItem[]>([]);
    const [current, setCurrent] = useState<FlashcardItem | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [openStats, setOpenStats] = useState(false);
    const [initialTotal, setInitialTotal] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // 🧩 1. Khởi tạo hoặc khôi phục session
    useEffect(() => {
        if (!vocabularies.length || isFinished) return; // chặn khi đã hoàn thành

        const initSession = async () => {
            try {
                // Nếu có session_id => resume
                if (resumeSessionId) {
                    const res = await flashCardProgressService.getSession(resumeSessionId);
                    const progress = res.progress;

                    // Map vocabularies theo id
                    const vocabMap = new Map(vocabularies.map((v) => [v._id ?? v.word, v]));

                    const orderedQueue = progress.order_queue
                        .map((id: string) => vocabMap.get(id))
                        .filter((v: FlashcardItem | undefined): v is FlashcardItem => !!v);

                    setQueue(orderedQueue);
                    setCurrent(orderedQueue[progress.current_index] ?? orderedQueue[0] ?? null);
                    setLogs(progress.logs ?? []);
                    setInitialTotal(orderedQueue.length);
                    setStartTime(Date.now());

                    localStorage.setItem("flashcard_session_id", progress.session_id);
                    toast.success("🔄 Đã khôi phục phiên học trước đó");
                } else {
                    // Nếu không có → tạo session mới
                    let sorted = [...vocabularies];
                    sorted = withWeight
                        ? sorted.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
                        : sorted.sort(() => Math.random() - 0.5);

                    setQueue(sorted);
                    setCurrent(sorted[0]);
                    setLogs([]);
                    setInitialTotal(sorted.length);
                    setStartTime(Date.now());

                    const orderIds = sorted.map((v) => v._id ?? v.word);

                    const res = await flashCardProgressService.startSession(topicId, orderIds);
                    localStorage.setItem("flashcard_session_id", res.sessionId);
                }
            } catch (err: any) {
                toast.error("❌ Lỗi khởi tạo phiên học: " + err.message);
            }
        };

        initSession();
    }, [vocabularies, withWeight, resumeSessionId]);

    // 🧩 2. Đánh giá từng từ
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

            if (type === "easy") newQueue.push(current);
            else if (type === "medium") {
                const pos = Math.min(newQueue.length, 5 + Math.floor(Math.random() * 6));
                newQueue.splice(pos, 0, current);
            } else if (type === "hard") {
                const pos = Math.min(newQueue.length, 1 + Math.floor(Math.random() * 3));
                newQueue.splice(pos, 0, current);
            }
            // skip → remove khỏi queue

            setQueue(newQueue);
            setCurrent(newQueue[0] ?? null);
            setStartTime(Date.now());
        },
        [queue, current, startTime]
    );

    // 🧩 3. Tính toán thông số attempt hiện tại
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

    // 🧩 4. Autosave định kỳ
    useEffect(() => {
        const sessionId = localStorage.getItem("flashcard_session_id");
        if (!sessionId || logs.length === 0 || dayId || isFinished) return;

        let lastSavedCount = 0;

        const interval = setInterval(() => {
            if (isFinished) {
                clearInterval(interval);
                return;
            }
            if (logs.length > lastSavedCount) {
                flashCardProgressService
                    .updateSession(
                        sessionId,
                        queue.map((v) => v._id ?? v.word).filter((id): id is string => !!id),
                        0,
                        logs
                    )
                    .then(() => {
                        lastSavedCount = logs.length;
                        console.log(`[Autosave] Đã cập nhật ${logs.length} logs`);
                    })
                    .catch(() => console.warn("⚠️ Autosave thất bại"));
            }
        }, 10000);

        const handleBeforeUnload = () => {
            if (logs.length === 0 || isFinished) return;
            const data = JSON.stringify({
                session_id: sessionId,
                order_queue: queue.map((q) => q._id ?? q.word).filter((id): id is string => !!id),
                current_index: 0,
                logs_delta: logs,
            });
            navigator.sendBeacon(`${import.meta.env.VITE_API_URL}/flashcard-progress/update`, data);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            clearInterval(interval);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [queue, logs, dayId, isFinished]);

    // 🧩 5. Kết thúc bài học
    useEffect(() => {
        if (!current && logs.length > 0 && currentAttempt) {
            onFinish?.();
            const sessionId = localStorage.getItem("flashcard_session_id");
            setIsFinished(true);

            if (!dayId) {
                // luyện tập cá nhân
                toast.promise(
                    flashCardProgressService.finalizeSession(
                        sessionId!,
                        currentAttempt.accuracy,
                        currentAttempt.avg_time,
                        currentAttempt.total,
                        currentAttempt.logs,
                        currentAttempt.started_at,
                        currentAttempt.finished_at
                    ),
                    {
                        loading: "Đang lưu kết quả...",
                        success: () => {
                            localStorage.removeItem("flashcard_session_id");
                            setOpenStats(true);
                            return "✅ Lưu thành công!";
                        },
                        error: "❌ Lưu thất bại!",
                    }
                );
            } else {
                console.log("Finalize lesson session – dayId:", dayId);
            }
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
        initialTotal,
        remaining: queue.length,
    };
};
