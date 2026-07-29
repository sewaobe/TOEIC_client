import { motion, AnimatePresence } from "framer-motion";
import { Box, Skeleton, IconButton, Tooltip, Typography, TextField, Button, GlobalStyles } from "@mui/material";
import {
    ThumbUpAltOutlined,
    ThumbDownAltOutlined,
    ContentCopyOutlined,
    CheckCircleOutline,
    EditOutlined,
} from "@mui/icons-material";
import { ChatInputBar } from "./ChatInputBar";
import {
    ChatAction,
    ChatMessage,
    ChatRouteContext,
    ChatSession,
    ChatStructuredListItem,
    ChatStructuredStatItem,
    ChatStructuredView,
    ChatType,
    QuickQuestionView,
} from "../../../types/Chat";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { chatService } from "../../../services/chat.service";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useNavigate } from "react-router-dom";

interface ChatContentProps {
    session: ChatSession;
    messages: ChatMessage[];
    input: string;
    setInput: (v: string) => void;
    onSend: (override?: {
        text?: string;
        clientContext?: Record<string, unknown>;
        routeContext?: ChatRouteContext;
    }) => void | Promise<void>;
    onTypeSelect: (t: ChatType) => void;
    selectedType: ChatType;
    questionTypes: { value: ChatType; label: string }[];
    loadingMessages: boolean;
    isBotTyping: boolean;
    onBack: () => void;
    contextQuestion?: { id: string; text: string } | null;
    onClearContext?: () => void;
}

function QuickQuestionAnswerCard({ view }: { view: QuickQuestionView }) {
    const statusConfig = {
        correct: { icon: "✓", color: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
        wrong: { icon: "×", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
        skipped: { icon: "!", color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
    }[view.status];

    const answerTile = (label: string, value: string, tone: "user" | "correct") => (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                border: "1px solid",
                borderColor: tone === "correct" ? "#bbf7d0" : "#dbeafe",
                bgcolor: tone === "correct" ? "#f0fdf4" : "#eff6ff",
                borderRadius: 2,
                p: 1,
            }}
        >
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#64748b", mb: 0.35 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#0f172a", lineHeight: 1.35 }}>
                {value}
            </Typography>
        </Box>
    );

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 260,
                maxWidth: 340,
                border: "1px solid #dbeafe",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#ffffff",
            }}
        >
            <Box
                sx={{
                    px: 1.5,
                    py: 1.1,
                    borderBottom: "1px solid #e2e8f0",
                    bgcolor: statusConfig.bg,
                    color: statusConfig.color,
                }}
            >
                <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
                    {statusConfig.icon} {view.questionLabel} · {view.statusText}
                </Typography>
            </Box>

            <Box sx={{ p: 1.5 }}>
                <Box sx={{ display: "flex", gap: 1, mb: 1.4 }}>
                    {answerTile("Bạn chọn", view.userAnswer, "user")}
                    {answerTile("Đáp án đúng", view.correctAnswer, "correct")}
                </Box>

                {view.explanation ? (
                    <Box sx={{ mb: 1.35 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.5 }}>
                            Giải thích
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.55, whiteSpace: "pre-line" }}>
                            {view.explanation}
                        </Typography>
                    </Box>
                ) : null}

                {view.vocabulary?.length ? (
                    <Box sx={{ mb: 1.35 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.5 }}>
                            Từ vựng
                        </Typography>
                        <Box sx={{ display: "grid", gap: 0.45 }}>
                            {view.vocabulary.map((item, index) => (
                                <Box
                                    key={`${item.word}-${index}`}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "minmax(85px, 1fr) 1.25fr",
                                        gap: 1,
                                        fontSize: 12.5,
                                        color: "#334155",
                                    }}
                                >
                                    <Typography sx={{ fontSize: "inherit", fontWeight: 800, color: "#0f172a" }}>
                                        {item.word}{item.pos ? ` (${item.pos})` : ""}
                                    </Typography>
                                    <Typography sx={{ fontSize: "inherit" }}>{item.meaning}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ) : null}

                {view.reminder ? (
                    <Box
                        sx={{
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            p: 1,
                        }}
                    >
                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.35 }}>
                            Cần nhớ
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                            {view.reminder}
                        </Typography>
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
}

