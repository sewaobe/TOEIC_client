import { ApiResponse } from "../types/ApiResponse";
import { Notification } from "../types/Notification";
import axiosClient from "./axiosClient";

export const notificationService = {
  //  GET all (có phân trang)
  getAllNotifications: async (
    params: { page?: number; limit?: number } = { page: 1, limit: 4 }
  ): Promise<{
    items: Notification[];
    pageCount: number;
    total: number;
    unreadCount: number;
  }> => {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;

    const res = await axiosClient.get<ApiResponse<any>>(
      `/notifications?page=${page}&limit=${limit}`
    );

    if (!res.data) {
      throw new Error("Không thể tải danh sách thông báo");
    }

    //  Chuẩn hóa dữ liệu
    const rawItems = res.data.items || res.data.notifications || [];
    const items: Notification[] = rawItems.map((n: any) => ({
      id: n._id,
      senderId: n.senderId,
      recipientId: n.recipientId,
      message: n.message,
      description: n.description,
      type: n.type,
      isRead: n.isRead,
      metadata: n.metadata || undefined,
      createdAt: n.createdAt,
    }));

    // ⚙️ fix lỗi '??' và '||' bằng cách thêm ngoặc
    const total: number = res.data.total ?? items.length;
    const pageCount: number =
      (res.data.pageCount ?? Math.ceil(total / limit)) || 1;
    const unreadCount: number = res.data.unreadCount ?? 0;
    return { items, pageCount, total, unreadCount };
  },

  //  PUT - đánh dấu đã đọc
  markAsRead: async (id: string): Promise<Notification> => {
    const res = await axiosClient.put<ApiResponse<any>>(
      `/notifications/${id}/read`
    );

    if (!res.data) {
      throw new Error("Không thể cập nhật trạng thái thông báo");
    }

    const n = res.data;
    return {
      id: n._id,
      senderId: n.senderId,
      recipientId: n.recipientId,
      message: n.message,
      description: n.description,
      type: n.type,
      isRead: n.isRead,
      metadata: n.metadata || undefined,
      createdAt: n.createdAt,
    };
  },
};
