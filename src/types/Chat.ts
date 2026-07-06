import type { ElementType } from "react";

export type ChatSender = "user" | "bot";

export type ChatType =
    | "question"
    | "reading"
    | "shadowing"
    | "dictation"
    | "lesson";

export type ChatFeedback = "like" | "dislike" | null;

export type ChatErrorType =
    | "AUTH_REQUIRED"
    | "SOCKET_DISCONNECTED"
    | "MISSING_CONTEXT"
    | "MISSING_REQUIRED_CONTEXT"
    | "UNAUTHORIZED"
    | "NO_DATA"
    | "NO_USER_DATA"
    | "UNSUPPORTED_CAPABILITY"
    | "LOW_CONFIDENCE"
    | "AI_SERVICE_ERROR"
    | "LEGACY_RETRIEVER_UNAVAILABLE"
    | "VALIDATION_ERROR"
    | "UNKNOWN";

export type ChatRoutePage =
    | "dashboard"
    | "roadmap"
    | "today_plan"
    | "test_practice"
    | "test_result"
    | "question_review"
    | "dictation"
    | "shadowing"
    | "flashcard"
    | "lesson"
    | "unknown";

export interface ChatRouteQuestionRef {
    questionNumber: number;
    questionId: string;
    textPreview?: string;
    attemptId?: string;
    testId?: string;
}

export interface ChatRouteContext {
    page: ChatRoutePage;
    roadmapId?: string;
    nodeId?: string;
    testId?: string;
    attemptId?: string;
    questionId?: string;
    questionNumber?: number;
    currentVisibleQuestionId?: string;
    currentVisibleQuestionNumber?: number;
    selectedQuestionId?: string;
    selectedQuestionNumber?: number;
    lessonId?: string;
    dictationAttemptId?: string;
    shadowingAttemptId?: string;
    currentQuestionNumber?: number;
    questionRefs?: ChatRouteQuestionRef[];
    visibleQuestionRefs?: ChatRouteQuestionRef[];
    currentQuestionIndex?: number;
}

export interface ChatClientContext {
    selectedText?: string;
    currentAudioTime?: number;
    userTimezone?: string;
    sourceAction?: "quick_question_explain" | string;
    actionPayload?: Record<string, unknown>;
    clientRequestId?: string;
    testTitle?: string;
    intentHint?: ChatIntentHint;
}

export type ChatIntentScope =
    | "single_question"
    | "attempt_analysis"
    | "overall_progress"
    | "general_knowledge"
    | "unknown";

export type ChatIntentSource =
    | "rule"
    | "fast_path"
    | "semantic"
    | "follow_up"
    | "fallback";

export type ChatResolverPolicy =
    | "DB_FIRST"
    | "DB_FIRST_AI"
    | "GENERAL_AI"
    | "CLARIFY"
    | "CLARIFY_IF_CONTEXT_MISSING"
    | "NO_DATA"
    | "UNAUTHORIZED"
    | "UNSUPPORTED_CAPABILITY"
    | "LOW_CONFIDENCE"
    | "SAFE_FALLBACK";

export interface ChatIntentHintSlots {
    attemptScope?: "latest" | "current" | "selected" | "explicit";
    parts?: Array<1 | 2 | 3 | 4 | 5 | 6 | 7>;
    comparison?: boolean;
    metric?: "strength" | "weakness" | "error_pattern" | "score_breakdown";
    roadmapRequest?: "navigation" | "status" | "next_step" | "explain_recommendation" | "adjust";
    questionNumber?: number;
}

export interface ChatIntentHint {
    scope: ChatIntentScope;
    intent?: string;
    confidence: number;
    source: ChatIntentSource;
    resolverPolicy: ChatResolverPolicy;
    reasonCodes: string[];
    slots?: ChatIntentHintSlots;
}

export type ChatActionType =
    | "open_question_review"
    | "review_mistakes"
    | "open_test_result"
    | "open_attempt_review"
    | "start_practice"
    | "recommend_similar_practice"
    | "open_lesson"
    | "show_roadmap"
    | "open_flashcards"
    | "open_flashcard_deck"
    | "replay_audio"
    | "request_roadmap_recompute"
    | "select_clarify_option";

export interface ChatAction {
    id: string;
    label: string;
    type: ChatActionType;
    payload: Record<string, unknown>;
}

export interface ChatSession {
    _id: string;
    user_id?: string;
    title: string;
    type: ChatType;
    created_at: string;
    updated_at: string;
    last_message_preview?: string;
    total_messages?: number;
    is_archived?: boolean;
}

export interface ChatMessage {
    _id: string;
    session_id: string;
    sender: ChatSender;
    text: string;
    created_at: string;
    meta?: ChatMessageMeta;
}

export interface QuickQuestionVocabularyItem {
    word: string;
    pos?: string;
    meaning: string;
}

