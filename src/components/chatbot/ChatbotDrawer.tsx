import { useEffect, useRef, useState } from "react";
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

/* ---------------- COMPONENT ---------------- */
export function ChatbotDrawer({
    isOpen,
    onClose,
    initialQuestion
}: {
    isOpen: boolean;
    onClose: () => void;
    initialQuestion?: { id: string; text: string };
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

    const listRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const questionTypes = [
        { value: "question", label: "Ask about TOEIC Questions" },
        { value: "reading", label: "Discuss Reading Strategies" },
        { value: "shadowing", label: "Practice Speaking & Shadowing" },
        { value: "dictation", label: "Improve Dictation Skills" },
        { value: "lesson", label: "Review Grammar or Mini Tests" },
    ] satisfies { value: ChatType; label: string }[];

    /* ---------- SOCKET HOOK ---------- */
    const { sendMessage, isBotTyping } = useChatSocket({
        sessionId: selectedSession?._id || "",
        onMessage: (msg) => setMessages((prev) => [...prev, msg]),
        onBotTyping: () => { },
        onError: (err) => {
            console.error("⚠️ Chat Error:", err);
            toast.error("Error communicating with chatbot. Please try again.");
            handleBotErrorMessage();
        },
        onSessionUpdated: (data) =>
            setSessions((prev) =>
                prev.map((s) =>
                    s._id === data.sessionId
                        ? { ...s, last_message_preview: data.last_message_preview, updated_at: data.updated_at as string }
                        : s
                )
            ),
    });

    /* ---------- LOAD INITIAL SESSIONS ---------- */
    useEffect(() => {
        if (isOpen) {
            setSessions([]);
            setPage(1);
            setHasMore(true);
            loadInitialSessions();
        }
        return () => {
            setSelectedSession(null);
            setMessages([]);
            setInput("");
            setContextQuestion(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialQuestion) {
            // Nếu chưa có session đang mở → tạo session mới luôn
            (async () => {
                const created = await chatService.createChatSession({
                    title: `Question Discussion - ${initialQuestion.text.slice(0, 40)}...`,
                    type: "question",
                });
                setSelectedSession(created);
                setSessions((prev) => [created, ...prev]);
                // Gắn context để FE hiển thị chip
                setContextQuestion(initialQuestion);
            })();
        }
    }, [initialQuestion]);

    const loadInitialSessions = async () => {
        if (loadingSessions) return;
        setLoadingSessions(true);

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
        setLoadingSessions(false);
    };

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
            setMessages(res);
        } catch (err) {
            console.error("❌ Lỗi tải tin nhắn:", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Xoá session
    const handleDeleteSession = async (sessionId: string) => {
        if (!window.confirm("Are you sure you want to delete this chat session?")) return;

        try {
            await toast.promise(chatService.deleteChatSession(sessionId), {
                loading: "Deleting chat session...",
                success: "Chat session deleted.",
                error: "Failed to delete chat session.",
            });
            setSessions((prev) => prev.filter((s) => s._id !== sessionId));

            // Nếu đang xem session bị xóa
            if (selectedSession?._id === sessionId) {
                setSelectedSession(null);
                setMessages([]);
            }

            console.log("🗑️ Deleted chat session:", sessionId);
        } catch (err) {
            console.error("❌ Lỗi xoá session:", err);
        }
    };

    // Xử lý tin nhắn lỗi từ bot
    const handleBotErrorMessage = async (errorText?: string) => {
        const botErrorMessage: ChatMessage = {
            _id: `${Date.now()}_error`,
            session_id: selectedSession?._id || "unknown",
            sender: "bot",
            text:
                errorText ||
                "⚠️ Xin lỗi, hiện tại mình đang gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại sau nhé!",
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botErrorMessage]);
    };

    /* ---------- GỬI TIN NHẮN ---------- */
    const handleSendMessage = async () => {
        if (!input.trim() || !selectedSession?._id) return;

        const text = input.trim();
        setInput("");

        try {
            if (!contextQuestion) {
                sendMessage(text);
            } else {
                sendMessage(`${text}. Dữ liệu liên quan: ${contextQuestion.text}`);
                setContextQuestion(null); // gửi xong xoá context
            }
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
            toast.error("Không thể gửi tin nhắn đến chatbot.");
            handleBotErrorMessage("Mình không thể gửi tin nhắn được lúc này. Hãy thử lại sau nhé!");
        }
    };

    /* ---------- TẠO CHAT MỚI ---------- */
    const handleNewChat = async (type?: ChatType) => {
        const chatType = type || selectedType;

        try {
            const created = await chatService.createChatSession({
                title: `New ${chatType} session`,
                type: chatType,
            });
            setSessions((prev) => [created, ...prev]);

            setSelectedSession(created);

            const list = listRef.current;
            if (list) list.scrollTop = 0;
        } catch (err) {
            console.error("❌ Lỗi tạo phiên chat:", err);
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
                            TOEIC Smart Assistant
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <Close sx={{ color: "#2563eb" }} />
                        </IconButton>
                    </Box>

                    {/* Main Content */}
                    {!selectedSession ? (
                        <Box ref={listRef} sx={{ flex: 1, overflowY: "auto", py: 2, px: 0.5 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Quick Practice Modes
                            </Typography>

                            <ChipScrollerMini
                                onChipClick={(type) => {
                                    setSelectedType(type);
                                    handleNewChat(type);
                                }}
                            />

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
                                Recent Practice Sessions
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

                            {/* Floating New Chat Button */}
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
                                    New Chat
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
                            onBack={() => setSelectedSession(null)}
                            contextQuestion={contextQuestion}
                            onClearContext={() => setContextQuestion(null)}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
