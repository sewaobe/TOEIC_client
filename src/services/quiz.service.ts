import axiosClient from "./axiosClient";

export interface Choice {
    [key: string]: string;
}

export interface Question {
    _id: string;
    name: string;
    textQuestion: string;
    choices: Choice;
    correctAnswer: string;
    explanation: string;
    tags: string[];
    planned_time: number;
    created_at: string;
    updated_at: string;
}

export interface Topic {
    _id: string;
    title: string;
}

export interface Quiz {
    _id: string;
    title: string;
    topic: Topic[];
    part_type: number;
    level: string;
    status: string;
    planned_completion_time: number;
    weight: number;
    question_ids: Question[];
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string;
    errors: any;
}

export interface GetAllQuizResponse {
    items: Quiz[];
    total: number;
    pageCount: number;
}

const quizService = {
    /**
     * Lấy danh sách tất cả quiz (có phân trang + lọc)
     */
    getAllQuiz: async (
        page: number = 1,
        limit: number = 10,
        query?: string,
        topic?: string,
        level?: string,
        status?: string,
        part_type?: number
    ) => {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        if (query) params.append("query", query);
        if (topic) params.append("topic", topic);
        if (level) params.append("level", level);
        if (status) params.append("status", status);
        if (part_type !== undefined) params.append("part_type", part_type.toString());

        const res = await axiosClient.get<ApiResponse<GetAllQuizResponse>>(
            `/ctv/quiz?${params.toString()}`
        );
        return res;
    },

    /**
     * Lấy chi tiết quiz theo ID (bao gồm tất cả câu hỏi)
     */
    getQuizById: async (quizId: string) => {
        const res = await axiosClient.get<ApiResponse<Quiz>>(
            `/ctv/quiz/${quizId}`
        );
        return res;
    },
};

export default quizService;
