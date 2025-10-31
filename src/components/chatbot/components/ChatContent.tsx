import { motion, AnimatePresence } from "framer-motion";
import { Box, Skeleton, IconButton, Tooltip, Typography, TextField } from "@mui/material";
import {
    ThumbUpAltOutlined,
    ThumbDownAltOutlined,
    ContentCopyOutlined,
    CheckCircleOutline,
    EditOutlined,
} from "@mui/icons-material";
import { ChatInputBar } from "./ChatInputBar";
import { ChatMessage, ChatSession, ChatType } from "../../../types/Chat";
import { useEffect, useRef, useState } from "react";
import { chatService } from "../../../services/chat.service";

interface ChatContentProps {
    session: ChatSession;
    messages: ChatMessage[];
    input: string;
    setInput: (v: string) => void;
    onSend: () => void;
    onTypeSelect: (t: ChatType) => void;
    selectedType: ChatType;
    questionTypes: { value: ChatType; label: string }[];
    loadingMessages: boolean;
    isBotTyping: boolean;
    onBack: () => void;
    contextQuestion?: { id: string; text: string } | null;
    onClearContext?: () => void;
}

export function ChatContent({
    session,
    messages,
    input,
    setInput,
    onSend,
    onTypeSelect,
    selectedType,
    questionTypes,
    loadingMessages,
    isBotTyping,
    onBack,
    contextQuestion,
    onClearContext,
}: ChatContentProps) {
    const [feedbacks, setFeedbacks] = useState<Record<string, "up" | "down" | null>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState<string>("");
    const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, isBotTyping]);

    const handleFeedback = async (id: string, type: "up" | "down") => {
        const newState = feedbacks[id] === type ? null : type;
        setFeedbacks((prev) => ({ ...prev, [id]: newState }));
        if (!newState) return;
        try {
            const rating = newState === "up" ? "like" : "dislike";
            await chatService.sendFeedback({ sessionId: session._id, messageId: id, rating });
        } catch (err) {
            console.error("❌ Feedback error:", err);
        }
    };

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    const handleEditStart = (msg: ChatMessage) => {
        setEditingId(msg._id);
        setEditText(msg.text);
    };

    const handleEditSave = async (id: string) => {
        if (!editText.trim()) return;
        try {
            // await chatService.updateMessage({ messageId: id, text: editText });
        } catch (err) {
            console.error("❌ Edit save failed:", err);
        } finally {
            setEditingId(null);
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditText("");
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            {/* ===== HEADER ===== */}
            <Box
                sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #dbeafe",
                    background: "rgba(239,246,255,0.8)",
                }}
            >
                <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}>
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2563eb" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </motion.div>
                </IconButton>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2563eb" }}>
                    {`Chat: ${session.title}`}
                </Typography>
            </Box>

            {/* ===== BODY ===== */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 2,
                    pb: 4,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {loadingMessages ? (
                    <Box>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                height={30}
                                width={`${70 + i * 10}%`}
                                sx={{
                                    mb: 2,
                                    borderRadius: 2,
                                    bgcolor: i % 2 ? "rgba(147,197,253,0.3)" : "rgba(221,214,254,0.3)",
                                }}
                            />
                        ))}
                    </Box>
                ) : (
                    <>
                        {messages.map((msg, i) => {
                            const isUser = msg.sender === "user";
                            const isHovered = hoveredMsg === msg._id;
                            const isLast = i === messages.length - 1;

                            return (
                                <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0, y: isUser ? 10 : -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                                >
                                    <div className="flex flex-col max-w-[75%] relative">
                                        {/* ===== Bubble ===== */}
                                        {editingId === msg._id ? (
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                autoFocus
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleEditSave(msg._id);
                                                    if (e.key === "Escape") handleEditCancel();
                                                }}
                                                onBlur={handleEditCancel}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        bgcolor: isUser ? "#3b82f6" : "white",
                                                        color: isUser ? "white" : "inherit",
                                                        borderRadius: 2,
                                                        px: 1,
                                                    },
                                                }}
                                            />
                                        ) : (
                                            <div
                                                onMouseEnter={() => setHoveredMsg(msg._id)}
                                                onMouseLeave={() => setHoveredMsg(null)}
                                                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm cursor-text transition-all duration-150 ${isUser
                                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none self-end"
                                                    : "bg-white border border-blue-100 text-slate-800 rounded-bl-none self-start"
                                                    }`}
                                                style={{
                                                    width: "fit-content",
                                                    flexShrink: 0,
                                                    wordBreak: "break-word",
                                                    whiteSpace: "pre-wrap",
                                                    textAlign: "justify"
                                                }}
                                            >
                                                {msg.text}
                                            </div>
                                        )}

                                        {/* ===== Actions (fade in/out) ===== */}
                                        <div
                                            className={`flex items-center gap-1 mt-0.5 transition-opacity duration-200 ${isUser ? "justify-end pr-1" : "justify-start pl-1"
                                                }`}
                                            style={{
                                                opacity: isHovered || isLast ? 1 : 0,
                                                minHeight: 24,
                                            }}
                                        >
                                            {isUser ? (
                                                <>
                                                    <Tooltip title="Edit message">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditStart(msg)}
                                                            sx={{
                                                                p: 0.5,
                                                                color: "#94a3b8",
                                                                "&:hover": { color: "#2563eb" },
                                                            }}
                                                        >
                                                            <EditOutlined sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={copiedId === msg._id ? "Copied!" : "Copy to clipboard"}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleCopy(msg.text, msg._id)}
                                                            sx={{
                                                                p: 0.5,
                                                                color:
                                                                    copiedId === msg._id ? "#16a34a" : "#94a3b8",
                                                                "&:hover": { color: "#16a34a" },
                                                            }}
                                                        >
                                                            {copiedId === msg._id ? (
                                                                <CheckCircleOutline sx={{ fontSize: 16 }} />
                                                            ) : (
                                                                <ContentCopyOutlined sx={{ fontSize: 16 }} />
                                                            )}
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <>
                                                    <Tooltip title="Good answer">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleFeedback(msg._id, "up")}
                                                            sx={{
                                                                p: 0.5,
                                                                color:
                                                                    feedbacks[msg._id] === "up"
                                                                        ? "#2563eb"
                                                                        : "#94a3b8",
                                                                "&:hover": { color: "#2563eb" },
                                                            }}
                                                        >
                                                            <ThumbUpAltOutlined sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Needs improvement">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleFeedback(msg._id, "down")}
                                                            sx={{
                                                                p: 0.5,
                                                                color:
                                                                    feedbacks[msg._id] === "down"
                                                                        ? "#dc2626"
                                                                        : "#94a3b8",
                                                                "&:hover": { color: "#dc2626" },
                                                            }}
                                                        >
                                                            <ThumbDownAltOutlined sx={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={copiedId === msg._id ? "Copied!" : "Copy to clipboard"}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleCopy(msg.text, msg._id)}
                                                            sx={{
                                                                p: 0.5,
                                                                color:
                                                                    copiedId === msg._id ? "#16a34a" : "#94a3b8",
                                                                "&:hover": { color: "#16a34a" },
                                                            }}
                                                        >
                                                            {copiedId === msg._id ? (
                                                                <CheckCircleOutline sx={{ fontSize: 16 }} />
                                                            ) : (
                                                                <ContentCopyOutlined sx={{ fontSize: 16 }} />
                                                            )}
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Typing animation */}
                        <AnimatePresence>
                            {isBotTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white border border-blue-100 rounded-lg px-3 py-2 my-1 shadow-sm flex items-center gap-1 text-slate-500">
                                        <motion.span className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity }} />
                                        <motion.span className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} />
                                        <motion.span className="w-2 h-2 bg-slate-400 rounded-full" animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={endRef} />
                    </>
                )}
            </Box>

            {/* ===== INPUT BAR ===== */}
            <ChatInputBar
                input={input}
                setInput={setInput}
                onSend={onSend}
                onTypeSelect={onTypeSelect}
                questionTypes={questionTypes}
                selectedType={selectedType}
                contextQuestion={contextQuestion}
                onClearContext={onClearContext}
            />
        </Box>
    );
}
