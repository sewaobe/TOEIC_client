import { useState } from "react";
import { adjustmentService } from "../services/adjustment.service";
import { IAdjustmentRequest, AdjustmentStatus } from "../types/adjustment";

/**
 * Hook quản lý dialog điều chỉnh lộ trình học
 * Không còn auto-popup - chỉ hiển thị khi user click vào notification
 */
export const useAdjustmentSocket = () => {
  const [pendingRequest, setPendingRequest] =
    useState<IAdjustmentRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  /**
   * Mở dialog với adjustment request ID
   * Gọi từ NotificationDropdown khi click vào notification có adjustmentRequestId
   */
  const openDialogWithRequest = async (requestId: string) => {
    try {
      console.log("📬 Đang tải adjustment request:", requestId);
      // Fetch cụ thể request theo id — không chỉ tìm request pending
      const resAny: any = await adjustmentService.getRequestById(requestId);
      let request: IAdjustmentRequest | null = null;

      // Normalize response shapes from API client
      if (!resAny) request = null;
      else if (Array.isArray(resAny)) request = resAny[0] || null;
      else if (resAny.data && !Array.isArray(resAny.data))
        request = resAny.data;
      else if (resAny.data && Array.isArray(resAny.data))
        request = resAny.data[0] || null;
      else request = resAny as IAdjustmentRequest;

      if (request) {
        setPendingRequest(request);
        setShowDialog(true);
      } else {
        console.warn("Không tìm thấy adjustment request với ID:", requestId);
      }
    } catch (error) {
      console.error("Lỗi khi fetch adjustment request:", error);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setPendingRequest(null);
  };

  return {
    pendingRequest,
    showDialog,
    closeDialog,
    openDialogWithRequest, // Export function để NotificationDropdown gọi
  };
};
