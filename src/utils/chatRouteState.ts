import type { ChatRouteQuestionRef } from "../types/Chat";

export interface ChatRoutePageState {
    questionId?: string;
    attemptId?: string;
    roadmapId?: string;
    nodeId?: string;
    lessonId?: string;
    currentQuestionNumber?: number;
    questionRefs?: ChatRouteQuestionRef[];
}

declare global {
    interface Window {
        __toeicChatRouteState?: ChatRoutePageState;
    }
}

export function setChatRouteState(state: ChatRoutePageState) {
    window.__toeicChatRouteState = state;
}

export function clearChatRouteState() {
    delete window.__toeicChatRouteState;
}

export function getChatRouteState(): ChatRoutePageState {
    return window.__toeicChatRouteState ?? {};
}

export function compactQuestionText(text?: string) {
    return text?.replace(/\s+/g, " ").trim().slice(0, 240) || undefined;
}
