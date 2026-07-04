import type {
    ChatClientContext,
    ChatIntentHint,
    ChatIntentHintSlots,
    ChatMessage,
    ChatRouteContext,
} from "../types/Chat";

interface InferChatIntentHintInput {
    userText: string;
    routeContext: ChatRouteContext;
    messages?: ChatMessage[];
    contextQuestionId?: string;
    contextQuestionText?: string;
    selectedText?: string;
}

interface BuildChatPayloadInput {
    userText: string;
    routeContext: ChatRouteContext;
    messages?: ChatMessage[];
    contextQuestion?: { id: string; text: string } | null;
    selectedText?: string;
    clientContext?: Omit<ChatClientContext, "selectedText" | "intentHint">;
}

interface PreparedChatPayload {
    routeContext: ChatRouteContext;
    clientContext: ChatClientContext;
    questionId?: string;
    intentHint: ChatIntentHint;
}

type ConversationFocus = {
    scope: ChatIntentHint["scope"];
    intent?: string;
};

const removeDiacritics = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeText = (value: string) =>
    removeDiacritics(value).toLowerCase().replace(/\s+/g, " ").trim();

const ROADMAP_KEYWORDS = ["lo trinh", "roadmap", "chuong trinh hoc"];
const ROADMAP_NAVIGATION_VERBS = [
    "mo",
    "vao",
    "dua toi toi",
    "dua toi den",
    "di toi",
    "xem trang",
];
const ROADMAP_STATUS_PHRASES = [
    "the nao",
    "toi dau roi",
    "den dau roi",
    "hien tai ra sao",
    "hien tai nhu the nao",
];
const ROADMAP_NEXT_STEP_PHRASES = [
    "hom nay toi nen hoc gi",
    "hom nay nen hoc gi",
    "buoc tiep theo la gi",
    "nen hoc gi tiep",
];
const ROADMAP_REASON_PHRASES = [
    "tai sao he thong chon bai nay",
    "vi sao he thong chon bai nay",
    "tai sao chon bai nay",
    "vi sao chon bai nay",
];
const ROADMAP_ADJUST_PHRASES = [
    "doi lo trinh",
    "giam khoi luong hoc",
    "tang khoi luong hoc",
    "chinh lo trinh",
];
const SINGLE_QUESTION_REFERENCES = [
    "cau nay",
    "doan nay",
    "tu nay",
    "dap an nay",
    "cai nay",
    "passage nay",
    "bai doc nay",
    "trong bai doc",
];

function includesAny(text: string, patterns: string[]) {
    return patterns.some((pattern) => text.includes(pattern));
}

function extractParts(text: string): Array<1 | 2 | 3 | 4 | 5 | 6 | 7> {
    const matches = [...text.matchAll(/\b(?:part|phan)\s*([1-7])\b/g)];
    const unique = new Set(
        matches
            .map((match) => Number(match[1]))
            .filter((value): value is 1 | 2 | 3 | 4 | 5 | 6 | 7 => value >= 1 && value <= 7)
    );
    return [...unique];
}

function extractQuestionNumber(text: string) {
    const match = text.match(/\bcau\s+(\d{1,3})\b/);
    return match ? Number(match[1]) : undefined;
}

function getConversationFocus(messages: ChatMessage[] = []): ConversationFocus | null {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (message.sender !== "bot") continue;

        if (message.meta?.intent === "test_attempt.analysis") {
            return { scope: "attempt_analysis", intent: "test_attempt.analysis" };
        }

        if (message.meta?.intent === "user_progress.ability_map") {
            return { scope: "overall_progress", intent: "user_progress.ability_map" };
        }

        if (message.meta?.intent === "question.explain_specific") {
            return { scope: "single_question", intent: "question.explain_specific" };
        }

        if (message.meta?.intent?.startsWith("roadmap.")) {
            return { scope: "overall_progress", intent: message.meta.intent };
        }

        if (message.meta?.structuredView?.type === "test_attempt_analysis") {
            return { scope: "attempt_analysis", intent: "test_attempt.analysis" };
        }

        if (message.meta?.structuredView?.type === "question_context") {
            return { scope: "single_question", intent: "question.explain_specific" };
        }

        if (message.meta?.structuredView?.type === "progress_summary") {
            return { scope: "overall_progress", intent: "roadmap.summary" };
        }

        if (message.meta?.structuredView?.type === "ability_map_summary") {
            return { scope: "overall_progress", intent: "user_progress.ability_map" };
        }
    }

    return null;
}

