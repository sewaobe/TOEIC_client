export type PracticeType = "definition_based" | "fill_blank" | "listening" | "reading" | "grammar";
export type SessionStatus = "in_progress" | "completed" | "cancelled";

export interface PracticeSession {
    _id: string;
    user_id: string;
    practice_type: PracticeType;
    topic_id: string;
    status: SessionStatus;
    
    // Tracking chi tiết
    total_items: number;
    completed_items: number;
    current_index: number;
    
    // Kết quả
    correct_count: number;
    total_accuracy: number;
    
    // Thời gian
    started_at: Date;
    last_activity_at: Date;
    completed_at?: Date;
}

export interface StartSessionRequest {
    practice_type: PracticeType;
    topic_id: string;
    total_items: number;
}

export interface StartSessionResponse {
    session: PracticeSession;
    isResume: boolean;
    existingAttempts: any[];
}

export interface UpdateProgressRequest {
    current_index?: number;
    completed_items?: number;
    correct_count?: number;
    total_accuracy?: number;
}

export interface CompleteSessionRequest {
    attempts: any[];
}
