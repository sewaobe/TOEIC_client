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
  const fetchNotifications = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        setIsLoading(true);
        const res = await notificationService.getAllNotifications({
          page: pageNum,
          limit: 4,
        });
        const { items = [], total = 0, pageCount = 1, unreadCount = 0 } = res;

        setPageCount(pageCount);
        setTotal(total);
        setUnreadCount(unreadCount);

        setNotifications((prev) => (append ? [...prev, ...items] : items));
      } catch (err) {
        console.error("Lỗi fetch notifications:", err);
        toast.error("Không thể tải danh sách thông báo");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        // kiểm tra trạng thái hiện tại
        const target = notifications.find((n) => n.id === id);
        if (!target) return;
        if (target.isRead) {
          // đã đọc rồi thì không gọi API và không trừ unreadCount
          return;
        }

        await notificationService.markAsRead(id);

        // cập nhật local
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch {
        toast.error("Không thể cập nhật trạng thái thông báo");
      }
    },
    [notifications]
  );

  // ✅ Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    toast.promise(
      Promise.all(unread.map((n) => notificationService.markAsRead(n.id))).then(
        () => {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          setUnreadCount((prev) => Math.max(prev - unread.length, 0)); // hoặc set 0 cũng được
        }
      ),
      {
        loading: "Đang đánh dấu đã đọc...",
        success: "Tất cả thông báo đã được đánh dấu",
        error: "Có lỗi khi cập nhật thông báo",
      }
    );
  }, [notifications]);

  // 🔌 Realtime (chỉ refresh trang đầu khi có notif mới)
  useEffect(() => {
    let socket = getSocket();
    // Nếu chưa có socket hoặc socket hiện không còn kết nối, khởi tạo lại
    if (!socket || !socket.connected) {
      socket = initSocket();
    }

    if (!socket) return;

    const handleReceive = (notif: Notification) => {
      console.log("receiveNotification event (client):", notif);
      toast.message("Thông báo mới", { description: notif.message });
      setHasNew(true);
      // Reload topbar list lightly
      fetchNotifications(1, false);
      setPage(1); // giữ state trang đồng bộ
    };

    socket.on("receiveNotification", handleReceive);

    // Global window event from socket.service: trigger fetch when socket any reports receiveNotification
    const globalHandler = (e: any) => {
      try {
        const ev = e?.detail?.event;
        if (ev === "receiveNotification") {
          fetchNotifications(1, false);
          setPage(1);
        }
      } catch (err) {
        /* ignore */
      }
    };
    window.addEventListener("socket:any", globalHandler as EventListener);

    return () => {
      socket.off("receiveNotification", handleReceive);
      window.removeEventListener("socket:any", globalHandler as EventListener);
    };
  }, [fetchNotifications]);

  const resetNew = useCallback(() => setHasNew(false), []);

  // Khi học viên đã phản hồi (approve/reject) một adjustment request,
  // cập nhật notification tương ứng trong local state để khi mở sẽ hiển thị kết quả.
  useEffect(() => {
    const handler = (e: any) => {
      try {
        const req = e?.detail?.request;
        if (!req) return;

        setNotifications((prev) => {
          let changed = false;
          const updated = prev.map((n) => {
            const adjId = n.metadata?.adjustmentRequestId;
            if (adjId && String(adjId) === String(req._id)) {
              changed = true;
              const status = (req.status || "").toString().toLowerCase();
              const isApproved =
                status === "approved" ||
                status === "APPROVED" ||
                status === "approve";
              const newMessage = isApproved
                ? "Bạn đã đồng ý yêu cầu điều chỉnh lộ trình"
                : "Bạn đã từ chối yêu cầu điều chỉnh lộ trình";
              const newDesc =
                req.rejectionReason ||
                n.description ||
                (isApproved
                  ? "Bạn đã chấp nhận thay đổi."
                  : "Bạn đã từ chối thay đổi.");
              return {
                ...n,
                message: newMessage,
                description: newDesc,
                isRead: true,
                metadata: {
                  ...n.metadata,
                  responseStatus: req.status,
                  responseReason: req.rejectionReason || "",
                },
              };
            }
            return n;
          });

          // Nếu không có notification tương ứng thì giữ nguyên
          return changed ? updated : prev;
        });

        // Giảm unreadCount nếu notification trước đó chưa đọc
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch (err) {
        console.error(
          "Lỗi khi xử lý sự kiện adjustment:responded trong useNotifications:",
          err
        );
      }
    };

    window.addEventListener("adjustment:responded", handler as EventListener);
    return () =>
      window.removeEventListener(
        "adjustment:responded",
        handler as EventListener
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
