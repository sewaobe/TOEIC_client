import { ChatMessage, ChatSession, ChatType } from "../types/Chat"
import axiosClient from "./axiosClient"

const BASE_URL = "/chat"
export const chatService = {
    getChatSessions: async (page = 1, limit = 10): Promise<{
        items: ChatSession[];
        page: number;
        total: number;
        hasMore: boolean;
    }> => {
        const res = await axiosClient.get(`${BASE_URL}/session`, {
            params: { page, limit }
        });

        return res.data;
    },
    createChatSession: async (data: {
        title: string,
        type: ChatType
    }): Promise<ChatSession> => {
        const res = await axiosClient.post(`${BASE_URL}/session`, data);

        return res.data;
    },
    getAllChatMessageInSession: async (sessionId: string): Promise<ChatMessage[]> => {
        const res = await axiosClient.get(`${BASE_URL}/message/${sessionId}`);

        return res.data;
    },
    processUserMessage: async (data: { sessionId: string; userText: string, questionId?: string }): Promise<any> => {
        const res = await axiosClient.post(`${BASE_URL}/message`, data);

        return res.data;
    },
    sendFeedback: async (data: {
        sessionId: string;
        messageId: string;
        rating: "like" | "dislike";
        comment?: string;
    }) => {
        const res = await axiosClient.post(`/chat-feedback`, data);
        return res.data;
    },
    deleteChatSession: async (sessionId: string): Promise<ChatSession> => {
        const res = await axiosClient.delete(`${BASE_URL}/session/${sessionId}`);
        return res.data;
    }
}