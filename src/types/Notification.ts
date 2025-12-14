import { ReportType } from "./Report";

export interface Notification {
  id: string;
  senderId?: string;
  recipientId?: string;
  message: string;
  description?: string;
  type:
    | "system"
    | "comment"
    | "error"
    | "chat"
    | "test"
    | "lesson"
    | ReportType;
  isRead?: boolean;
  metadata?: { adjustmentRequestId?: string; [key: string]: any }; // Dữ liệu bổ sung
  createdAt: string;
}
