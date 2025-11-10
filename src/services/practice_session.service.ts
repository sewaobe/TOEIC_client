import axiosClient from "./axiosClient";
import { 
    PracticeSession, 
    PracticeType, 
    SessionStatus, 
    StartSessionRequest, 
    StartSessionResponse,
    UpdateProgressRequest,
    CompleteSessionRequest
} from "../types/PracticeSession";

const BASE_URL = "/practice-sessions";

export const practiceSessionService = {
    /**
     * Bắt đầu hoặc resume session
     */
    startOrResume: async (data: StartSessionRequest): Promise<StartSessionResponse> => {
        const res = await axiosClient.post(`${BASE_URL}/start`, data);
        return res.data;
    },

    /**
     * Update progress
     */
    updateProgress: async (sessionId: string, data: UpdateProgressRequest): Promise<PracticeSession> => {
        const res = await axiosClient.patch(`${BASE_URL}/${sessionId}/progress`, data);
        return res.data;
    },

    /**
     * Complete session
     */
    complete: async (sessionId: string, data: CompleteSessionRequest): Promise<any> => {
        const res = await axiosClient.post(`${BASE_URL}/${sessionId}/complete`, data);
        return res.data;
    },

    /**
     * Get session by topic
     */
    getByTopic: async (topicId: string, practiceType: PracticeType): Promise<PracticeSession | null> => {
        const res = await axiosClient.get(`${BASE_URL}/by-topic/${topicId}`, {
            params: { practice_type: practiceType }
        });
        return res.data;
    },

    /**
     * Get all sessions của user
     */
    getUserSessions: async (
        practiceType?: PracticeType,
        status?: SessionStatus,
        page = 1,
        limit = 100
    ): Promise<{ items: PracticeSession[]; total: number; page: number; pageCount: number }> => {
        const res = await axiosClient.get(BASE_URL, {
            params: { practice_type: practiceType, status, page, limit }
        });
        return res.data;
    },

    /**
     * Get attempts của 1 session
     */
    getSessionAttempts: async (sessionId: string): Promise<any[]> => {
        const res = await axiosClient.get(`${BASE_URL}/${sessionId}/attempts`);
        return res.data;
    },

    /**
     * Save attempt ngay khi submit (không đợi complete)
     */
    saveAttempt: async (sessionId: string, attempt: any): Promise<any> => {
        const res = await axiosClient.post(`${BASE_URL}/${sessionId}/attempts`, attempt);
        return res.data;
    },

    /**
     * Cancel session
     */
    cancel: async (sessionId: string): Promise<PracticeSession> => {
        const res = await axiosClient.post(`${BASE_URL}/${sessionId}/cancel`);
        return res.data;
    }
};