export interface QuickQuestionView {
    questionLabel: string;
    status: "correct" | "wrong" | "skipped";
    statusText: string;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
    vocabulary?: QuickQuestionVocabularyItem[];
    reminder?: string;
}

export interface QuickQuestionContext {
    questionId: string;
    questionNumber?: number;
    attemptId: string;
    testId: string;
    testTitle?: string;
    part?: string;
    questionText?: string;
    choices?: Record<string, unknown>;
    userAnswer?: string;
    userAnswerText?: string;
    correctAnswer?: string;
    correctAnswerText?: string;
    isCorrect?: boolean;
    status: "correct" | "wrong" | "skipped";
}

export interface ChatStructuredStatItem {
    label: string;
    value: string;
    tone?: "default" | "success" | "warning" | "danger" | "info";
}

export interface ChatStructuredListItem {
    label: string;
    value?: string;
    tone?: "default" | "success" | "warning" | "danger" | "info";
}

export type ChatStructuredView =
    | {
        type: "progress_summary";
        title: string;
        subtitle?: string;
        stats: ChatStructuredStatItem[];
        highlights?: ChatStructuredListItem[];
        weakParts?: string[];
        nextStep?: string;
    }
    | {
        type: "ability_map_summary";
        title: string;
        subtitle?: string;
        stats: ChatStructuredStatItem[];
        parts: Array<{
            label: string;
            domain?: string;
            abilityPercent: number;
            status: string;
            trend?: string;
            isFocusPart?: boolean;
        }>;
        highlights?: ChatStructuredListItem[];
    }
    | {
        type: "test_attempt_analysis";
        title: string;
        subtitle?: string;
        stats: ChatStructuredStatItem[];
        weakTags?: ChatStructuredListItem[];
        wrongAnswers?: ChatStructuredListItem[];
        summary?: string;
    }
    | {
        type: "user_profile_identity";
        title: string;
        subtitle?: string;
        stats: ChatStructuredStatItem[];
        highlights?: ChatStructuredListItem[];
    }
    | {
        type: "question_context";
        title: string;
        subtitle?: string;
        status?: "correct" | "wrong" | "skipped" | "neutral";
        stats?: ChatStructuredStatItem[];
        questionText?: string;
        userAnswer?: string;
        correctAnswer?: string;
        answer?: string;
        reminder?: string;
    }
    | {
        type: "similar_practice_recommendations";
        title: string;
        subtitle?: string;
        sourceTags: string[];
        items: Array<{
            lessonManagerId: string;
            title: string;
            part?: number;
            targetTags: string[];
            weight?: number;
            fitScore?: number;
            activities: Array<{
                id: string;
                type: "vocabulary" | "dictation" | "shadowing" | "quiz";
                title: string;
                estimatedMinutes?: number;
                action: ChatAction;
            }>;
        }>;
    }
    | {
        type: "lesson_recommendations";
        title: string;
        subtitle?: string;
        sourceTags: string[];
        items: Array<{
            lessonManagerId: string;
            title: string;
            part?: number;
            targetTags: string[];
            estimatedMinutes?: number;
            fitScore?: number;
            reason?: string;
            activities: Array<{
                id: string;
                type: "lesson" | "vocabulary" | "dictation" | "shadowing" | "quiz";
                title: string;
                estimatedMinutes?: number;
                action: ChatAction;
            }>;
        }>;
    }
    | {
        type: "flashcard_supply";
        title: string;
        subtitle?: string;
        requestedCount: number;
        returnedCount: number;
        suppliedBy: {
            systemCatalog: number;
            gemini: number;
        };
        policyReason:
            | "DB_ENOUGH"
            | "FILL_FROM_GEMINI"
            | "STRICT_SOURCE_LIMIT"
            | "PARTIAL_DB_ONLY"
            | "PARTIAL_AFTER_GENERATION"
            | "REUSED_EXISTING_DECK";
        words: Array<{
            word: string;
            type?: string;
            definition?: string;
            source: "systemCatalog" | "gemini";
        }>;
        action: ChatAction;
    }
    | {
        type: "navigation_support";
        title: string;
        subtitle?: string;
        items: ChatStructuredListItem[];
    }
    | {
        type: "fallback_notice";
        title: string;
        subtitle?: string;
        message: string;
        tone?: "warning" | "danger" | "info";
    };

export interface ChatMessageMeta {
    token_usage?: number;
    model?: string;
    feedback?: ChatFeedback;
    error?: string;
    intent?: string;
    usedAI?: boolean;
    contextType?: string;
    actions?: ChatAction[];
    routeContext?: ChatRouteContext;
    clientContext?: ChatClientContext;
    responseTimeMs?: number;
    errorType?: string;
    fallbackUsed?: boolean;
    quickQuestionView?: QuickQuestionView;
    quickQuestionContext?: QuickQuestionContext;
    structuredView?: ChatStructuredView;
}

export interface PracticeModeOption {
    value: ChatType;
    label: string;
    icon?: ElementType;
}
