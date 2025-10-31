import { useEffect, useState, useCallback } from "react";
import { ChatMessage } from "../types/Chat";
import { getSocket, initSocket } from "../services/socket.service";

interface UseChatSocketProps {
    sessionId: string;
    onMessage?: (msg: ChatMessage) => void;
    onBotTyping?: () => void;
    onError?: (err: any) => void;
    onSessionUpdated?: (data: { sessionId: string; last_message_preview: string; updated_at: string | Date }) => void;
}

export function useChatSocket({
    sessionId,
    onMessage,
    onBotTyping,
    onError,
    onSessionUpdated,
}: UseChatSocketProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);

    useEffect(() => {
        let socket = getSocket();
        if (!socket) socket = initSocket();
        if (!socket) return;

        socket.removeAllListeners("chat:receive");
        socket.removeAllListeners("chat:botTyping");
        socket.removeAllListeners("chat:botStopTyping");
        socket.removeAllListeners("chat:error");
        socket.removeAllListeners("chat:sessionUpdated");

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        const handleReceive = (data: { sender: string; message: ChatMessage }) => {
            onMessage?.(data.message);
        };

        const handleTyping = (data?: { sessionId?: string }) => {
            if (!data || data.sessionId === sessionId) {
                setIsBotTyping(true);
                onBotTyping?.();
            }
        };

        // Tắt typing rõ ràng
        const handleStopTyping = (data?: { sessionId?: string }) => {
            if (!data || data.sessionId === sessionId) {
                setIsBotTyping(false);
            }
        };

        const handleError = (err: any) => {
            setIsBotTyping(false);
            onError?.(err);
        };

        const handleSessionUpdated = (data: any) => {
            onSessionUpdated?.(data);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("chat:receive", handleReceive);
        socket.on("chat:botTyping", handleTyping);
        socket.on("chat:botStopTyping", handleStopTyping);
        socket.on("chat:error", handleError);
        socket.on("chat:sessionUpdated", handleSessionUpdated);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("chat:receive", handleReceive);
            socket.off("chat:botTyping", handleTyping);
            socket.off("chat:botStopTyping", handleStopTyping);
            socket.off("chat:error", handleError);
            socket.off("chat:sessionUpdated", handleSessionUpdated);
        };
    }, [sessionId, onMessage, onBotTyping, onError, onSessionUpdated]);


    const sendMessage = useCallback(
        (text: string, questionId?: string) => {
            const socket = getSocket();
            if (!socket || !socket.connected) return;
            socket.emit("chat:send", {
                sessionId,
                userText: text,
                questionId,
            });
        },
        [sessionId]
    );

    return { isConnected, isBotTyping, sendMessage };
}