function hasAttemptMetric(text: string) {
    return includesAny(text, [
        "sai nhieu",
        "dung nhieu",
        "yeu dang",
        "manh dang",
        "dang nao",
        "sai chu yeu o dau",
        "phan tich",
        "tong ket",
        "so sanh",
    ]);
}

function getAttemptMetric(text: string): ChatIntentHintSlots["metric"] {
    if (includesAny(text, ["dung nhieu", "manh dang"])) return "strength";
    if (includesAny(text, ["sai nhieu", "yeu dang"])) return "weakness";
    if (includesAny(text, ["dang nao", "sai chu yeu o dau"])) return "error_pattern";
    if (includesAny(text, ["tong ket", "score", "diem"])) return "score_breakdown";
    return undefined;
}

function hasAttemptReference(text: string) {
    return includesAny(text, [
        "de gan nhat",
        "bai nay",
        "bai vua lam",
        "bai gan nhat",
        "lan thi gan nhat",
        "test gan nhat",
    ]);
}

function looksLikeGeneralToeicQuestion(text: string) {
    if (hasUserSpecificSignal(text)) return false;
    const toeicDomain =
        /\b(toeic|part\s*[1-7]|phan\s*[1-7]|reading|listening|grammar|ngu phap|vocabulary|tu vung|doc hieu|nghe|de thi|bai thi|cau truc de|format|incomplete sentence|text completion|collocation|thi hien tai|qua khu|tuong lai|danh tu|dong tu|tinh tu|trang tu|gioi tu|menh de|although|despite|because|since|for)\b/.test(text);
    const learningAction =
        /\b(la gi|khac nhau|phan biet|meo|chien luoc|cach hoc|cach lam|lam sao|co may phan|gom may phan|bao nhieu phan|cau truc|format|dinh dang|nen hoc|hoc gi|chu y gi|tang diem|tranh bay|dung the nao|nghia la gi)\b/.test(text) ||
        /\bla\b.{0,40}\bgi\b/.test(text);
    const toeicFormatQuestion =
        /\b(chia|tach|gom|co)\b.*\b(may|bao nhieu)\b.*\b(part|phan)\b/.test(text) ||
        /\b(cau truc|format|dinh dang)\b.*\b(de|bai thi|reading|listening)\b/.test(text) ||
        /\b(reading|listening)\b.*\b(gom|co|chia)\b.*\b(gi|may|nhung gi|phan|part)\b/.test(text);
    return (toeicDomain && learningAction) || toeicFormatQuestion;
}

function hasQuestionBindingSignal(text: string) {
    return /\b(cau nay|cau do|cau\s*\d+|question\s*\d+|dap an nay|doan nay|tu nay|cum nay|bai doc|passage|audio|trong cau nay|trong bai doc)\b/.test(text);
}

function hasUserSpecificSignal(text: string) {
    return (
        hasQuestionBindingSignal(text) ||
        /\b(de gan nhat|bai gan nhat|bai vua lam|lan thi gan nhat|test gan nhat|toi sai|toi dung|diem cua toi|tien do|yeu o dau|phan tich ket qua|ket qua cua toi|cua toi|bai lam cua toi)\b/.test(text)
    );
}

