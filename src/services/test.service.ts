import { ITestCard } from "../types/Test";
import axiosClient from "./axiosClient";

const testService = {
  getTests: async (page = 1, limit = 6, search?: string) => {
    const res = await axiosClient.get("/tests", { params: { page, limit, search } });
    return res.data;
  },
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
  getLatestTests: async (): Promise<ITestCard[]> => {
    const res = await axiosClient.get('/tests/latest?limit=3');
    const data: ITestCard[] = res.data.map((test: any) => (
      { ...test, isNew: true }
    ))
    return data
  },
  getUserRecentTest: async (): Promise<ITestCard[]> => {
    const res = await axiosClient.get('/tests/recent?limit=3');
    const data: ITestCard[] = res.data.map((test: any) => ({
      ...test,
      _id: test.test_id
    }))
    return data;
  }
};

export default testService;
