import { motion, AnimatePresence } from "framer-motion";
import { Box, Skeleton, IconButton, Tooltip, Typography } from "@mui/material";
import {
    ThumbUpAltOutlined,
    ThumbDownAltOutlined,
    ContentCopyOutlined,
    CheckCircleOutline,
} from "@mui/icons-material";
import { ChatInputBar } from "./ChatInputBar";
import { ChatMessage, ChatSession, ChatType } from "../../../types/Chat";
import { useState } from "react";

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
}: ChatContentProps) {
    // 🔹 Feedback state
    const [feedbacks, setFeedbacks] = useState<Record<string, "up" | "down" | null>>({});
    // 🔹 Copy state
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleFeedback = (id: string, type: "up" | "down") => {
        setFeedbacks((prev) => ({
            ...prev,
            [id]: prev[id] === type ? null : type, // toggle
        }));

        console.log("Feedback sent:", { messageId: id, feedback: type });
    };

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1500); // Reset sau 1.5s
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
            }}
        >

            {/* Vùng tin nhắn */}
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="#2563eb"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                        </svg>
                    </motion.div>
                </IconButton>

                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#2563eb" }}>
                    {`Chat: ${session.title}`}
                </Typography>
            </Box>

            {/* Vùng tin nhắn */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    p: 2,
                    pb: 4,
                    minHeight: 0,
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
                                    bgcolor:
                                        i % 2 ? "rgba(147,197,253,0.3)" : "rgba(221,214,254,0.3)",
                                }}
                            />
                        ))}
                    </Box>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg._id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div>
                                    <div
                                        className={`max-w-[75%] px-3 py-2 rounded-lg text-sm my-1 break-words ${msg.sender === "user"
                                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none"
                                            : "bg-white border border-blue-100 text-slate-700 rounded-bl-none shadow-sm"
                                            }`}
                                        style={{
                                            wordBreak: "break-word",
                                            overflowWrap: "anywhere",
                                            marginLeft: msg.sender === "bot" ? 0 : "auto",
                                        }}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* 🔹 Feedback & Copy row (bot only) */}
                                    {msg.sender === "bot" && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex gap-1 pl-2 items-center"
                                        >
                                            {/* 👍 */}
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

                                            {/* 👎 */}
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

                                            {/* 📋 Copy */}
                                            <Tooltip
                                                title={
                                                    copiedId === msg._id
                                                        ? "Copied!"
                                                        : "Copy to clipboard"
                                                }
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleCopy(msg.text, msg._id)
                                                    }
                                                    sx={{
                                                        p: 0.5,
                                                        color:
                                                            copiedId === msg._id
                                                                ? "#16a34a"
                                                                : "#94a3b8",
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
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

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
                                        <motion.span
                                            className="w-2 h-2 bg-slate-400 rounded-full"
                                            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                                        />
                                        <motion.span
                                            className="w-2 h-2 bg-slate-400 rounded-full"
                                            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                                delay: 0.2,
                                            }}
                                        />
                                        <motion.span
                                            className="w-2 h-2 bg-slate-400 rounded-full"
                                            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                                delay: 0.4,
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </Box>

            {/* Thanh nhập liệu */}
            <ChatInputBar
                input={input}
                setInput={setInput}
                onSend={onSend}
                onTypeSelect={onTypeSelect}
                questionTypes={questionTypes}
                selectedType={selectedType}
            />
        </Box>
    );
}
