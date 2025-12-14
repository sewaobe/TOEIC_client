import axiosClient from "./axiosClient";
import { ApiResponse } from "./learningPath.service";
import { IAdjustmentRequest, AdjustmentStatus } from "../types/adjustment";

export const adjustmentService = {
  // Lấy danh sách yêu cầu của học viên
  getStudentRequests: async () => {
    const res = await axiosClient.get<ApiResponse<IAdjustmentRequest[]>>(
      "/adjustment-requests/student"
    );
    return res.data;
  },

  // Lấy chi tiết adjustment request theo id
  getRequestById: async (id: string) => {
    const res = await axiosClient.get<ApiResponse<IAdjustmentRequest>>(
      `/adjustment-requests/${id}`
    );
    return res.data;
  },

  // Phản hồi yêu cầu (Approve/Reject)
  respondToRequest: async (
    requestId: string,
    status: AdjustmentStatus,
    rejectionReason?: string
  ) => {
    const res = await axiosClient.put<ApiResponse<IAdjustmentRequest>>(
      `/adjustment-requests/${requestId}/respond`,
      { status, rejectionReason }
    );
    return res.data;
  },
};
