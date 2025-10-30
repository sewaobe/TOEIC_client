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

/* ---------------- MOCK API ---------------- */
async function fetchChatSessionsPaginated(
    page: number,
    limit: number
): Promise<{ sessions: ChatSession[]; hasMore: boolean }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allSessions: ChatSession[] = Array.from({ length: 35 }).map((_, i) => ({
                _id: `${i + 1}`,
                title: `Practice Session ${i + 1}`,
                type: "question",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_message_preview: "Continue your TOEIC practice...",
                total_messages: 5 + i,
                is_archived: false,
            }));
            const start = (page - 1) * limit;
            const end = start + limit;
            const paginated = allSessions.slice(start, end);
            resolve({ sessions: paginated, hasMore: end < allSessions.length });
        }, 800);
    });
}

async function fetchMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    _id: "1",
                    session_id: sessionId,
                    text: "Hello! Ready to practice?",
                    sender: "bot",
                    created_at: new Date().toISOString(),
                },
                {
                    _id: "2",
                    session_id: sessionId,
                    text: "Yes, let's start.",
                    sender: "user",
                    created_at: new Date().toISOString(),
                },
            ]);
        }, 400);
    });
}

async function sendMessageAPI(
    input: string,
    selectedType: ChatType
): Promise<{ reply: string }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ reply: `Let's continue practicing ${selectedType}!` });
        }, 600);
    });
}

// 1️⃣ Thêm hàm sinh tin nhắn mở đầu
function getInitialBotMessage(type: ChatType): string {
    switch (type) {
        case "question":
            return "👋 Hi there! What TOEIC question would you like to discuss today?";
        case "reading":
            return "📖 Let's dive into some reading strategies or passages. What would you like help with?";
        case "shadowing":
            return "🗣️ Ready to practice speaking and shadowing? You can send me a sentence or phrase to start.";
        case "dictation":
            return "✍️ Let's work on your dictation! I can help you with listening and writing practice.";
        case "lesson":
            return "🧠 Let's review grammar points or take a mini test. Which topic do you want to start with?";
        default:
            return "Hello! How can I help you with your TOEIC preparation today?";
    }
}