function inferRoadmapIntent(text: string) {
    const mentionsRoadmap = includesAny(text, ROADMAP_KEYWORDS);
    const mentionsNextStep = includesAny(text, ROADMAP_NEXT_STEP_PHRASES);
    const mentionsReason = includesAny(text, ROADMAP_REASON_PHRASES);
    const mentionsAdjust = includesAny(text, ROADMAP_ADJUST_PHRASES);
    const mentionsStatus = mentionsRoadmap && includesAny(text, ROADMAP_STATUS_PHRASES);
    const mentionsNavigation = mentionsRoadmap && includesAny(text, ROADMAP_NAVIGATION_VERBS);

    if (mentionsNavigation) {
        return {
            scope: "overall_progress" as const,
            intent: "roadmap.guidance",
            resolverPolicy: "DB_FIRST" as const,
            slots: { roadmapRequest: "navigation" as const },
            reasonCodes: ["EXPLICIT_ROADMAP_ENTITY", "NAVIGATION_VERB"],
        };
    }

    if (mentionsReason) {
        return {
            scope: "overall_progress" as const,
            intent: "roadmap.explain_recommendation",
            resolverPolicy: "DB_FIRST_AI" as const,
            slots: { roadmapRequest: "explain_recommendation" as const },
            reasonCodes: ["ROADMAP_RECOMMENDATION_WHY"],
        };
    }

    if (mentionsNextStep) {
        return {
            scope: "overall_progress" as const,
            intent: "roadmap.next_step",
            resolverPolicy: "DB_FIRST" as const,
            slots: { roadmapRequest: "next_step" as const },
            reasonCodes: ["ROADMAP_NEXT_STEP_REQUEST"],
        };
    }

    if (mentionsAdjust) {
        return {
            scope: "overall_progress" as const,
            intent: "roadmap.adjust",
            resolverPolicy: "DB_FIRST" as const,
            slots: { roadmapRequest: "adjust" as const },
            reasonCodes: ["ROADMAP_ADJUST_REQUEST"],
        };
    }

    if (mentionsStatus) {
        return {
            scope: "overall_progress" as const,
            intent: "roadmap.summary",
            resolverPolicy: "DB_FIRST" as const,
            slots: { roadmapRequest: "status" as const },
            reasonCodes: ["EXPLICIT_ROADMAP_ENTITY", "STATUS_QUESTION", "NO_NAVIGATION_VERB"],
        };
    }

    return null;
}

export function inferChatIntentHint({
    userText,
    routeContext,
    messages = [],
    contextQuestionId,
    selectedText,
}: InferChatIntentHintInput): ChatIntentHint {
    const text = normalizeText(userText);
    const parts = extractParts(text);
    const questionNumber = extractQuestionNumber(text);
    const conversationFocus = getConversationFocus(messages);
    const isAttemptFollowUp =
        parts.length > 0 &&
        conversationFocus?.scope === "attempt_analysis" &&
        includesAny(text, ["con", "thi sao", "con part"]);

    if (looksLikeGeneralToeicQuestion(text)) {
        return {
            scope: "general_knowledge",
            intent: "toeic_knowledge.general",
            confidence: 0.86,
            source: "rule",
            resolverPolicy: "GENERAL_AI",
            reasonCodes: ["GENERAL_TOEIC_KNOWLEDGE"],
        };
    }

    if (questionNumber) {
        return {
            scope: "single_question",
            intent: "question.explain_specific",
            confidence: 0.98,
            source: "rule",
            resolverPolicy: "DB_FIRST_AI",
            reasonCodes: ["EXPLICIT_QUESTION_NUMBER"],
            slots: { questionNumber },
        };
    }

    const roadmapIntent = inferRoadmapIntent(text);
    if (roadmapIntent) {
        return {
            ...roadmapIntent,
            confidence: 0.95,
            source: "rule",
        };
    }

    if (isAttemptFollowUp) {
        return {
            scope: "attempt_analysis",
            intent: "test_attempt.analysis",
            confidence: 0.84,
            source: "follow_up",
            resolverPolicy: "DB_FIRST",
            reasonCodes: ["FOLLOW_UP_ATTEMPT_ANALYSIS"],
            slots: {
                parts,
                comparison: text.includes("so sanh"),
            },
        };
    }

    if (
        (parts.length > 0 || hasAttemptReference(text)) &&
        (hasAttemptMetric(text) || hasAttemptReference(text))
    ) {
        const reasonCodes = [];
        if (parts.length) reasonCodes.push("PART_FILTER");
        if (hasAttemptReference(text)) reasonCodes.push("ATTEMPT_REFERENCE");
        if (hasAttemptMetric(text)) reasonCodes.push("ATTEMPT_METRIC");

        return {
            scope: "attempt_analysis",
            intent: "test_attempt.analysis",
            confidence: 0.92,
            source: "rule",
            resolverPolicy: "DB_FIRST",
            reasonCodes,
            slots: {
                attemptScope: hasAttemptReference(text) ? "latest" : undefined,
                parts: parts.length ? parts : undefined,
                comparison: text.includes("so sanh"),
                metric: getAttemptMetric(text),
            },
        };
    }

    if (includesAny(text, SINGLE_QUESTION_REFERENCES)) {
        return {
            scope: "single_question",
            intent: "question.explain_specific",
            confidence: contextQuestionId || routeContext.questionId || selectedText ? 0.9 : 0.72,
            source: "rule",
            resolverPolicy: contextQuestionId || routeContext.questionId || selectedText ? "DB_FIRST_AI" : "CLARIFY",
            reasonCodes: ["EXPLICIT_SINGLE_REFERENCE"],
        };
    }

    if (
        conversationFocus?.scope === "single_question" &&
        includesAny(text, ["cau nay", "dap an nay", "doan nay"])
    ) {
        return {
            scope: "single_question",
            intent: "question.explain_specific",
            confidence: 0.8,
            source: "follow_up",
            resolverPolicy: "DB_FIRST_AI",
            reasonCodes: ["FOLLOW_UP_SINGLE_QUESTION"],
        };
    }

    return {
        scope: "unknown",
        confidence: 0.35,
        source: "fallback",
        resolverPolicy: "CLARIFY",
        reasonCodes: ["UNKNOWN_SCOPE"],
    };
}

