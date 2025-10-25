import { LearningFlashcard } from "../components/flashCard/LearningFlashcard";
import { Log } from "../hooks/useFlashcardSession";
import axiosClient from "./axiosClient";

const BASE_URL = "/flashcard-progress";

export const flashCardProgressService = {
    // 🔹 1. Tạo session mới
    startSession: async (topicId: string, orderQueue: string[]) => {
        const res = await axiosClient.post(`${BASE_URL}/start`, {
            topic_vocabulary_id: topicId,
            order_queue: orderQueue,
        });
        return res.data; // { session_id, progress }
    },

    // 🔹 2. Cập nhật snapshot
    updateSession: async (
        sessionId: string,
        orderQueue: string[],
        currentIndex: number,
        logsDelta: Log[]
    ) => {
        const res = await axiosClient.patch(`${BASE_URL}/update`, {
            session_id: sessionId,
            order_queue: orderQueue,
            current_index: currentIndex,
            logs_delta: logsDelta,
        });
        return res.data; // { message, progress }
    },

    // 🔹 3. Lấy lại session (resume)
    getSession: async (sessionId: string) => {
        const res = await axiosClient.get(`${BASE_URL}/${sessionId}`);
        return res.data; // progress object
    },

    getAllActiveSessionsByUser: async (page = 1, limit = 9): Promise<{
        items: LearningFlashcard[];
        total: number;
        page: number;
        pageCount: number;
    }> => {
        const res = await axiosClient.get(`${BASE_URL}/active-by-user`, {
            params: { page, limit }
        });
        const sessionItems = res.data.items.map((item: LearningFlashcard) => ({
            session_id: item.session_id,
            topic_vocabulary_id: item.topic._id,
        }));

        localStorage.setItem('learningFlashcardSessions', JSON.stringify(sessionItems));
        return res.data;
    },

    // 🔹 4. Hoàn tất session
    finalizeSession: async (
        sessionId: string,
        accuracy: number,
        avgTime: number,
        total: number,
        logs: Log[],
        startedAt: string,
        finishedAt: string
    ) => {
        const res = await axiosClient.post(`${BASE_URL}/finalize`, {
            session_id: sessionId,
            accuracy,
            avg_time: avgTime,
            total,
            logs,
            started_at: startedAt,
            finished_at: finishedAt,
        });
        return res.data; // { message, attempt }
    },

    removeSession: async (sessionId: string) => {
        const res = await axiosClient.delete(`${BASE_URL}/remove/${sessionId}`);
        if (res.success) {
            await flashCardProgressService.getAllActiveSessionsByUser();
            localStorage.removeItem("flashcard_session_id");
        }
        return res.data; // { message, session }
    }
};