/* ---------------- COMPONENT ---------------- */
export function ChatbotDrawer({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const listRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [selectedType, setSelectedType] = useState<ChatType>("question");
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isAutoFill, setIsAutoFill] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);

    const questionTypes = [
        { value: "question", label: "Ask about TOEIC Questions" },
        { value: "reading", label: "Discuss Reading Strategies" },
        { value: "shadowing", label: "Practice Speaking & Shadowing" },
        { value: "dictation", label: "Improve Dictation Skills" },
        { value: "lesson", label: "Review Grammar or Mini Tests" },
    ] satisfies { value: ChatType; label: string }[];

    /* -------- Load initial sessions -------- */
    useEffect(() => {
        if (isOpen) {
            setSessions([]);
            setPage(1);
            setHasMore(true);
            loadInitialSessions();
        }
    }, [isOpen]);

    const loadInitialSessions = async () => {
        if (loadingSessions) return;
        setLoadingSessions(true);
        setIsAutoFill(true);

        let nextPage = 1;
        let combined: ChatSession[] = [];

        while (true) {
            const res = await fetchChatSessionsPaginated(nextPage, 8);
            combined = [...combined, ...res.sessions];
            setSessions([...combined]);
            setHasMore(res.hasMore);
            nextPage++;

            const container = listRef.current;
            if (!container || !res.hasMore) break;
            if (container.scrollHeight > container.clientHeight + 80) break;
        }

        setPage(nextPage - 1);
        setLoadingSessions(false);
        setTimeout(() => setIsAutoFill(false), 300);
    };

    /* -------- Infinite scroll -------- */
    useEffect(() => {
        const container = listRef.current;
        const sentinel = observerRef.current;
        if (!container || !sentinel || !hasMore || loadingMore || loadingSessions || isAutoFill)
            return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    setLoadingMore(true);
                    fetchChatSessionsPaginated(page + 1, 8)
                        .then((res) => {
                            setSessions((prev) => {
                                const newIds = new Set(prev.map((s) => s._id));
                                const unique = res.sessions.filter((s) => !newIds.has(s._id));
                                return [...prev, ...unique];
                            });
                            setHasMore(res.hasMore);
                            setPage((prev) => prev + 1);
                        })
                        .finally(() => setLoadingMore(false));
                }
            },
            { root: container, rootMargin: "50px", threshold: 1.0 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [page, hasMore, loadingMore, loadingSessions, isAutoFill]);

    /* -------- Chat logic -------- */
    const handleSelectSession = async (session: ChatSession) => {
        setSelectedSession(session);
        setLoadingMessages(true);
        const data = await fetchMessagesBySession(session._id);
        setMessages(data);
        setLoadingMessages(false);
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        const userMsg: ChatMessage = {
            _id: Date.now().toString(),
            session_id: selectedSession?._id || "new",
            text: input,
            sender: "user",
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsBotTyping(true);
        const response = await sendMessageAPI(input, selectedType);

        setTimeout(() => {
            setIsBotTyping(false);
            const botMsg: ChatMessage = {
                _id: (Date.now() + 1).toString(),
                session_id: userMsg.session_id,
                text: response.reply,
                sender: "bot",
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, botMsg]);
        }, 1000);
    };

    const handleNewChat = () => {
        const newSession: ChatSession = {
            _id: "new",
            title: "New Chat",
            type: selectedType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setSelectedSession(newSession);

        const botIntro: ChatMessage = {
            _id: `${Date.now()}_intro`,
            session_id: "new",
            sender: "bot",
            text: getInitialBotMessage(selectedType),
            created_at: new Date().toISOString(),
        };
        setMessages([]);
        setIsBotTyping(true);
        setTimeout(() => {
            setIsBotTyping(false);
            setMessages([botIntro]);
        }, 1200);
    };

    if (!isOpen) return null;

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
                            background:
                                "linear-gradient(to right, rgba(59,130,246,0.1), rgba(139,92,246,0.1))",
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
                            TOEIC Master Assistant
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <Close sx={{ color: "#2563eb" }} />
                        </IconButton>
                    </Box>

                    {/* Main content */}
                    {!selectedSession ? (
                        <Box ref={listRef} sx={{ flex: 1, overflowY: "auto", py: 2, px: 0.5 }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Quick Practice Modes
                            </Typography>
                            <ChipScrollerMini
                                onChipClick={(type) => {
                                    setSelectedType(type);

                                    const newSession: ChatSession = {
                                        _id: "new",
                                        title: `New ${type} session`,
                                        type,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                    };
                                    setSelectedSession(newSession);

                                    const botIntro: ChatMessage = {
                                        _id: `${Date.now()}_intro`,
                                        session_id: "new",
                                        sender: "bot",
                                        text: getInitialBotMessage(type),
                                        created_at: new Date().toISOString(),
                                    };
                                    setMessages([botIntro]);
                                }}
                            />

                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1 }}>
                                Recent Practice Sessions
                            </Typography>

                            {/* Skeleton loader */}
                            {loadingSessions && sessions.length === 0 ? (
                                <Box>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Skeleton
                                                variant="rectangular"
                                                height={44}
                                                sx={{ borderRadius: 2, bgcolor: "rgba(203,213,225,0.4)", mb: 1 }}
                                            />
                                        </motion.div>
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
                                                        "&:hover": {
                                                            background: "linear-gradient(to right, #eff6ff, #ede9fe)",
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={s.title}
                                                        secondary={s.last_message_preview}
                                                        primaryTypographyProps={{
                                                            fontWeight: 500,
                                                            fontSize: "0.85rem",
                                                        }}
                                                    />
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

                            {/* Floating “New Chat” button */}
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
                                    onClick={handleNewChat}
                                    sx={{
                                        pointerEvents: "auto",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        color: "#fff",
                                        background:
                                            "linear-gradient(to right, #2563eb, #7c3aed)",
                                        borderRadius: 50,
                                        px: 2.5,
                                        py: 1,
                                        boxShadow: "0 3px 10px rgba(37, 99, 235, 0.3)",
                                        "&:hover": {
                                            background:
                                                "linear-gradient(to right, #1e40af, #6d28d9)",
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
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
