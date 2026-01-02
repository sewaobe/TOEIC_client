import axiosClient from "./axiosClient";
import { MindMapNode } from "../types/MindMap";

const geminiService = {
  // Gọi BE để sinh lộ trình học TOEIC bằng Gemini
  // Body theo spec bạn cung cấp (current_score, current_accuracy, target_score, ...)
  generateToeicPlan: async (body: any) => {
    const res = await axiosClient.post("/gemini/generate-toeic-plan", body);
    return res; // axiosClient đã trả response.data
  },
  async analyzeDictation(logs: any[], dictation: any) {
    const res = await axiosClient.post("/gemini/dictation-analysis", {
      logs,
      dictation,
    })
    return res.data.json;
  },
  async analyzeShadowing(
    userAudioUrl: string,
    nativeAudioUrl: string,
    meta: {
      level?: string;
      segmentIndex?: number;
      nativeStart?: number;
      nativeEnd?: number;
      shadowing?: any;
    }
  ) {
    const res = await axiosClient.post("/gemini/shadowing-analysis", {
      user_audio_url: userAudioUrl,
      native_audio_url: nativeAudioUrl,
      level: meta.level,
      segmentIndex: meta.segmentIndex,
      native_start: meta.nativeStart,
      native_end: meta.nativeEnd,
      shadowing: meta.shadowing,
    });

    return res.data.json;
  },

  // Generate Mind Map from text content
  async generateMindMap(content: string): Promise<MindMapNode> {
    const res = await axiosClient.post("/gemini/generate-mindmap", { content });
    return res.data.data;
  }
};

export default geminiService;
