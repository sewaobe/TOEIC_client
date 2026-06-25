import type { ChatErrorType, ChatMessage } from "../types/Chat";

export const chatErrorMessages: Record<ChatErrorType, string> = {
    AUTH_REQUIRED: "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.",
    SOCKET_DISCONNECTED: "Kết nối chat đang bị gián đoạn. Vui lòng thử lại sau vài giây.",
    MISSING_CONTEXT: "Mình chưa có đủ ngữ cảnh để trả lời. Bạn hãy chọn câu hỏi hoặc bài test cần phân tích.",
    MISSING_REQUIRED_CONTEXT: "Mình cần thêm ngữ cảnh cụ thể để trả lời chính xác. Hãy mở đúng câu hỏi, bài test hoặc lộ trình liên quan rồi thử lại.",
    UNAUTHORIZED: "Mình không thể truy cập dữ liệu này trong tài khoản của bạn.",
    NO_DATA: "Mình chưa tìm thấy dữ liệu học tập phù hợp để phân tích. Bạn hãy hoàn thành một bài test trước.",
    NO_USER_DATA: "Mình chưa có đủ dữ liệu học tập của bạn để phân tích. Hãy hoàn thành một hoạt động hoặc bài test trước.",
    UNSUPPORTED_CAPABILITY: "Mình chưa hỗ trợ thao tác này trong chatbot.",
    LOW_CONFIDENCE: "Mình chưa chắc bạn muốn hỏi phần nào. Bạn có thể nói cụ thể hơn không?",
    AI_SERVICE_ERROR: "Mình chưa thể tạo giải thích lúc này. Bạn vẫn có thể xem đáp án hoặc lời giải có sẵn.",
    LEGACY_RETRIEVER_UNAVAILABLE: "Mình chưa xử lý được câu hỏi chung này lúc này. Bạn có thể hỏi về câu sai, kết quả bài test hoặc tiến độ học trước.",
    VALIDATION_ERROR: "Tin nhắn chat thiếu thông tin cần thiết. Vui lòng thử lại.",
    UNKNOWN: "Chatbot đang gặp sự cố. Vui lòng thử lại sau.",
};

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function nestedRecord(value: unknown, key: string): Record<string, unknown> {
    return asRecord(asRecord(value)[key]);
}

export function getChatErrorMessage(err: unknown) {
    return chatErrorMessages[getChatErrorType(err)];
}

export function getChatErrorType(err: unknown): ChatErrorType {
    const source = asRecord(err);
    const data = nestedRecord(err, "data");
    const rawType = source.errorType || source.type || data.errorType;
    return typeof rawType === "string" && rawType in chatErrorMessages
        ? rawType as ChatErrorType
        : "UNKNOWN";
}

export function isSilentChatError(err: unknown) {
    return getChatErrorType(err) === "AUTH_REQUIRED";
}

export function shouldHideChatMessage(message: ChatMessage) {
    if (message.meta?.errorType === "AUTH_REQUIRED") return true;
    const text = message.text.toLowerCase();
    return (
        text.includes("phiên đăng nhập đã hết hạn") ||
        text.includes("bạn chưa đăng nhập") ||
        text.includes("vui lòng đăng nhập lại") ||
        text.includes("authentication required")
    );
}

export function normalizeSocketConnectError(err: unknown) {
    const source = asRecord(err);
    const data = nestedRecord(err, "data");
    const rawType = data.errorType;
    const message = typeof source.message === "string" ? source.message : undefined;
    const errorType: ChatErrorType =
        typeof rawType === "string" && rawType in chatErrorMessages
            ? rawType as ChatErrorType
            : message === "AUTH_REQUIRED"
                ? "AUTH_REQUIRED"
                : "SOCKET_DISCONNECTED";

    return {
        errorType,
        message,
    };
}