function FormattedQuickQuestionAnswerCard({ view }: { view: QuickQuestionView }) {
    const statusConfig = {
        correct: { icon: "✓", color: "#047857", bg: "#ecfdf5", border: "#a7f3d0" },
        wrong: { icon: "×", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
        skipped: { icon: "!", color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
    }[view.status];

    const answerTile = (label: string, value: string, tone: "user" | "correct") => (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                border: "1px solid",
                borderColor: tone === "correct" ? "#bbf7d0" : "#dbeafe",
                bgcolor: tone === "correct" ? "#f0fdf4" : "#eff6ff",
                borderRadius: 2,
                p: 1,
            }}
        >
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#64748b", mb: 0.35 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#0f172a", lineHeight: 1.35 }}>
                {value}
            </Typography>
        </Box>
    );

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 260,
                maxWidth: 360,
                border: "1px solid #dbeafe",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#ffffff",
            }}
        >
            <Box
                sx={{
                    px: 1.5,
                    py: 1.1,
                    borderBottom: "1px solid #e2e8f0",
                    bgcolor: statusConfig.bg,
                    color: statusConfig.color,
                }}
            >
                <Typography sx={{ fontWeight: 900, fontSize: 14 }}>
                    {statusConfig.icon} {view.questionLabel} · {view.statusText}
                </Typography>
            </Box>

            <Box sx={{ p: 1.5 }}>
                <Box sx={{ display: "flex", gap: 1, mb: 1.4 }}>
                    {answerTile("Bạn chọn", view.userAnswer, "user")}
                    {answerTile("Đáp án đúng", view.correctAnswer, "correct")}
                </Box>

                {view.explanation ? (
                    <Box sx={{ mb: 1.35 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.5 }}>
                            Giải thích
                        </Typography>
                        <MarkdownPreview
                            className="chat-markdown-compact quick-question-markdown"
                            source={view.explanation}
                            style={{
                                background: "transparent",
                                color: "#334155",
                                fontSize: 13,
                                fontFamily: "inherit",
                                padding: 0,
                            }}
                            wrapperElement={{
                                "data-color-mode": "light"
                            }}
                        />
                    </Box>
                ) : null}

                {view.vocabulary?.length ? (
                    <Box sx={{ mb: 1.35 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.5 }}>
                            Từ vựng
                        </Typography>
                        <Box sx={{ display: "grid", gap: 0.55 }}>
                            {view.vocabulary.map((item, index) => (
                                <Box
                                    key={`${item.word}-${index}`}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "minmax(85px, 1fr) 1.25fr",
                                        gap: 1,
                                        fontSize: 12.5,
                                        color: "#334155",
                                    }}
                                >
                                    <Typography sx={{ fontSize: "inherit", fontWeight: 800, color: "#0f172a" }}>
                                        {item.word}{item.pos ? ` (${item.pos})` : ""}
                                    </Typography>
                                    <Typography sx={{ fontSize: "inherit", lineHeight: 1.45 }}>{item.meaning}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ) : null}

                {view.reminder ? (
                    <Box
                        sx={{
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            p: 1,
                        }}
                    >
                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.35 }}>
                            Cần nhớ
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                            {view.reminder}
                        </Typography>
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
}

const structuredTone = {
    default: { bg: "#f8fafc", border: "#e2e8f0", color: "#334155" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#047857" },
    warning: { bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
    danger: { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
    info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
} as const;

function toneStyle(tone?: ChatStructuredStatItem["tone"]) {
    return structuredTone[tone ?? "default"];
}

function StructuredCardFrame({
    title,
    subtitle,
    children,
    tone = "info",
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
    tone?: keyof typeof structuredTone;
}) {
    const colors = toneStyle(tone);

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 270,
                maxWidth: 380,
                border: "1px solid #dbeafe",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#ffffff",
            }}
        >
            <Box
                sx={{
                    px: 1.5,
                    py: 1.1,
                    borderBottom: "1px solid #e2e8f0",
                    bgcolor: colors.bg,
                }}
            >
                <Typography sx={{ fontWeight: 900, fontSize: 14, color: colors.color, lineHeight: 1.35 }}>
                    {title}
                </Typography>
                {subtitle ? (
                    <Typography sx={{ mt: 0.3, fontSize: 12.5, color: "#64748b", lineHeight: 1.35 }}>
                        {subtitle}
                    </Typography>
                ) : null}
            </Box>
            <Box sx={{ p: 1.5 }}>{children}</Box>
        </Box>
    );
}

