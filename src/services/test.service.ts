// services/test.service.ts
import axiosClient from "./axiosClient";

const testService = {
  // Lấy test theo id với query tùy chọn
  getTestById: async (
    id: string,
    options?: { full?: boolean; part?: string; parts?: string[] }
  ): Promise<{ test: any }> => {
    const res = await axiosClient.get(`/tests/${id}`, {
      params: {
        ...(options?.full ? { full: true } : {}),
        ...(options?.part ? { part: options.part } : {}),
        ...(options?.parts ? { parts: options.parts.join(",") } : {}),
      },
    });
    const test = res.data;
    return { test };
  },

  submitTest: async (
    testId: string,
    userId: string,
    answers: { question_id: string; selectedOption: string }[]
  ): Promise<{ score: number; answers: any[] }> => {
    const res = await axiosClient.post(`/tests/${testId}/submit`, {
      userId,
      answers,
    });
    return res.data;
  },
};

export default testService;
