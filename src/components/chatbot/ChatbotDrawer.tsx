import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Box,
    Typography,
    IconButton,
    Skeleton,
    List,
    ListItemButton,
    ListItemText,
    Button,
} from "@mui/material";
import { Close, Add } from "@mui/icons-material";
import ChipScrollerMini from "./components/ChipScrollerMini";
import { ChatMessage, ChatSession, ChatType } from "../../types/Chat";
import { ChatContent } from "./components/ChatContent";
import { chatService } from "../../services/chat.service";
import { useChatSocket } from "../../hooks/useChatSocket";
import { toast } from "sonner";
import { useLocation, useParams } from "react-router-dom";
import { buildRouteContext } from "../../utils/chatRouteContext";
import { getChatRouteState } from "../../utils/chatRouteState";
import {
    chatErrorMessages,
    getChatErrorMessage,
    isSilentChatError,
    shouldHideChatMessage,
} from "../../utils/chatErrors";
import { prepareChatPayload } from "../../utils/chatIntentHint";
import { hasSessionExpired } from "../../services/sessionManager";

const chatTypeLabels: Record<ChatType, string> = {
    question: "Hỏi đáp câu hỏi TOEIC",
    reading: "Chiến lược Reading",
    shadowing: "Luyện nói và shadowing",
    dictation: "Luyện nghe chép chính tả",
    lesson: "Ôn ngữ pháp và mini test",
};

function getChatTypeLabel(type: ChatType) {
    return chatTypeLabels[type] ?? "Chat";
}

