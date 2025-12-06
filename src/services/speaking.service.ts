import axiosClient from "./axiosClient";
import { UserConfig, TurnResponse } from "../types/PracticeSpeaking";

const BASE_URL = "/chat/speaking";

export const speakingService = {
  createSession: async (payload: {
    title: string;
    config: UserConfig;
  }): Promise<{ _id: string }> => {
    const res = await axiosClient.post(`${BASE_URL}/session`, payload);
    // BE dùng ApiResponse; dữ liệu thực nằm trong res.data.data
    return res.data;
  },

  processTurn: async (payload: {
    sessionId: string;
    userTranscript?: string;
    audioBase64?: string;
  }): Promise<{
    turn: TurnResponse;
    userMessageId: string;
    botMessageId: string;
  }> => {
    const res = await axiosClient.post(`${BASE_URL}/turn`, payload);
    return res.data;
  },

  getSessions: async (page = 1, limit = 10): Promise<{ items: any[]; page: number; total: number; hasMore: boolean }> => {
    const res = await axiosClient.get(`${BASE_URL}/sessions`, { params: { page, limit } });
    return res.data;
  },

  getSessionMessages: async (sessionId: string): Promise<any[]> => {
    const res = await axiosClient.get(`${BASE_URL}/messages/${sessionId}`);
    return res.data;
  },
};
