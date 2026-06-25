import type { ChatRouteContext } from "../types/Chat";
import type { ChatRoutePageState } from "./chatRouteState";

type RouteParams = Record<string, string | undefined>;

interface BuildRouteContextInput {
    pathname: string;
    search?: string;
    params?: RouteParams;
    pageState?: ChatRoutePageState;
}

function fromQuery(search: string | undefined, key: string) {
    if (!search) return undefined;
    return new URLSearchParams(search).get(key) ?? undefined;
}

export function buildRouteContext({
    pathname,
    search,
    params = {},
    pageState = {},
}: BuildRouteContextInput): ChatRouteContext {
    const attemptId =
        pageState.attemptId ??
        params.historyId ??
        params.attemptId ??
        fromQuery(search, "attemptId") ??
        fromQuery(search, "historyId");
    const testId = params.testId ?? fromQuery(search, "testId");

    const questionId =
        pageState.questionId ??
        params.questionId ??
        fromQuery(search, "questionId");
    const questionState = {
        currentQuestionNumber: pageState.currentQuestionNumber,
        questionRefs: pageState.questionRefs,
    };

    if (pathname === "/test") {
        return {
            page: "test_practice",
            testId,
            questionId,
            ...questionState,
        };
    }

    if (/\/tests\/[^/]+\/result\/[^/]+\/answers/.test(pathname)) {
        return {
            page: "question_review",
            testId,
            attemptId,
            questionId,
            ...questionState,
        };
    }

    if (/\/tests\/[^/]+\/result\/[^/]+/.test(pathname)) {
        return {
            page: "test_result",
            testId,
            attemptId,
            questionId,
            ...questionState,
        };
    }

    if (pathname === "/home" || pathname === "/result-statistic") {
        return { page: "dashboard" };
    }

    if (pathname === "/study-calendar" || pathname === "/programs") {
        return {
            page: "roadmap",
            roadmapId: pageState.roadmapId ?? params.roadmapId ?? fromQuery(search, "roadmapId"),
            nodeId: pageState.nodeId ?? params.nodeId ?? fromQuery(search, "nodeId"),
        };
    }

    if (pathname.startsWith("/practice-skill/dictation")) {
        return {
            page: "dictation",
            lessonId: pageState.lessonId ?? params.id,
            dictationAttemptId: fromQuery(search, "dictationAttemptId"),
        };
    }

    if (pathname.startsWith("/practice-skill/shadowing")) {
        return {
            page: "shadowing",
            lessonId: pageState.lessonId ?? params.id,
            shadowingAttemptId: fromQuery(search, "shadowingAttemptId"),
        };
    }

    if (pathname.startsWith("/flash-cards")) {
        return { page: "flashcard" };
    }

    if (pathname.startsWith("/lesson")) {
        return {
            page: "lesson",
            lessonId: pageState.lessonId ?? params.id ?? fromQuery(search, "lessonId"),
        };
    }

    return { page: "unknown" };
}
