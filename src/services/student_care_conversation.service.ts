import { ApiResponse } from "../types/ApiResponse";
import { StudentCareConversation } from "../types/StudentCareConversation";
import axiosClient from "./axiosClient";

export const studentCareConversationService = {
  getById: async (id: string) => {
    const res = await axiosClient.get<ApiResponse<StudentCareConversation>>(
      `/student/care-conversations/${id}`
    );
    if (!res.data) throw new Error("Không thể tải trao đổi học tập");
    return res.data;
  },

  getPending: async () => {
    const res = await axiosClient.get<ApiResponse<StudentCareConversation[]>>(
      "/student/care-conversations/pending"
    );
    return res.data || [];
  },

  respond: async (
    id: string,
    payload: {
      primaryAnswerCode: string;
      secondaryAnswerCode?: string;
      note?: string;
    }
  ) => {
    const res = await axiosClient.post<ApiResponse<StudentCareConversation>>(
      `/student/care-conversations/${id}/respond`,
      payload
    );
    if (!res.data) throw new Error("Không thể gửi phản hồi");
    return res.data;
  },
};

