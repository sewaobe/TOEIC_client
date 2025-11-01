import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { notificationService } from "../services/notification.service";
import { getSocket, initSocket } from "../services/socket.service";
import { Notification } from "../types/Notification";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNew, setHasNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 Fetch có phân trang
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true);
      const res = await notificationService.getAllNotifications({ page: pageNum, limit: 4 });
      const { items = [], total = 0, pageCount = 1, unreadCount = 0 } = res;

      setPageCount(pageCount);
      setTotal(total);
      setUnreadCount(unreadCount);

      setNotifications(prev => (append ? [...prev, ...items] : items));
    } catch (err) {
      console.error("Lỗi fetch notifications:", err);
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // 🔁 Load thêm
  const loadMore = useCallback(async () => {
    if (page >= pageCount) return;
    const nextPage = page + 1;
    await fetchNotifications(nextPage, true);
    setPage(nextPage);
  }, [page, pageCount, fetchNotifications]);

  // ✅ Đánh dấu 1 thông báo đã đọc — chỉ trừ unreadCount nếu trước đó nó chưa đọc
  const markAsRead = useCallback(async (id: string) => {
    try {
      // kiểm tra trạng thái hiện tại
      const target = notifications.find(n => n.id === id);
      if (!target) return;
      if (target.isRead) {
        // đã đọc rồi thì không gọi API và không trừ unreadCount
        return;
      }

      await notificationService.markAsRead(id);

      // cập nhật local
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch {
      toast.error("Không thể cập nhật trạng thái thông báo");
    }
  }, [notifications]);

  // ✅ Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    toast.promise(
      Promise.all(unread.map(n => notificationService.markAsRead(n.id))).then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(prev => Math.max(prev - unread.length, 0)); // hoặc set 0 cũng được
      }),
      {
        loading: "Đang đánh dấu đã đọc...",
        success: "Tất cả thông báo đã được đánh dấu",
        error: "Có lỗi khi cập nhật thông báo",
      }
    );
  }, [notifications]);

  // 🔌 Realtime (chỉ refresh trang đầu khi có notif mới)
  useEffect(() => {
    const socket = getSocket() || initSocket();

    socket.on("receiveNotification", (notif: Notification) => {
      toast.message("Thông báo mới", { description: notif.message });
      setHasNew(true);
      fetchNotifications(1, false);
      setPage(1); // giữ state trang đồng bộ
    });

    return () => {
      socket.off("receiveNotification");
    };
  }, [fetchNotifications]);

  const resetNew = useCallback(() => setHasNew(false), []);

  return {
    notifications,
    unreadCount,
    hasNew,
    resetNew,
    markAsRead,
    markAllAsRead,
    isLoading,
    loadMore,
    hasMore: total > notifications.length,
  };
}
