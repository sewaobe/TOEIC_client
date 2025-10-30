import axiosClient from "./axiosClient";

const geminiService = {
  // Gọi BE để sinh lộ trình học TOEIC bằng Gemini
  // Body theo spec bạn cung cấp (current_score, current_accuracy, target_score, ...)
  generateToeicPlan: async (body: any) => {
    const res = await axiosClient.post("/gemini/generate-toeic-plan", body);
    return res; // axiosClient đã trả response.data
  },
};

export default geminiService;