function stripQuestionResolverFields(routeContext: ChatRouteContext): ChatRouteContext {
    const next = { ...routeContext };
    delete next.questionId;
    delete next.currentQuestionNumber;
    delete next.questionRefs;
    return next;
}

function sanitizeRouteContext(routeContext: ChatRouteContext, intentHint: ChatIntentHint): ChatRouteContext {
    if (intentHint.scope === "single_question") {
        return { ...routeContext };
    }

    if (intentHint.scope === "attempt_analysis") {
        return stripQuestionResolverFields(routeContext);
    }

    const next = stripQuestionResolverFields(routeContext);
    delete next.testId;
    delete next.attemptId;
    delete next.lessonId;
    delete next.dictationAttemptId;
    delete next.shadowingAttemptId;
    return next;
}

function resolveQuestionId(
    intentHint: ChatIntentHint,
    contextQuestion?: { id: string; text: string } | null,
    routeContext?: ChatRouteContext
) {
    if (intentHint.scope !== "single_question") return undefined;
    return contextQuestion?.id || routeContext?.questionId;
}

function resolveSelectedText(
    intentHint: ChatIntentHint,
    contextQuestion?: { id: string; text: string } | null,
    selectedText?: string
) {
    if (intentHint.scope !== "single_question") return undefined;
    return contextQuestion?.text || selectedText || undefined;
}

export function prepareChatPayload({
    userText,
    routeContext,
    messages = [],
    contextQuestion,
    selectedText,
    clientContext = {},
}: BuildChatPayloadInput): PreparedChatPayload {
    const intentHint = inferChatIntentHint({
        userText,
        routeContext,
        messages,
        contextQuestionId: contextQuestion?.id,
        contextQuestionText: contextQuestion?.text,
        selectedText,
    });

    return {
        questionId: resolveQuestionId(intentHint, contextQuestion, routeContext),
        routeContext: sanitizeRouteContext(routeContext, intentHint),
        clientContext: {
            ...clientContext,
            selectedText: resolveSelectedText(intentHint, contextQuestion, selectedText),
            intentHint,
        },
        intentHint,
    };
}
