import { Dictation } from "../types/Dictation";
import axiosClient from "./axiosClient";

const BASE_URL = "/dictations";
export const dictationService = {
  /**
   * Lấy tất cả dictation để luyện tập
   * @param params - Optional filters: { part_type?: number, tags?: string[], level?: string }
   * @returns Array of Dictation (unwrap ApiResponse.data nếu cần)
   */
  async getAllDictationData(
    params?: Record<string, any>
  ): Promise<Dictation[]> {
    const res = await axiosClient.get(`${BASE_URL}`, { params });
    // Backend trả về ApiResponse { success, data, message }
    // Unwrap data nếu có, không thì trả res.data
    return res.data?.data || res.data;
  },

  async getDictationById(id: string): Promise<Dictation> {
    const res = await axiosClient.get(`${BASE_URL}/${id}`);
    // Unwrap ApiResponse nếu có
    return res.data?.data || res.data;
  },
};
