import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { FlashcardItem } from "../components/modals/CreateFlashcardItemModal";
import type {
    FlashcardAnswerResponse,
    FlashcardProgressResponse,
} from "../services/flashcard_progress.service";
import { flashCardProgressService } from "../services/flashcard_progress.service";
import type { FlashcardFeedbackAction } from "../types/flashcardFeedback";
import type {
    FlashcardCurrentOptionPreview,
    FlashcardCurrentPreview,
    FlashcardPreviewMetadata,
} from "../types/flashcardPreview";
import { buildCurrentFlashcardPreview } from "../utils/flashcardPreview.util";

export interface Log {
    vocab_id: string;
    vocab_word: string;
    action: FlashcardFeedbackAction;
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
    resumeSessionId?: string;
    withWeight?: boolean;
    onFinish?: () => void;
}

interface PendingAnswerFingerprint {
    vocabularyId: string;
    action: FlashcardFeedbackAction;
}

const createIdempotencyKey = (scope: string) =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `flashcard-${scope}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getErrorStatus = (error: unknown): number | undefined => {
    const maybeError = error as {
        response?: { status?: number };
        status?: number;
    };
    return maybeError.response?.status ?? maybeError.status;
};

const getErrorMessage = (error: unknown): string => {
    const maybeError = error as {
        response?: { data?: { message?: string } };
        message?: string;
    };
    return maybeError.response?.data?.message ?? maybeError.message ?? "Lỗi không xác định";
};

const isRetryableAnswerError = (error: unknown): boolean => {
    const status = getErrorStatus(error);
    return !status || status >= 500 || status === 408 || status === 429;
};

const hasSameFingerprint = (
    current: PendingAnswerFingerprint | null,
    next: PendingAnswerFingerprint
) =>
    current?.vocabularyId === next.vocabularyId && current?.action === next.action;

export const useFlashcardSession = ({
    vocabularies,
    topicId,
    dayId,
    activityId: _activityId,
    resumeSessionId,
    withWeight = false,
    onFinish,
}: UseFlashcardSessionProps) => {
    const [queue, setQueue] = useState<FlashcardItem[]>([]);
    const [current, setCurrent] = useState<FlashcardItem | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
    const [openStats, setOpenStats] = useState(false);
    const [initialTotal, setInitialTotal] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [previewMetadata, setPreviewMetadata] = useState<FlashcardPreviewMetadata | null>(null);
    const [isAnswerSubmitting, setIsAnswerSubmitting] = useState(false);
    const pendingStartIdempotencyKeyRef = useRef<string | null>(null);
    const pendingAnswerIdempotencyKeyRef = useRef<string | null>(null);
    const pendingAnswerFingerprintRef = useRef<PendingAnswerFingerprint | null>(null);
    const finalizeRequestedRef = useRef(false);
    const pendingAnswerPayloadRef = useRef<{
        vocabulary_id: string;
        action: FlashcardFeedbackAction;
        response_time: number;
        attempted_at: string;
    } | null>(null);

    const vocabMap = useMemo(
        () => new Map(vocabularies.map((v) => [v._id ?? v.word, v])),
        [vocabularies]
    );

    const rebuildQueueFromProgress = useCallback(
        (progress: FlashcardProgressResponse): FlashcardItem[] =>
            (progress.order_queue ?? [])
                .map((id: string) => vocabMap.get(id))
                .filter((v: FlashcardItem | undefined): v is FlashcardItem => !!v),
        [vocabMap]
    );

    const applyProgressQueue = useCallback(
        (progress: FlashcardProgressResponse) => {
            const orderedQueue = rebuildQueueFromProgress(progress);
            setQueue(orderedQueue);
            setCurrent(orderedQueue[0] ?? null);
            return orderedQueue;
        },
        [rebuildQueueFromProgress]
    );

    const mergePreviewMetadataPatch = useCallback((response: FlashcardAnswerResponse) => {
        const patchCards = response.preview_metadata_patch?.cards;
        if (!patchCards || Object.keys(patchCards).length === 0) {
            return;
        }

        setPreviewMetadata((prev) =>
            prev
                ? {
                    ...prev,
                    cards: {
                        ...prev.cards,
                        ...patchCards,
                    },
                }
                : prev
        );
    }, []);

    const getPendingStartIdempotencyKey = () => {
        if (!pendingStartIdempotencyKeyRef.current) {
            pendingStartIdempotencyKeyRef.current = createIdempotencyKey("start");
        }

        return pendingStartIdempotencyKeyRef.current;
    };

    const getPendingAnswerIdempotencyKey = (fingerprint: PendingAnswerFingerprint) => {
        const pendingFingerprint = pendingAnswerFingerprintRef.current;

        if (
            pendingAnswerIdempotencyKeyRef.current &&
            pendingFingerprint &&
            !hasSameFingerprint(pendingFingerprint, fingerprint)
        ) {
            pendingAnswerIdempotencyKeyRef.current = null;
            pendingAnswerFingerprintRef.current = null;
            pendingAnswerPayloadRef.current = null;
        }

        if (!pendingAnswerIdempotencyKeyRef.current) {
            pendingAnswerIdempotencyKeyRef.current = createIdempotencyKey("answer");
            pendingAnswerFingerprintRef.current = fingerprint;
        }

        return pendingAnswerIdempotencyKeyRef.current;
    };

    useEffect(() => {
        if (!vocabularies.length || isFinished) return;

        const initSession = async () => {
            try {
                if (resumeSessionId) {
                    const res = await flashCardProgressService.getSession(resumeSessionId);
                    const progress = res.progress;

                    setPreviewMetadata(res.preview_metadata ?? null);
                    const orderedQueue = applyProgressQueue(progress);
                    const restoredStartTime = Date.now();

                    setLogs((progress.logs ?? []) as Log[]);
                    setInitialTotal(orderedQueue.length);
                    setStartTime(restoredStartTime);
                    setSessionStartedAt(
                        progress.logs?.[0]?.attempted_at ?? new Date(restoredStartTime).toISOString()
                    );

                    localStorage.setItem("flashcard_session_id", progress.session_id);
                    toast.success("Đã khôi phục phiên học trước đó");
                    return;
                }

                let sorted = [...vocabularies];
                sorted = withWeight
                    ? sorted.sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
                    : sorted.sort(() => Math.random() - 0.5);

                setQueue(sorted);
                setCurrent(sorted[0] ?? null);
                setLogs([]);
                setInitialTotal(sorted.length);

                const sessionStartTime = Date.now();
                setStartTime(sessionStartTime);
                setSessionStartedAt(new Date(sessionStartTime).toISOString());

                const idempotencyKey = getPendingStartIdempotencyKey();
                const res = await flashCardProgressService.startSession(
                    topicId,
                    sorted.map((v) => v._id ?? v.word),
                    idempotencyKey
                );

                localStorage.setItem("flashcard_session_id", res.sessionId);
                setPreviewMetadata(res.preview_metadata ?? null);
                pendingStartIdempotencyKeyRef.current = null;
            } catch (err: unknown) {
                toast.error(`Lỗi khởi tạo phiên học: ${getErrorMessage(err)}`);
            }
        };

        initSession();
    }, [vocabularies, withWeight, resumeSessionId, isFinished, topicId, applyProgressQueue]);

    const handleEvaluate = useCallback(
        async (option: FlashcardCurrentOptionPreview) => {
            if (!current || isAnswerSubmitting) return;

            const sessionId = localStorage.getItem("flashcard_session_id");
            const vocabularyId = current._id ?? current.word;
            if (!sessionId || !vocabularyId) {
                toast.error("Không tìm thấy phiên học hiện tại");
                return;
            }

            const fingerprint: PendingAnswerFingerprint = {
                vocabularyId,
                action: option.key,
            };

            if (
                pendingAnswerIdempotencyKeyRef.current &&
                pendingAnswerFingerprintRef.current &&
                !hasSameFingerprint(pendingAnswerFingerprintRef.current, fingerprint)
            ) {
                toast.error("Đang xử lý câu trả lời trước đó. Vui lòng thử lại sau.");
                return;
            }

            const idempotencyKey = getPendingAnswerIdempotencyKey(fingerprint);

            const pendingPayload = pendingAnswerPayloadRef.current;

            const answerPayload =
                pendingPayload &&
                    pendingPayload.vocabulary_id === vocabularyId &&
                    pendingPayload.action === option.key
                    ? pendingPayload
                    : {
                        vocabulary_id: vocabularyId,
                        action: option.key,
                        response_time: Date.now() - startTime,
                        attempted_at: new Date().toISOString(),
                    };

            pendingAnswerPayloadRef.current = answerPayload;

            setIsAnswerSubmitting(true);

            try {
                const res = await flashCardProgressService.answerSession(
                    sessionId,
                    {
                        vocabulary_id: vocabularyId,
                        action: option.key,
                        response_time: answerPayload.response_time,
                        attempted_at: answerPayload.attempted_at,
                    },
                    idempotencyKey
                );

                setLogs((res.progress.logs ?? []) as Log[]);
                mergePreviewMetadataPatch(res);
                applyProgressQueue(res.progress);
                setStartTime(Date.now());

                pendingAnswerIdempotencyKeyRef.current = null;
                pendingAnswerFingerprintRef.current = null;
                pendingAnswerPayloadRef.current = null;

                if ((res.progress.order_queue ?? []).length === 0) {
                    setIsFinished(true);
                }
            } catch (err: unknown) {
                if (!isRetryableAnswerError(err)) {
                    pendingAnswerIdempotencyKeyRef.current = null;
                    pendingAnswerFingerprintRef.current = null;
                    pendingAnswerPayloadRef.current = null;
                }
                toast.error(`Không thể lưu câu trả lời: ${getErrorMessage(err)}`);
            } finally {
                setIsAnswerSubmitting(false);
            }
        },
        [
            current,
            isAnswerSubmitting,
            startTime,
            mergePreviewMetadataPatch,
            applyProgressQueue,
        ]
    );

    const currentAttempt: Attempt | null = useMemo(() => {
        if (logs.length === 0) return null;

        const started_at = sessionStartedAt ?? logs[0].attempted_at;
        const finished_at = logs[logs.length - 1].attempted_at;
        const total = logs.length;
        const remember = logs.filter((l) => l.action === "remember").length;
        const avg_time = Math.round(
            logs.reduce((a, b) => a + b.response_time, 0) / total / 1000
        );
        const accuracy = total > 0 ? Math.round((remember / total) * 100) : 0;

        return {
            _id: `attempt-${Date.now()}`,
            started_at,
            finished_at,
            accuracy,
            avg_time,
            total,
            logs,
        };
    }, [logs, sessionStartedAt]);

    const currentPreview: FlashcardCurrentPreview | null = useMemo(() => {
        if (!current?._id || !previewMetadata) {
            return null;
        }

        const cardPreview = previewMetadata.cards[current._id];
        if (!cardPreview) {
            return null;
        }

        return buildCurrentFlashcardPreview({
            cardPreview,
            repeatPolicy: previewMetadata.repeat_policy,
            remainingCards: Math.max(queue.length - 1, 0),
        });
    }, [current, previewMetadata, queue.length]);

    useEffect(() => {
        if (!isFinished || logs.length === 0 || !currentAttempt || finalizeRequestedRef.current) return;

        finalizeRequestedRef.current = true;
        onFinish?.();
        const sessionId = localStorage.getItem("flashcard_session_id");

        if (!dayId && sessionId) {
            toast.promise(
                flashCardProgressService.finalizeSession(
                    sessionId,
                    currentAttempt.accuracy,
                    currentAttempt.avg_time,
                    currentAttempt.total,
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
        } else if (dayId) {
            console.log("Finalize lesson session - dayId:", dayId);
        }
    }, [isFinished, logs.length, currentAttempt, onFinish, dayId]);

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
        previewMetadata,
        currentPreview,
        isAnswerSubmitting,
    };
};
