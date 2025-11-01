export type ReportType =
  | "system"
  | "lesson"
  | "flashcard"
  | "chatbot"
  | "other";

export type ReportStatus = "pending" | "in_progress" | "resolved" | "rejected";

export interface ReportUserInfo {
  id: string;
  fullname: string;
  email: string;
  avatar?: string;
}

export interface ReportItem {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  imageUrl?: string;
  status: ReportStatus;
  adminNote?: string;
  handledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: ReportUserInfo | null;
  handler?: ReportUserInfo | null;
}

export interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReportListResponse {
  items: ReportItem[];
  pagination: ReportPagination;
}