/* ---------------- COMPONENT ---------------- */
export function ChatbotDrawer({
    isOpen,
    onClose,
    initialQuestion,
    quickQuestionRequest,
}: {
    isOpen: boolean;
    onClose: () => void;
    initialQuestion?: { id: string; text: string };
    quickQuestionRequest?: {
        requestId: string;
        testId: string;
        attemptId: string;
        questionId: string;
        questionNumber?: number;
        textPreview?: string;
        testTitle?: string;
    };
}) {
    /* ---------- STATE ---------- */
    const [contextQuestion, setContextQuestion] = useState<{ id: string; text: string } | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [selectedType, setSelectedType] = useState<ChatType>("question");
    const location = useLocation();
    const params = useParams();

    const listRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const loadingSessionsRef = useRef(false);
    const handledQuickRequestRef = useRef<string | null>(null);
    const sendingQuickRequestRef = useRef<string | null>(null);
    const [pendingQuickRequest, setPendingQuickRequest] = useState<typeof quickQuestionRequest | null>(null);
    const streamStatesRef = useRef<Record<string, {
        queue: string;
        displayed: string;
        timer?: ReturnType<typeof setTimeout>;
        finalMessage?: ChatMessage;
        ending?: boolean;
    }>>({});

    const TYPEWRITER_INTERVAL_MS = 16;
    const TYPEWRITER_CHARS_PER_TICK = 2;

    const questionTypes = [
        { value: "question", label: "Hỏi đáp câu hỏi TOEIC" },
        { value: "reading", label: "Chiến lược Reading" },
        { value: "shadowing", label: "Luyện nói và shadowing" },
        { value: "dictation", label: "Luyện nghe chép chính tả" },
        { value: "lesson", label: "Ôn ngữ pháp và mini test" },
    ] satisfies { value: ChatType; label: string }[];

    const clearStreamTimer = useCallback((tempMessageId: string) => {
        const streamState = streamStatesRef.current[tempMessageId];
        if (streamState?.timer) {
            clearTimeout(streamState.timer);
            streamState.timer = undefined;
        }
    }, []);

    const clearAllStreamTimers = useCallback(() => {
        Object.keys(streamStatesRef.current).forEach(clearStreamTimer);
        streamStatesRef.current = {};
    }, [clearStreamTimer]);

    const replaceStreamMessage = useCallback((tempMessageId: string, message: ChatMessage) => {
        setMessages((prev) =>
            prev.some((msg) => msg._id === tempMessageId)
                ? prev.map((msg) => (msg._id === tempMessageId ? message : msg))
                : [...prev, message]
        );
    }, []);

    const pumpTypewriterQueue = useCallback((tempMessageId: string) => {
        const streamState = streamStatesRef.current[tempMessageId];
        if (!streamState || streamState.timer) return;

        const tick = () => {
            const currentState = streamStatesRef.current[tempMessageId];
            if (!currentState) return;

            if (!currentState.queue) {
                currentState.timer = undefined;
                if (currentState.ending && currentState.finalMessage) {
                    replaceStreamMessage(tempMessageId, currentState.finalMessage);
                    delete streamStatesRef.current[tempMessageId];
                }
                return;
            }

            const visibleText = currentState.queue.slice(0, TYPEWRITER_CHARS_PER_TICK);
            currentState.queue = currentState.queue.slice(TYPEWRITER_CHARS_PER_TICK);
            currentState.displayed = `${currentState.displayed}${visibleText}`;
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === tempMessageId
                        ? { ...msg, text: `${msg.text}${visibleText}` }
                        : msg
                )
            );
            currentState.timer = setTimeout(tick, TYPEWRITER_INTERVAL_MS);
        };

        streamState.timer = setTimeout(tick, TYPEWRITER_INTERVAL_MS);
    }, [replaceStreamMessage]);

    const handleSocketMessage = useCallback((msg: ChatMessage) => {
        if (shouldHideChatMessage(msg)) return;
        setMessages((prev) => [...prev, msg]);
    }, []);

    const handleSessionUpdated = useCallback((data: { sessionId: string; title?: string; last_message_preview: string; updated_at: string | Date }) => {
        setSessions((prev) =>
            prev.map((s) =>
                s._id === data.sessionId
                    ? {
                        ...s,
                        title: data.title || s.title,
                        last_message_preview: data.last_message_preview,
                        updated_at: data.updated_at as string,
                    }
                    : s
            )
        );
        setSelectedSession((prev) =>
            prev?._id === data.sessionId && data.title
                ? { ...prev, title: data.title, last_message_preview: data.last_message_preview, updated_at: data.updated_at as string }
                : prev
        );
    }, []);

    const handleStreamStart = useCallback(({ tempMessageId }: { sessionId: string; tempMessageId: string }) => {
        clearStreamTimer(tempMessageId);
        streamStatesRef.current[tempMessageId] = { queue: "", displayed: "" };
        const tempMessage: ChatMessage = {
            _id: tempMessageId,
            session_id: selectedSession?._id || "unknown",
            sender: "bot",
            text: "",
            created_at: new Date().toISOString(),
        };
        setMessages((prev) =>
            prev.some((msg) => msg._id === tempMessageId) ? prev : [...prev, tempMessage]
        );
    }, [clearStreamTimer, selectedSession?._id]);

    const handleStreamChunk = useCallback(({ tempMessageId, chunk }: { sessionId: string; tempMessageId: string; chunk: string }) => {
        if (!chunk) return;
        if (!streamStatesRef.current[tempMessageId]) {
            streamStatesRef.current[tempMessageId] = { queue: "", displayed: "" };
        }
        streamStatesRef.current[tempMessageId].queue += chunk;
        pumpTypewriterQueue(tempMessageId);
    }, [pumpTypewriterQueue]);

    const handleStreamEnd = useCallback(({ tempMessageId, message }: { sessionId: string; tempMessageId: string; message: ChatMessage }) => {
        const streamState = streamStatesRef.current[tempMessageId];
        if (!streamState) {
            replaceStreamMessage(tempMessageId, message);
            return;
        }

        streamState.finalMessage = message;
        streamState.ending = true;
        if (!streamState.queue && !streamState.timer) {
            if (!streamState.displayed && message.text) {
                streamState.queue = message.text;
                pumpTypewriterQueue(tempMessageId);
                return;
            }
            replaceStreamMessage(tempMessageId, message);
            delete streamStatesRef.current[tempMessageId];
            return;
        }
        pumpTypewriterQueue(tempMessageId);
    }, [pumpTypewriterQueue, replaceStreamMessage]);

    const handleStreamError = useCallback(({ tempMessageId, message }: { sessionId: string; tempMessageId: string; message: ChatMessage }) => {
        clearStreamTimer(tempMessageId);
        delete streamStatesRef.current[tempMessageId];
        if (shouldHideChatMessage(message)) {
            setMessages((prev) => prev.filter((item) => item._id !== tempMessageId));
            return;
        }
        replaceStreamMessage(tempMessageId, message);
    }, [clearStreamTimer, replaceStreamMessage]);

    /* ---------- SOCKET HOOK ---------- */
    const { sendMessage, isBotTyping } = useChatSocket({
        sessionId: selectedSession?._id || "",
        onMessage: handleSocketMessage,
        onBotTyping: () => { },
        onError: (err) => {
            console.error("Chat Error:", err);
            if (isSilentChatError(err)) return;
            const message = getChatErrorMessage(err);
            toast.error(message);
        },
        onSessionUpdated: handleSessionUpdated,
        onStreamStart: handleStreamStart,
        onStreamChunk: handleStreamChunk,
        onStreamEnd: handleStreamEnd,
        onStreamError: handleStreamError,
    });

    const loadInitialSessions = useCallback(async () => {
        if (loadingSessionsRef.current) return;
        loadingSessionsRef.current = true;
        setLoadingSessions(true);

        try {
            let nextPage = 1;
            let combined: ChatSession[] = [];

            while (true) {
                const res = await chatService.getChatSessions(nextPage, 8);
                const newSessions = res.items;

                combined = [...combined, ...newSessions];
                setSessions([...combined]);
                setHasMore(res.hasMore ?? newSessions.length > 0);
                nextPage++;

                const container = listRef.current;
                if (!container || !res.hasMore) break;
                if (container.scrollHeight > container.clientHeight + 80) break;
            }

            setPage(nextPage - 1);
        } finally {
            loadingSessionsRef.current = false;
            setLoadingSessions(false);
        }
    }, []);

    /* ---------- LOAD INITIAL SESSIONS ---------- */
    useEffect(() => {
        if (isOpen) {
            setSessions([]);
            setPage(1);
            setHasMore(true);
            loadInitialSessions();
        }
        return () => {
            clearAllStreamTimers();
            setSelectedSession(null);
            setMessages([]);
            setInput("");
            setContextQuestion(null);
        }
    }, [clearAllStreamTimers, isOpen, loadInitialSessions]);

    useEffect(() => {
        if (initialQuestion) {
            // Nếu chưa có session đang mở thì tạo session mới.
            (async () => {
                const created = await chatService.createChatSession({
                    title: `Thảo luận câu hỏi - ${initialQuestion.text.slice(0, 40)}...`,
                    type: "question",
                });
                setSelectedSession(created);
                setSessions((prev) => [created, ...prev]);
                // Gắn context để FE hiển thị chip.
                setContextQuestion(initialQuestion);
            })();
        }
    }, [initialQuestion]);

    useEffect(() => {
        if (!isOpen || !quickQuestionRequest) return;
        if (handledQuickRequestRef.current === quickQuestionRequest.requestId) return;

        handledQuickRequestRef.current = quickQuestionRequest.requestId;
        setPendingQuickRequest(quickQuestionRequest);
        setContextQuestion({
            id: quickQuestionRequest.questionId,
            text:
                quickQuestionRequest.textPreview ||
                (quickQuestionRequest.questionNumber
                    ? `Câu ${quickQuestionRequest.questionNumber}`
                    : "Câu hỏi đang chọn"),
        });

        if (!selectedSession) {
            (async () => {
                const title = quickQuestionRequest.questionNumber
                    ? quickQuestionRequest.testTitle
                        ? `Giải thích câu ${quickQuestionRequest.questionNumber} - ${quickQuestionRequest.testTitle}`
                        : `Giải thích câu ${quickQuestionRequest.questionNumber}`
                    : "Giải thích câu hỏi";
                const created = await chatService.createChatSession({
                    title,
                    type: "question",
                });
                setSelectedSession(created);
                setSessions((prev) => [created, ...prev]);
            })().catch((err) => {
                console.error("Không thể tạo phiên chat cho câu hỏi nhanh:", err);
                toast.error("Không thể mở chatbot cho câu hỏi này.");
                setPendingQuickRequest(null);
            });
        }
    }, [isOpen, quickQuestionRequest, selectedSession]);

    useEffect(() => {
        if (!pendingQuickRequest || !selectedSession?._id) return;
        if (sendingQuickRequestRef.current === pendingQuickRequest.requestId) return;

        const text = pendingQuickRequest.questionNumber
            ? `Giải thích nhanh câu ${pendingQuickRequest.questionNumber}`
            : "Giải thích nhanh câu này";
        const routeContext = {
            page: "question_review" as const,
            testId: pendingQuickRequest.testId,
            attemptId: pendingQuickRequest.attemptId,
            questionId: pendingQuickRequest.questionId,
            currentQuestionNumber: pendingQuickRequest.questionNumber,
            questionRefs: [
                {
                    questionNumber: pendingQuickRequest.questionNumber ?? 0,
                    questionId: pendingQuickRequest.questionId,
                    textPreview: pendingQuickRequest.textPreview,
                },
            ].filter((item) => item.questionNumber > 0),
        };

        sendingQuickRequestRef.current = pendingQuickRequest.requestId;
        (async () => {
            const preparedPayload = prepareChatPayload({
                userText: text,
                routeContext,
                contextQuestion: {
                    id: pendingQuickRequest.questionId,
                    text: pendingQuickRequest.textPreview || "",
                },
                selectedText: pendingQuickRequest.textPreview,
                clientContext: {
                    userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    sourceAction: "quick_question_explain",
                    testTitle: pendingQuickRequest.testTitle,
                },
            });
            console.info("chat.route.clientPayload", {
                userText: text,
                scope: preparedPayload.intentHint.scope,
                intent: preparedPayload.intentHint.intent,
                source: preparedPayload.intentHint.source,
                routeContext: preparedPayload.routeContext,
                resolverPolicy: preparedPayload.intentHint.resolverPolicy,
            });
            const sent = await sendMessage(text, {
                questionId: preparedPayload.questionId,
                mode: "db_first",
                routeContext: preparedPayload.routeContext,
                clientContext: preparedPayload.clientContext,
            });

            sendingQuickRequestRef.current = null;
            if (!sent) {
                if (hasSessionExpired()) return;
                toast.error(chatErrorMessages.SOCKET_DISCONNECTED);
                return;
            }
            setPendingQuickRequest(null);
            setContextQuestion(null);
        })();
    }, [pendingQuickRequest, selectedSession?._id, sendMessage]);

    /* ---------- INFINITE SCROLL ---------- */
    useEffect(() => {
        const container = listRef.current;
        const sentinel = observerRef.current;
        if (!container || !sentinel || !hasMore || loadingMore || loadingSessions) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    setLoadingMore(true);
                    chatService
                        .getChatSessions(page + 1, 8)
                        .then((res) => {
                            const newSessions = res.items;
                            setSessions((prev) => {
                                const existing = new Set(prev.map((s) => s._id));
                                const unique = newSessions.filter((s: ChatSession) => !existing.has(s._id));
                                return [...prev, ...unique];
                            });
                            setHasMore(res.hasMore ?? newSessions.length > 0);
                            setPage((prev) => prev + 1);
                        })
                        .finally(() => setLoadingMore(false));
                }
            },
            { root: container, rootMargin: "50px", threshold: 1.0 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [page, hasMore, loadingMore, loadingSessions]);

    /* ---------- LOAD MESSAGES WHEN SESSION SELECTED ---------- */
    const handleSelectSession = async (session: ChatSession) => {
        setSelectedSession(session);
        setLoadingMessages(true);
        try {
            const res = await chatService.getAllChatMessageInSession(session._id);
            setMessages(res.filter((message) => !shouldHideChatMessage(message)));
        } catch (err) {
            console.error("Lỗi tải tin nhắn:", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Xóa session.
    const handleDeleteSession = async (sessionId: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa phiên chat này không?")) return;

        try {
            await toast.promise(chatService.deleteChatSession(sessionId), {
                loading: "Đang xóa phiên chat...",
                success: "Đã xóa phiên chat.",
                error: "Không thể xóa phiên chat.",
            });
            setSessions((prev) => prev.filter((s) => s._id !== sessionId));

            // Nếu đang xem session bị xóa.
            if (selectedSession?._id === sessionId) {
                setSelectedSession(null);
                setMessages([]);
            }

            console.log("Đã xóa phiên chat:", sessionId);
        } catch (err) {
            console.error("Lỗi xóa phiên chat:", err);
        }
    };

    /* ---------- GỬI TIN NHẮN ---------- */
    const handleSendMessage = async () => {
        if (!input.trim() || !selectedSession?._id) return;

        const text = input.trim();
        setInput("");

        try {
            const routeContext = buildRouteContext({
                pathname: location.pathname,
                search: location.search,
                params,
                pageState: {
                    ...getChatRouteState(),
                    questionId: contextQuestion?.id || undefined,
                },
            });
            const preparedPayload = prepareChatPayload({
                userText: text,
                routeContext,
                messages,
                contextQuestion,
                selectedText: window.getSelection()?.toString() || undefined,
                clientContext: {
                    userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
            });
            console.info("chat.route.clientPayload", {
                userText: text,
                scope: preparedPayload.intentHint.scope,
                intent: preparedPayload.intentHint.intent,
                source: preparedPayload.intentHint.source,
                routeContext: preparedPayload.routeContext,
                resolverPolicy: preparedPayload.intentHint.resolverPolicy,
            });

            const sent = await sendMessage(text, {
                questionId: preparedPayload.questionId,
                routeContext: preparedPayload.routeContext,
                clientContext: preparedPayload.clientContext,
            });
            if (sent && contextQuestion) {
                setContextQuestion(null);
            }
            if (!sent) {
                if (contextQuestion) setContextQuestion(contextQuestion);
                setInput(text);
                if (hasSessionExpired()) return;
                const message = chatErrorMessages.SOCKET_DISCONNECTED;
                toast.error(message);
                return;
            }
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            toast.error("Không thể gửi tin nhắn đến chatbot.");
        }
    };

    /* ---------- TẠO CHAT MỚI ---------- */
    const resetConversationState = useCallback(() => {
        clearAllStreamTimers();
        setMessages([]);
        setInput("");
        setContextQuestion(null);
        setPendingQuickRequest(null);
        setLoadingMessages(false);
    }, [clearAllStreamTimers]);

    const returnToSessionList = useCallback(() => {
        resetConversationState();
        setSelectedSession(null);
    }, [resetConversationState]);

    const handleNewChat = async (type?: ChatType) => {
        const chatType = type || selectedType;

        try {
            const created = await chatService.createChatSession({
                title: `Phiên ${getChatTypeLabel(chatType).toLowerCase()} mới`,
                type: chatType,
            });
            setSessions((prev) => [created, ...prev]);

            resetConversationState();
            setSelectedSession(created);

            const list = listRef.current;
            if (list) list.scrollTop = 0;
        } catch (err) {
            console.error("Lỗi tạo phiên chat:", err);
        }
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="chat-drawer"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 180, damping: 20 }}
                    className="fixed top-0 right-0 h-full w-[420px] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 border-l border-blue-100 shadow-2xl z-[9999] flex flex-col"
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: "1px solid #bfdbfe",
                            background: "linear-gradient(to right, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                background: "linear-gradient(to right, #2563eb, #7c3aed)",
                                backgroundClip: "text",
                                color: "transparent",
                            }}
                        >
                            Trợ lý TOEIC thông minh
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <Close sx={{ color: "#2563eb" }} />
                        </IconButton>
                    </Box>

                    {/* Main Content */}
                    {!selectedSession ? (
                        <Box ref={listRef} sx={{ flex: 1, overflowY: "auto", py: 2, px: 0.5 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Chế độ luyện tập nhanh
                            </Typography>

                            <ChipScrollerMini
                                onChipClick={(type) => {
                                    setSelectedType(type);
                                    handleNewChat(type);
                                }}
                            />

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
                                Phiên luyện tập gần đây
                            </Typography>

                            {/* Loading Skeleton */}
                            {loadingSessions && sessions.length === 0 ? (
                                <Box>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            variant="rectangular"
                                            height={44}
                                            sx={{ borderRadius: 2, bgcolor: "rgba(203,213,225,0.4)", mb: 1 }}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <>
                                    <List>
                                        {sessions.map((s) => (
                                            <motion.div
                                                key={s._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <ListItemButton
                                                    onClick={() => handleSelectSession(s)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        position: "relative",
                                                        "&:hover": {
                                                            background: "linear-gradient(to right, #eff6ff, #ede9fe)",
                                                            ".delete-btn": { opacity: 1, transform: "translateX(0)" },
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={s.title}
                                                        secondary={s.last_message_preview}
                                                        primaryTypographyProps={{ fontWeight: 500, fontSize: "0.85rem" }}
                                                    />

                                                    <IconButton
                                                        size="small"
                                                        className="delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSession(s._id);
                                                        }}
                                                        sx={{
                                                            position: "absolute",
                                                            right: 8,
                                                            opacity: 0,
                                                            transform: "translateX(10px)",
                                                            transition: "all 0.2s ease",
                                                            color: "#9ca3af",
                                                            "&:hover": { color: "#ef4444" },
                                                        }}
                                                    >
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                </ListItemButton>
                                            </motion.div>
                                        ))}
                                    </List>

                                    <div ref={observerRef} style={{ height: 1 }} />

                                    {loadingMore && (
                                        <Box sx={{ mt: 1 }}>
                                            {Array.from({ length: 2 }).map((_, i) => (
                                                <Skeleton
                                                    key={i}
                                                    variant="rectangular"
                                                    height={44}
                                                    sx={{ borderRadius: 2, bgcolor: "rgba(203,213,225,0.4)", mb: 1 }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </>
                            )}

                            {/* Nút tạo chat mới */}
                            <Box
                                sx={{
                                    position: "fixed",
                                    right: "140px",
                                    bottom: 24,
                                    zIndex: 50,
                                    pointerEvents: "none",
                                }}
                            >
                                <Button
                                    startIcon={<Add />}
                                    onClick={() => handleNewChat(selectedType)}
                                    sx={{
                                        pointerEvents: "auto",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        color: "#fff",
                                        background: "linear-gradient(to right, #2563eb, #7c3aed)",
                                        borderRadius: 50,
                                        px: 2.5,
                                        py: 1,
                                        boxShadow: "0 3px 10px rgba(37, 99, 235, 0.3)",
                                        "&:hover": {
                                            background: "linear-gradient(to right, #1e40af, #6d28d9)",
                                        },
                                    }}
                                >
                                    Chat mới
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <ChatContent
                            session={selectedSession}
                            messages={messages}
                            input={input}
                            setInput={setInput}
                            onSend={handleSendMessage}
                            onTypeSelect={setSelectedType}
                            selectedType={selectedType}
                            questionTypes={questionTypes}
                            loadingMessages={loadingMessages}
                            isBotTyping={isBotTyping}
                            onBack={returnToSessionList}
                            contextQuestion={contextQuestion}
                            onClearContext={() => setContextQuestion(null)}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}


