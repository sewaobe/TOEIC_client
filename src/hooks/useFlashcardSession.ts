import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { EvalType } from "../components/flashCardItem/EvaluationSection";
import { FlashcardItem } from "../components/modals/CreateFlashcardItemModal";
import { flashCardProgressService } from "../services/flashcard_progress.service";
// import { lessonFlashcardService } from "../services/lesson_flashcard.service"; // sẽ dùng cho dayId sau

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
    dayId?: string;       // nếu có → bài học
    activityId?: string;  // hoạt động trong bài học
    withWeight?: boolean;
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
    const [isFinished, setIsFinished] = useState(false);

    // 🔹 1. Khởi tạo queue + tạo session
    useEffect(() => {
        if (!vocabularies.length) return;

        let sorted = [...vocabularies];
        sorted = withWeight
            ? sorted.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
            : sorted.sort(() => Math.random() - 0.5);

        setQueue(sorted);
        setInitialTotal(sorted.length);
        setCurrent(sorted[0]);
        setLogs([]);
        setStartTime(Date.now());

        // ⚡ PHÂN NHÁNH: luyện tập hay bài học
        const orderIds = sorted.map((v) => v._id ?? v.word);
        if (!dayId) {
            // ✅ Luyện tập cá nhân
            flashCardProgressService
                .startSession(topicId, orderIds)
                .then((res) => {
                    localStorage.setItem("flashcard_session_id", res.sessionId);
                })
                .catch((err) => {
                    toast.error("Lỗi khởi tạo phiên học: " + err.message);
                });
        } else {
            // 🔸 Bài học (lesson) – để implement sau
            console.log("Lesson mode – chưa implement, dayId:", dayId, "activityId:", activityId);
            // example:
            // lessonFlashcardService.startLessonSession(dayId, activityId, orderIds)
        }
    }, [vocabularies, withWeight]);

    // 🔹 2. Đánh giá từ vựng (FE logic giữ nguyên)
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
            // skip => remove luôn

            setQueue(newQueue);
            setCurrent(newQueue[0] ?? null);
            setStartTime(Date.now());
        },
        [queue, current, startTime]
    );

    // 🔹 3. Tính toán Attempt hiện tại
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

    // 🔹 4. Autosave (practice only)
    useEffect(() => {
        const sessionId = localStorage.getItem("flashcard_session_id");
        if (!sessionId || logs.length === 0 || dayId || isFinished) return;

        let lastSavedCount = 0;

        const interval = setInterval(() => {
            if (isFinished) {
                clearInterval(interval);
                return;
            }
            if (logs.length > lastSavedCount) { // ✅ chỉ khi có log mới
                flashCardProgressService
                    .updateSession(
                        sessionId,
                        queue
                            .map((v) => v._id ?? v.word)
                            .filter((id): id is string => typeof id === "string"),
                        0,
                        logs
                    )
                    .then(() => {
                        lastSavedCount = logs.length; // ✅ cập nhật mốc sau khi lưu thành công
                        console.log(`[Autosave] Cập nhật ${logs.length} logs`);
                    })
                    .catch(() => console.warn("Autosave thất bại"));
            }
        }, 10000);

        const handleBeforeUnload = () => {
            if (logs.length === 0 || isFinished) return;
            const data = JSON.stringify({
                session_id: sessionId,
                order_queue: queue
                    .map((q) => q._id ?? q.word)
                    .filter((id): id is string => typeof id === "string"),
                current_index: 0,
                logs_delta: logs,
            });
            navigator.sendBeacon(
                `${import.meta.env.VITE_API_URL}/flashcard-progress/update`,
                data
            );
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            clearInterval(interval);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [queue, logs, dayId, isFinished]);

    // 🔹 5. Khi học xong → finalize
    useEffect(() => {
        if (!current && logs.length > 0 && currentAttempt) {
            onFinish?.();
            const sessionId = localStorage.getItem("flashcard_session_id");
            setIsFinished(true);
            // ⚡ PHÂN NHÁNH
            if (!dayId) {
                // ✅ luyện tập
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
                            return "Lưu thành công!";
                        },
                        error: "Lưu thất bại!",
                    }
                );
            } else {
                // 🔸 Bài học – sẽ xử lý sau
                console.log("Finalize lesson session – dayId:", dayId);
                // example:
                // lessonFlashcardService.finalizeLesson(dayId, activityId, currentAttempt)
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
