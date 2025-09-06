// services/test.service.ts
import axiosClient from "./axiosClient";

const testService = {
  getTests: async (page = 1, limit = 6, search?: string) => {
    const res = await axiosClient.get("/tests", {
      params: { page, limit, search },
    });
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
  getTestDetail: async (testId: string, page = 1, limit = 5) =>{
    const res = await axiosClient.get(`/tests/${testId}/detail`, { params: { page, limit } });
    console.log("testService" ,res.data )
    return res.data
  },
    
  submitTest: async (
    testId: string,
    userId: string,
    answers: { question_id: string; selectedOption: string }[],
    duration: number, 
    completedPart?: string,
  ): Promise<{ score: number; answers: any[] }> => {
    console.log(duration,completedPart)
    const res = await axiosClient.post(`/tests/${testId}/submit`, {
      userId,
      answers,
      duration,
      ...(completedPart ? { completedPart } : {}), 
    });
    return res.data;
  },
};

export default testService;
