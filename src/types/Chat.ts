export type ChatSender = "user" | "bot";

export type ChatType =
    | "question"   // Luyện nghe hiểu ngắn
    | "reading"    // Luyện đọc hiểu
    | "shadowing"  // Bắt chước giọng
    | "dictation"  // Nghe chép chính tả
    | "lesson";    // Bài kiểm tra ngắn

export type ChatFeedback = "like" | "dislike" | null;

/** Phiên hội thoại giữa người dùng và chatbot */
export interface ChatSession {
    _id: string;                   // ObjectId của phiên chat
    user_id?: string;              // ID người dùng (nếu đăng nhập)
    title: string;                 // “Practice Listening - Day 3”
    type: ChatType;                // Loại luyện tập
    created_at: string;            // ISO date string
    updated_at: string;            // ISO date string
    last_message_preview?: string; // Dòng preview ở danh sách
    total_messages?: number;       // Số tin nhắn trong phiên
    is_archived?: boolean;         // Có bị ẩn không
}

/** Tin nhắn trong một phiên chat */
export interface ChatMessage {
    _id: string;                   // ObjectId của tin nhắn
    session_id: string;            // Liên kết tới ChatSession
    sender: ChatSender;            // "user" | "bot"
    text: string;                  // Nội dung tin nhắn
    created_at: string;            // ISO date string
    meta?: ChatMessageMeta;        // Thông tin phụ (token, feedback, lỗi, ...)
}

/** Thông tin phụ cho tin nhắn */
export interface ChatMessageMeta {
    token_usage?: number;          // Số token dùng (nếu có)
    model?: string;                // Tên model AI
    feedback?: ChatFeedback;       // like / dislike
    error?: string;                // Thông báo lỗi (nếu có)
}

/** Dành cho ChipScrollerMini hoặc bộ chọn chế độ luyện tập */
export interface PracticeModeOption {
    value: ChatType;
    label: string;
    icon?: React.ElementType;
}