function StructuredStats({ stats }: { stats?: ChatStructuredStatItem[] }) {
    if (!stats?.length) return null;

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1, mb: 1.4 }}>
            {stats.map((item, index) => {
                const colors = toneStyle(item.tone);
                return (
                    <Box
                        key={`${item.label}-${index}`}
                        sx={{
                            minWidth: 0,
                            border: "1px solid",
                            borderColor: colors.border,
                            bgcolor: colors.bg,
                            borderRadius: 2,
                            p: 1,
                        }}
                    >
                        <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#64748b", mb: 0.3 }}>
                            {item.label}
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 900, color: colors.color, lineHeight: 1.25 }}>
                            {item.value}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}

function StructuredList({
    title,
    items,
}: {
    title: string;
    items?: ChatStructuredListItem[];
}) {
    if (!items?.length) return null;

    return (
        <Box sx={{ mb: 1.35 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.55 }}>
                {title}
            </Typography>
            <Box sx={{ display: "grid", gap: 0.55 }}>
                {items.map((item, index) => {
                    const colors = toneStyle(item.tone);
                    return (
                        <Box
                            key={`${item.label}-${index}`}
                            sx={{
                                border: "1px solid",
                                borderColor: colors.border,
                                bgcolor: colors.bg,
                                borderRadius: 2,
                                px: 1,
                                py: 0.8,
                            }}
                        >
                            <Typography sx={{ fontSize: 12.5, fontWeight: 900, color: colors.color, lineHeight: 1.35 }}>
                                {item.label}
                            </Typography>
                            {item.value ? (
                                <Typography sx={{ mt: 0.2, fontSize: 12.5, color: "#334155", lineHeight: 1.4 }}>
                                    {item.value}
                                </Typography>
                            ) : null}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}

function StructuredMarkdown({ source }: { source?: string }) {
    if (!source) return null;

    return (
        <MarkdownPreview
            className="chat-markdown-compact structured-chat-markdown"
            source={source}
            style={{
                background: "transparent",
                color: "#334155",
                fontSize: 13,
                fontFamily: "inherit",
                padding: 0,
            }}
            wrapperElement={{
                "data-color-mode": "light"
            }}
        />
    );
}

function normalizeStructuredLabel(value?: string) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
}

function findStructuredStat(stats: ChatStructuredStatItem[] | undefined, keywords: string[]) {
    return stats?.find((item) => {
        const label = normalizeStructuredLabel(item.label);
        return keywords.some((keyword) => label.includes(keyword));
    });
}

function getProfileInitials(name?: string) {
    const words = (name ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!words.length) return "U";
    const first = words[0]?.[0] ?? "";
    const last = words.length > 1 ? words[words.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
}

function splitUserProfileHighlights(items?: ChatStructuredListItem[]) {
    const profileItems: ChatStructuredListItem[] = [];
    const learningItems: ChatStructuredListItem[] = [];

    items?.forEach((item) => {
        const label = normalizeStructuredLabel(item.label);
        if (
            label.includes("muc tieu") ||
            label.includes("diem") ||
            label.includes("hoc") ||
            label.includes("streak")
        ) {
            learningItems.push(item);
            return;
        }
        profileItems.push(item);
    });

    return { profileItems, learningItems };
}

function StructuredChatViewCard({
    view,
    onAction,
}: {
    view: ChatStructuredView;
    onAction?: (action: ChatAction) => void | Promise<void>;
}) {
    if (view.type === "progress_summary") {
        const weakPartItems = view.weakParts?.map((part) => ({ label: part, tone: "warning" as const }));
        return (
            <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone="info">
                <StructuredStats stats={view.stats} />
                <StructuredList title="Điểm nổi bật" items={view.highlights} />
                <StructuredList title="Phần cần ưu tiên" items={weakPartItems} />
                {view.nextStep ? (
                    <Box sx={{ borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", p: 1 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.35 }}>
                            Bước tiếp theo
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                            {view.nextStep}
                        </Typography>
                    </Box>
                ) : null}
            </StructuredCardFrame>
        );
    }

    if (view.type === "ability_map_summary") {
        return (
            <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone="info">
                <StructuredStats stats={view.stats} />
                <Box sx={{ display: "grid", gap: 1.05 }}>
                    {view.parts.map((part) => (
                        <Box
                            key={part.label}
                            sx={{
                                border: "1px solid #dbeafe",
                                bgcolor: part.isFocusPart ? "#eff6ff" : "#f8fafc",
                                borderRadius: 2,
                                p: 1,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>
                                    {part.label}
                                </Typography>
                                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#ea580c" }}>
                                    {part.abilityPercent}%
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.15 }}>
                                {[part.domain, part.status, part.trend].filter(Boolean).join(" • ")}
                            </Typography>
                            <Box sx={{ mt: 0.8, height: 7, borderRadius: 999, bgcolor: "#e2e8f0", overflow: "hidden" }}>
                                <Box
                                    sx={{
                                        width: `${Math.max(0, Math.min(100, part.abilityPercent))}%`,
                                        height: "100%",
                                        bgcolor: "#f97316",
                                    }}
                                />
                            </Box>
                        </Box>
                    ))}
                </Box>
                <StructuredList title="Điểm nổi bật" items={view.highlights} />
            </StructuredCardFrame>
        );
    }

    if (view.type === "test_attempt_analysis") {
        return (
            <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone="success">
                <StructuredStats stats={view.stats} />
                <StructuredList title="Kỹ năng yếu" items={view.weakTags} />
                <StructuredList title="Câu sai tiêu biểu" items={view.wrongAnswers} />
                <StructuredMarkdown source={view.summary} />
            </StructuredCardFrame>
        );
    }

    if (view.type === "user_profile_identity") {
        const nameStat = findStructuredStat(view.stats, ["ten", "name"]);
        const emailStat = findStructuredStat(view.stats, ["email"]);
        const statusStat = findStructuredStat(view.stats, ["trang thai", "status"]);
        const displayName = nameStat?.value || "Người dùng hiện tại";
        const secondaryStats = view.stats.filter(
            (item) => item !== nameStat && item !== emailStat && item !== statusStat
        );
        const { profileItems, learningItems } = splitUserProfileHighlights(view.highlights);
        const hasDetails = Boolean(view.stats.length || view.highlights?.length);

        return (
            <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone="info">
                {hasDetails ? (
                    <>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "40px minmax(0, 1fr)",
                                alignItems: "center",
                                gap: 1.15,
                                border: "1px solid #dbeafe",
                                bgcolor: "#f8fbff",
                                borderRadius: 2,
                                p: 1.1,
                                mb: 1.35,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "#2563eb",
                                    color: "#ffffff",
                                    fontSize: 13,
                                    fontWeight: 900,
                                    flexShrink: 0,
                                }}
                            >
                                {getProfileInitials(displayName)}
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                    sx={{
                                        fontSize: 13.5,
                                        fontWeight: 900,
                                        color: "#0f172a",
                                        lineHeight: 1.3,
                                        wordBreak: "normal",
                                        overflowWrap: "break-word",
                                    }}
                                >
                                    {displayName}
                                </Typography>
                                {emailStat?.value ? (
                                    <Typography
                                        sx={{
                                            mt: 0.2,
                                            fontSize: 12,
                                            color: "#475569",
                                            lineHeight: 1.35,
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {emailStat.value}
                                    </Typography>
                                ) : null}
                                {statusStat?.value ? (
                                    <Box
                                        sx={{
                                            display: "inline-flex",
                                            maxWidth: "100%",
                                            mt: 0.65,
                                            border: "1px solid #bfdbfe",
                                            bgcolor: "#ffffff",
                                            color: "#1d4ed8",
                                            borderRadius: 999,
                                            px: 0.85,
                                            py: 0.4,
                                            fontSize: 10.5,
                                            fontWeight: 900,
                                            lineHeight: 1.2,
                                            whiteSpace: "normal",
                                        }}
                                    >
                                        {statusStat.value}
                                    </Box>
                                ) : null}
                            </Box>
                        </Box>
                        <StructuredStats stats={secondaryStats} />
                        <StructuredList title="Hồ sơ" items={profileItems} />
                        <StructuredList title="Học tập" items={learningItems} />
                    </>
                ) : (
                    <Box sx={{ borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", p: 1 }}>
                        <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                            Chưa có đủ dữ liệu hồ sơ để hiển thị.
                        </Typography>
                    </Box>
                )}
            </StructuredCardFrame>
        );
    }

    if (view.type === "question_context") {
        const tone =
            view.status === "correct" ? "success" :
                view.status === "wrong" ? "danger" :
                    view.status === "skipped" ? "warning" : "info";
        return (
            <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone={tone}>
                <StructuredStats stats={view.stats} />
                {view.questionText ? (
                    <Box sx={{ mb: 1.35 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.45 }}>
                            Câu hỏi
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                            {view.questionText}
                        </Typography>
                    </Box>
                ) : null}
                <Box sx={{ display: "flex", gap: 1, mb: 1.35 }}>
                    {view.userAnswer ? (
                        <Box sx={{ flex: 1, minWidth: 0, border: "1px solid #dbeafe", bgcolor: "#eff6ff", borderRadius: 2, p: 1 }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#64748b", mb: 0.35 }}>
                                Bạn chọn
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#0f172a", lineHeight: 1.35 }}>
                                {view.userAnswer}
                            </Typography>
                        </Box>
                    ) : null}
                    {view.correctAnswer ? (
                        <Box sx={{ flex: 1, minWidth: 0, border: "1px solid #bbf7d0", bgcolor: "#f0fdf4", borderRadius: 2, p: 1 }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#64748b", mb: 0.35 }}>
                                Đáp án đúng
                            </Typography>
                            <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#047857", lineHeight: 1.35 }}>
                                {view.correctAnswer}
                            </Typography>
                        </Box>
                    ) : null}
                </Box>
                <StructuredMarkdown source={view.answer} />
                {view.reminder ? (
                    <Box sx={{ mt: 1.35, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", p: 1 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#1e40af", mb: 0.35 }}>
                            Cần nhớ
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                            {view.reminder}
                        </Typography>
                    </Box>
                ) : null}
            </StructuredCardFrame>
        );
    }

    if (view.type === "similar_practice_recommendations") {
        return (
            <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone="success">
                <StructuredList
                    title="Tag liên quan"
                    items={view.sourceTags.slice(0, 4).map((tag) => ({ label: tag, tone: "info" as const }))}
                />
                <Box sx={{ display: "grid", gap: 1.1 }}>
                    {view.items.map((item) => (
                        <Box key={item.lessonManagerId} sx={{ border: "1px solid #dbeafe", borderRadius: 2, p: 1, bgcolor: "#f8fafc" }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>
                                {item.title}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.25 }}>
                                {[
                                    item.part ? `Part ${item.part}` : "",
                                    typeof item.fitScore === "number" ? `Phù hợp ${Math.round(item.fitScore * 100)}%` : "",
                                ].filter(Boolean).join(" • ")}
                            </Typography>
                            {item.targetTags.length ? (
                                <Typography sx={{ fontSize: 12, color: "#1e40af", mt: 0.5, lineHeight: 1.35 }}>
                                    {item.targetTags.slice(0, 3).join(", ")}
                                </Typography>
                            ) : null}
                            <Box sx={{ display: "grid", gap: 0.7, mt: 0.9 }}>
                                {item.activities.map((activity) => (
                                    <Box
                                        key={`${item.lessonManagerId}-${activity.id}`}
                                        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}
                                    >
                                        <Typography sx={{ fontSize: 12.5, color: "#334155", minWidth: 0 }}>
                                            {activity.title}
                                            {activity.estimatedMinutes ? ` • ${activity.estimatedMinutes} phút` : ""}
                                        </Typography>
                                        <button
                                            className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shrink-0"
                                            onClick={() => onAction?.(activity.action)}
                                        >
                                            Luyện ngay
                                        </button>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </StructuredCardFrame>
        );
    }

    if (view.type === "lesson_recommendations") {
        const hasItems = view.items.length > 0;
        return (
            <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone="success">
                {view.sourceTags.length ? (
                    <StructuredList
                        title="Theo yêu cầu"
                        items={view.sourceTags.slice(0, 5).map((tag) => ({ label: tag, tone: "info" as const }))}
                    />
                ) : null}
                {hasItems ? (
                    <Box sx={{ display: "grid", gap: 1.1 }}>
                        {view.items.map((item) => (
                            <Box
                                key={item.lessonManagerId}
                                sx={{
                                    border: "1px solid #bfdbfe",
                                    borderRadius: 2,
                                    p: 1.05,
                                    bgcolor: "#f8fbff",
                                    minWidth: 0,
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#0f172a", lineHeight: 1.35 }}>
                                            {item.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11.5, color: "#64748b", mt: 0.25, lineHeight: 1.35 }}>
                                            {[
                                                item.part ? `Part ${item.part}` : "",
                                                typeof item.fitScore === "number" ? `Phù hợp ${Math.round(item.fitScore * 100)}%` : "",
                                                item.estimatedMinutes ? `${item.estimatedMinutes} phút` : "",
                                            ].filter(Boolean).join(" - ")}
                                        </Typography>
                                    </Box>
                                </Box>
                                {item.targetTags.length ? (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.45, mt: 0.8 }}>
                                        {item.targetTags.slice(0, 4).map((tag) => (
                                            <Box
                                                key={`${item.lessonManagerId}-${tag}`}
                                                sx={{
                                                    maxWidth: "100%",
                                                    border: "1px solid #dbeafe",
                                                    bgcolor: "#ffffff",
                                                    color: "#1d4ed8",
                                                    borderRadius: 999,
                                                    px: 0.75,
                                                    py: 0.25,
                                                    fontSize: 10.5,
                                                    fontWeight: 800,
                                                    overflowWrap: "anywhere",
                                                }}
                                            >
                                                {tag}
                                            </Box>
                                        ))}
                                    </Box>
                                ) : null}
                                {item.reason ? (
                                    <Typography sx={{ fontSize: 12, color: "#334155", mt: 0.75, lineHeight: 1.4 }}>
                                        {item.reason}
                                    </Typography>
                                ) : null}
                                <Box sx={{ display: "grid", gap: 0.7, mt: 0.95 }}>
                                    {item.activities.map((activity) => (
                                        <Box
                                            key={`${item.lessonManagerId}-${activity.id}`}
                                            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, minWidth: 0 }}
                                        >
                                            <Typography sx={{ fontSize: 12.3, color: "#334155", minWidth: 0, overflowWrap: "anywhere" }}>
                                                {activity.title}
                                                {activity.estimatedMinutes ? ` - ${activity.estimatedMinutes} phút` : ""}
                                            </Typography>
                                            <button
                                                className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shrink-0"
                                                onClick={() => onAction?.(activity.action)}
                                            >
                                                {activity.type === "lesson" ? "Học ngay" : "Luyện ngay"}
                                            </button>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", p: 1 }}>
                        <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.45 }}>
                            Chưa có bài học phù hợp để hiển thị.
                        </Typography>
                    </Box>
                )}
            </StructuredCardFrame>
        );
    }

    if (view.type === "flashcard_supply") {
        const policyLabels: Record<typeof view.policyReason, string> = {
            DB_ENOUGH: "Đủ từ từ kho hệ thống",
            FILL_FROM_GEMINI: "Đã bổ sung bằng AI",
            STRICT_SOURCE_LIMIT: "Chỉ lấy từ trong ngữ cảnh",
            PARTIAL_DB_ONLY: "Tạo tạm từ kho hệ thống",
            PARTIAL_AFTER_GENERATION: "Tạo tạm sau khi lọc AI",
            REUSED_EXISTING_DECK: "Đã dùng lại bộ vừa tạo",
        };
        return (
            <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone="success">
                <StructuredStats
                    stats={[
                        { label: "Số từ", value: `${view.returnedCount}/${view.requestedCount}`, tone: "success" },
                        { label: "Kho hệ thống", value: String(view.suppliedBy.systemCatalog ?? 0), tone: "info" },
                        { label: "AI bổ sung", value: String(view.suppliedBy.gemini ?? 0), tone: "warning" },
                        { label: "Trạng thái", value: policyLabels[view.policyReason] ?? view.policyReason, tone: "default" },
                    ]}
                />
                {view.words.length ? (
                    <Box sx={{ display: "grid", gap: 0.65, mb: 1.1 }}>
                        {view.words.slice(0, 6).map((word) => (
                            <Box key={`${word.word}-${word.type ?? ""}`} sx={{ border: "1px solid #dbeafe", borderRadius: 2, p: 1, bgcolor: "#f8fafc" }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#0f172a" }}>
                                    {word.word}{word.type ? ` · ${word.type}` : ""}
                                </Typography>
                                {word.definition ? (
                                    <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.25, lineHeight: 1.35 }}>
                                        {word.definition}
                                    </Typography>
                                ) : null}
                            </Box>
                        ))}
                    </Box>
                ) : null}
                <button
                    className="w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    onClick={() => onAction?.(view.action)}
                >
                    Học ngay
                </button>
            </StructuredCardFrame>
        );
    }

    if (view.type === "navigation_support") {
        return (
            <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone="info">
                <StructuredList title="Có thể mở nhanh" items={view.items} />
            </StructuredCardFrame>
        );
    }

    return (
        <StructuredCardFrame title={view.title} subtitle={view.subtitle} tone={view.tone ?? "warning"}>
            <StructuredMarkdown source={view.message} />
        </StructuredCardFrame>
    );
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
    const navigate = useNavigate();

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
            console.error("Lỗi gửi phản hồi:", err);
        }
    };

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1500);
        } catch (err) {
            console.error("Không thể sao chép nội dung:", err);
        }
    };

    const handleEditStart = (msg: ChatMessage) => {
        setEditingId(msg._id);
        setEditText(msg.text);
    };

    const handleEditSave = async () => {
        if (!editText.trim()) return;
        try {
            // await chatService.updateMessage({ messageId: id, text: editText });
        } catch (err) {
            console.error("Không thể lưu chỉnh sửa:", err);
        } finally {
            setEditingId(null);
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditText("");
    };

    const buildQuery = (payload: Record<string, unknown>) => {
        const params = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") return;
            params.set(key, Array.isArray(value) ? value.join(",") : String(value));
        });
        const query = params.toString();
        return query ? `?${query}` : "";
    };

    const handleChatAction = async (msg: ChatMessage, action: ChatAction) => {
        try {
            await chatService.logActionClick({
                messageId: msg._id,
                actionType: action.type,
                payload: action.payload ?? {},
            });
        } catch (err) {
            console.error("Không thể ghi nhận thao tác chat:", err);
        }

        const payload = action.payload ?? {};
        if (action.type === "select_clarify_option") {
            const originalUserText = typeof payload.originalUserText === "string"
                ? payload.originalUserText.trim()
                : "";
            if (payload.manualInput) {
                setInput(originalUserText);
                return;
            }

            const selectedRouteContext = payload.selectedRouteContext as ChatRouteContext | undefined;
            if (!originalUserText || !selectedRouteContext) {
                if (originalUserText) setInput(originalUserText);
                return;
            }

            await onSend({
                text: originalUserText,
                routeContext: selectedRouteContext,
                clientContext: {
                    sourceAction: "select_clarify_option",
                    actionPayload: {
                        optionReason: payload.optionReason,
                        previousIntentId: payload.previousIntentId,
                        optionConfidence: payload.optionConfidence,
                    },
                },
            });
            return;
        }

        if (action.type === "open_question_review" && payload.testId && payload.attemptId) {
            const query = buildQuery({
                questionId: payload.questionId,
                focusTs: Date.now(),
            });
            navigate(`/tests/${payload.testId}/result/${payload.attemptId}/answers${query}`);
            return;
        }

        if (action.type === "review_mistakes" && payload.testId && payload.attemptId) {
            navigate(`/tests/${payload.testId}/result/${payload.attemptId}/answers`);
            return;
        }

        if (action.type === "show_roadmap") {
            navigate("/programs");
            return;
        }

        if (action.type === "open_flashcards") {
            navigate("/flash-cards");
            return;
        }

        if (action.type === "open_flashcard_deck" && payload.topicVocabularyId) {
            navigate(`/flash-cards/${payload.topicVocabularyId}/practice`);
            return;
        }

        if (action.type === "open_lesson") {
            const route = typeof payload.route === "string" && payload.route ? String(payload.route) : "/programs";
            navigate(`${route}${buildQuery({
                lessonManagerId: payload.lessonManagerId,
                activityId: payload.activityId,
                part: payload.part,
            })}`);
            return;
        }

        if (action.type === "recommend_similar_practice") {
            await onSend({
                text: "Gợi ý bài luyện tương tự",
                clientContext: {
                    sourceAction: "recommend_similar_practice",
                    actionPayload: payload,
                },
            });
            return;
        }

        if (action.type === "start_practice") {
            if (payload.activityType && payload.activityId) {
                const activityType = String(payload.activityType);
                const activityId = String(payload.activityId);
                if (activityType === "lesson") {
                    navigate(`/programs${buildQuery({
                        lessonManagerId: payload.lessonManagerId,
                        activityId,
                        part: payload.part,
                    })}`);
                    return;
                }
                if (activityType === "dictation") {
                    navigate(`/practice-skill/dictation/${activityId}`);
                    return;
                }
                if (activityType === "shadowing") {
                    navigate(`/practice-skill/shadowing/${activityId}`);
                    return;
                }
                if (activityType === "quiz") {
                    navigate(`/practice-skill/quiz/${activityId}`);
                    return;
                }
                if (activityType === "vocabulary") {
                    navigate(`/flash-cards/${activityId}/practice`);
                    return;
                }
            }
            navigate(`/practice-skill${buildQuery({
                part: payload.part,
                tags: payload.tags,
                sourceQuestionId: payload.sourceQuestionId,
            })}`);
            return;
        }

        if (action.type === "replay_audio") {
            window.dispatchEvent(new CustomEvent("chatbot:replay-audio", { detail: payload }));
            return;
        }

        if (action.type === "request_roadmap_recompute") {
            navigate(`/programs${buildQuery({ requestRoadmapRecompute: "true", ...payload })}`);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <GlobalStyles
                styles={{
                    ".chat-markdown-compact.wmde-markdown": {
                        whiteSpace: "normal",
                        lineHeight: 1.45,
                    },
                    ".chat-markdown-compact.wmde-markdown p": {
                        margin: "0 0 0.45em",
                    },
                    ".chat-markdown-compact.wmde-markdown p:last-child": {
                        marginBottom: 0,
                    },
                    ".chat-markdown-compact.wmde-markdown ul, .chat-markdown-compact.wmde-markdown ol": {
                        margin: "0.25em 0 0.45em",
                        paddingLeft: "1.1em",
                    },
                    ".chat-markdown-compact.wmde-markdown li": {
                        margin: "0.15em 0",
                    },
                    ".quick-question-markdown.wmde-markdown strong": {
                        color: "#1e40af",
                        fontWeight: 900,
                    },
                    ".structured-chat-markdown.wmde-markdown strong": {
                        color: "#1e40af",
                        fontWeight: 900,
                    },
                    ".chat-markdown-compact.wmde-markdown h1, .chat-markdown-compact.wmde-markdown h2, .chat-markdown-compact.wmde-markdown h3": {
                        fontSize: "1em",
                        lineHeight: 1.35,
                        margin: "0 0 0.4em",
                    },
                }}
            />
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
                    {`Phiên chat: ${session.title}`}
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
                                                    if (e.key === "Enter") handleEditSave();
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
                                                    whiteSpace: isUser ? "pre-wrap" : "normal",
                                                    textAlign: "left"
                                                }}
                                            >
                                                {isUser ? (
                                                    // User messages: plain text
                                                    msg.text
                                                ) : msg.meta?.quickQuestionView ? (
                                                    <FormattedQuickQuestionAnswerCard view={msg.meta.quickQuestionView} />
                                                ) : msg.meta?.structuredView ? (
                                                    <StructuredChatViewCard
                                                        view={msg.meta.structuredView}
                                                        onAction={(action) => handleChatAction(msg, action)}
                                                    />
                                                ) : (
                                                    // Bot messages: render markdown
                                                    <MarkdownPreview
                                                        className="chat-markdown-compact"
                                                        source={msg.text}
                                                        style={{
                                                            background: "transparent",
                                                            color: "inherit",
                                                            fontSize: "inherit",
                                                            fontFamily: "inherit",
                                                            padding: 0,
                                                        }}
                                                        wrapperElement={{
                                                            "data-color-mode": "light"
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {!isUser && msg.meta?.actions?.length ? (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {msg.meta.actions.map((action) => (
                                                    <Button
                                                        key={action.id}
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleChatAction(msg, action)}
                                                        sx={{
                                                            textTransform: "none",
                                                            borderRadius: "8px",
                                                            fontSize: "0.75rem",
                                                            px: 1.25,
                                                            py: 0.35,
                                                            borderColor: "#bfdbfe",
                                                            color: "#1d4ed8",
                                                            bgcolor: "#fff",
                                                            "&:hover": {
                                                                borderColor: "#60a5fa",
                                                                bgcolor: "#eff6ff",
                                                            },
                                                        }}
                                                    >
                                                        {action.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : null}

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
                                                    <Tooltip title="Chỉnh sửa tin nhắn">
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
                                                        title={copiedId === msg._id ? "Đã sao chép" : "Sao chép vào clipboard"}
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
                                                    <Tooltip title="Câu trả lời tốt">
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
                                                    <Tooltip title="Cần cải thiện">
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
                                                        title={copiedId === msg._id ? "Đã sao chép" : "Sao chép vào clipboard"}
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
