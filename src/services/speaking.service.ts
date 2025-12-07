import axiosClient from "./axiosClient";
import { UserConfig, TurnResponse, SessionWithDetail, Message, SpeakerRole } from "../types/PracticeSpeaking";

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
    // BE dùng ApiResponse; dữ liệu thực nằm trong res.data.data
    return res.data;
  },

  endSession: async (payload: { sessionId: string; actualDurationSeconds?: number }) => {
    const res = await axiosClient.post(`${BASE_URL}/session/end`, payload);
    return res.data;
  },

  /**
   * Lấy báo cáo tổng quan (overall report) cho một phiên speaking.
   */
  getSessionReport: async (sessionId: string): Promise<SessionWithDetail['report']> => {
    const res = await axiosClient.get(`${BASE_URL}/report/${sessionId}`);
    // BE dùng ApiResponse; dữ liệu thực nằm trong res.data.data
    return res.data;
  },

  /**
   * Helper: kết hợp SessionResult (từ history) + messages + report thành SessionWithDetail trên FE.
   * BE chưa trả thẳng SessionWithDetail nên FE tự map dựa trên types hiện tại.
   */
  getSessionDetail: async (
    summary: SessionWithDetail | (Omit<SessionWithDetail, "messages" | "report"> & { _id?: string })
  ): Promise<SessionWithDetail> => {
    if (!summary || !(summary as any)._id) {
      throw new Error("Session summary must include _id");
    }
    const sessionId = (summary as any)._id as string;

    const [rawMessages, report] = await Promise.all([
      speakingService.getSessionMessages(sessionId),
      speakingService.getSessionReport(sessionId),
    ]);
    
    const messages: Message[] = rawMessages.map((m: any) => ({
      id: m._id || `${m.sender}-${m.created_at}`,
      role: m.sender === 'user' ? SpeakerRole.USER : SpeakerRole.BOT,
      text: m.text,
      translation: m.meta?.translation,
      feedback: m.meta?.feedback || m.meta?.pronunciation_feedback,
      audioBase64: m.meta?.audioBase64,
      timestamp: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
    }));

    // Map paraphrasedLines (all mistakes from user messages)
    // và generalFeedback (lấy từ BE.report_overall nếu có)
    let mappedReport = report as SessionWithDetail['report'];

    if (mappedReport) {
      const paraphrasedLines = messages
        .filter((m) => m.role === SpeakerRole.USER && m.feedback?.mistakes?.length)
        .flatMap((m) => m.feedback!.mistakes);

      // BE vẫn trả field report_overall, nhưng FE chỉ xài generalFeedback
      const beAny: any = report;

      mappedReport = {
        ...mappedReport,
        generalFeedback: beAny.report_overall || mappedReport.generalFeedback || "",
        paraphrasedLines,
      };
    }

    return {
      ...(summary as any),
      messages,
      report: mappedReport,
    } as SessionWithDetail;
  },
};
