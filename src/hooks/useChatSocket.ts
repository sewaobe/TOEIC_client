import { useEffect, useRef, useState, useCallback } from "react";
import { ChatClientContext, ChatMessage, ChatRouteContext } from "../types/Chat";
import { getSocket, initSocket } from "../services/socket.service";

interface UseChatSocketProps {
    sessionId: string;
    onMessage?: (msg: ChatMessage) => void;
    onBotTyping?: () => void;
    onError?: (err: unknown) => void;
    onSessionUpdated?: (data: { sessionId: string; title?: string; last_message_preview: string; updated_at: string | Date }) => void;
    onStreamStart?: (data: { sessionId: string; tempMessageId: string }) => void;
    onStreamChunk?: (data: { sessionId: string; tempMessageId: string; chunk: string }) => void;
    onStreamEnd?: (data: { sessionId: string; tempMessageId: string; message: ChatMessage }) => void;
    onStreamError?: (data: { sessionId: string; tempMessageId: string; message: ChatMessage }) => void;
}

const CHAT_RECONNECT_TIMEOUT_MS = 3000;

function waitForSocketConnect(timeoutMs = CHAT_RECONNECT_TIMEOUT_MS) {
    const socket = getSocket() || initSocket();
    if (!socket) return Promise.resolve(false);
    if (socket.connected) return Promise.resolve(true);

    return new Promise<boolean>((resolve) => {
        let settled = false;
        const cleanup = () => {
            socket.off("connect", handleConnect);
            window.clearTimeout(timeoutId);
        };
        const finish = (result: boolean) => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(result);
        };
        const handleConnect = () => finish(true);
        const timeoutId = window.setTimeout(() => finish(socket.connected), timeoutMs);

        socket.once("connect", handleConnect);
        if (!socket.connected) socket.connect();
    });
}

function emitChatMessage(
    sessionId: string,
    text: string,
    options?: {
        questionId?: string;
        routeContext?: ChatRouteContext;
        clientContext?: ChatClientContext;
        mode?: "db_first";
    }
) {
    const socket = getSocket();
    if (!socket || !socket.connected) return false;
    socket.emit("chat:send", {
        sessionId,
        userText: text,
        questionId: options?.questionId,
        routeContext: options?.routeContext,
        clientContext: options?.clientContext,
        mode: options?.mode,
    });
    return true;
}

export function useChatSocket({
    sessionId,
    onMessage,
    onBotTyping,
    onError,
    onSessionUpdated,
    onStreamStart,
    onStreamChunk,
    onStreamEnd,
    onStreamError,
}: UseChatSocketProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const callbacksRef = useRef({
        onMessage,
        onBotTyping,
        onError,
        onSessionUpdated,
        onStreamStart,
        onStreamChunk,
        onStreamEnd,
        onStreamError,
    });

    useEffect(() => {
        callbacksRef.current = {
            onMessage,
            onBotTyping,
            onError,
            onSessionUpdated,
            onStreamStart,
            onStreamChunk,
            onStreamEnd,
            onStreamError,
        };
    }, [
        onMessage,
        onBotTyping,
        onError,
        onSessionUpdated,
        onStreamStart,
        onStreamChunk,
        onStreamEnd,
        onStreamError,
    ]);

    useEffect(() => {
        let socket = getSocket();
        if (!socket) socket = initSocket();
        if (!socket) return;

        socket.removeAllListeners("chat:receive");
        socket.removeAllListeners("chat:botTyping");
        socket.removeAllListeners("chat:botStopTyping");
        socket.removeAllListeners("chat:error");
        socket.removeAllListeners("chat:sessionUpdated");
        socket.removeAllListeners("chat:streamStart");
        socket.removeAllListeners("chat:streamChunk");
        socket.removeAllListeners("chat:streamEnd");
        socket.removeAllListeners("chat:streamError");

        setIsConnected(socket.connected);

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        const handleReceive = (data: { sender: string; message: ChatMessage }) => {
            callbacksRef.current.onMessage?.(data.message);
        };

        const handleTyping = (data?: { sessionId?: string }) => {
            if (!data || data.sessionId === sessionId) {
                setIsBotTyping(true);
                callbacksRef.current.onBotTyping?.();
            }
        };

        // Tắt typing rõ ràng
        const handleStopTyping = (data?: { sessionId?: string }) => {
            if (!data || data.sessionId === sessionId) {
                setIsBotTyping(false);
            }
        };

        const handleError = (err: unknown) => {
            setIsBotTyping(false);
            callbacksRef.current.onError?.(err);
        };

        const handleSessionUpdated = (data: { sessionId: string; title?: string; last_message_preview: string; updated_at: string | Date }) => {
            callbacksRef.current.onSessionUpdated?.(data);
        };

        const handleStreamStart = (data: { sessionId: string; tempMessageId: string }) => {
            if (data.sessionId !== sessionId) return;
            setIsBotTyping(true);
            callbacksRef.current.onStreamStart?.(data);
        };

        const handleStreamChunk = (data: { sessionId: string; tempMessageId: string; chunk: string }) => {
            if (data.sessionId !== sessionId) return;
            callbacksRef.current.onStreamChunk?.(data);
        };

        const handleStreamEnd = (data: { sessionId: string; tempMessageId: string; message: ChatMessage }) => {
            if (data.sessionId !== sessionId) return;
            setIsBotTyping(false);
            callbacksRef.current.onStreamEnd?.(data);
        };

        const handleStreamError = (data: { sessionId: string; tempMessageId: string; message: ChatMessage }) => {
            if (data.sessionId !== sessionId) return;
            setIsBotTyping(false);
            callbacksRef.current.onStreamError?.(data);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("chat:receive", handleReceive);
        socket.on("chat:botTyping", handleTyping);
        socket.on("chat:botStopTyping", handleStopTyping);
        socket.on("chat:error", handleError);
        socket.on("chat:sessionUpdated", handleSessionUpdated);
        socket.on("chat:streamStart", handleStreamStart);
        socket.on("chat:streamChunk", handleStreamChunk);
        socket.on("chat:streamEnd", handleStreamEnd);
        socket.on("chat:streamError", handleStreamError);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("chat:receive", handleReceive);
            socket.off("chat:botTyping", handleTyping);
            socket.off("chat:botStopTyping", handleStopTyping);
            socket.off("chat:error", handleError);
            socket.off("chat:sessionUpdated", handleSessionUpdated);
            socket.off("chat:streamStart", handleStreamStart);
            socket.off("chat:streamChunk", handleStreamChunk);
            socket.off("chat:streamEnd", handleStreamEnd);
            socket.off("chat:streamError", handleStreamError);
        };
    }, [sessionId]);


    const sendMessage = useCallback(
        async (
            text: string,
            options?: {
                questionId?: string;
                routeContext?: ChatRouteContext;
                clientContext?: ChatClientContext;
                mode?: "db_first";
            }
        ): Promise<boolean> => {
            if (emitChatMessage(sessionId, text, options)) return true;

            const connected = await waitForSocketConnect();
            if (!connected) return false;
            return emitChatMessage(sessionId, text, options);
        },
        [sessionId]
    );

    return { isConnected, isBotTyping, sendMessage };
}
