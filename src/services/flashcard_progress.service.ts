import { LearningFlashcard } from "../components/flashCard/LearningFlashcard";
import type { Log } from "../hooks/useFlashcardSession";
import axiosClient from "./axiosClient";
import type { FlashcardFeedbackAction } from "../types/flashcardFeedback";
import type {
  FlashcardCardPreview,
  FlashcardPreviewMetadata,
} from "../types/flashcardPreview";

const BASE_URL = "/flashcard-progress";

export interface FlashcardAnswerRequest {
  vocabulary_id: string;
  action: FlashcardFeedbackAction;
  response_time: number;
  attempted_at: string;
}

export interface FlashcardProgressResponse {
  session_id: string;
  order_queue: string[];
  current_index?: number;
  logs?: Log[];
}

export interface FlashcardAnswerResponse {
  progress: FlashcardProgressResponse;
  preview_metadata_patch?: {
    cards?: Record<string, FlashcardCardPreview>;
  } | null;
}

export interface FlashcardSessionStartResponse {
  sessionId: string;
  session?: FlashcardProgressResponse;
  preview_metadata?: FlashcardPreviewMetadata;
}

export interface FlashcardSessionResumeResponse {
  progress: FlashcardProgressResponse | null;
  preview_metadata?: FlashcardPreviewMetadata;
}

export const flashCardProgressService = {
  // 🔹 1. Tạo session mới
  startSession: async (
    topicId: string,
    orderQueue: string[],
    idempotencyKey: string,
  ): Promise<FlashcardSessionStartResponse> => {
    const res = await axiosClient.post(
      `${BASE_URL}/start`,
      {
        topic_vocabulary_id: topicId,
        order_queue: orderQueue,
      },
      {
        headers: { "Idempotency-Key": idempotencyKey },
      },
    );
    return res.data; // { session_id, progress }
  },

  answerSession: async (
    sessionId: string,
    body: FlashcardAnswerRequest,
    idempotencyKey: string,
  ): Promise<FlashcardAnswerResponse> => {
    const res = await axiosClient.post(
      `${BASE_URL}/${sessionId}/answer`,
      body,
      {
        headers: { "Idempotency-Key": idempotencyKey },
      },
    );
    return res.data;
  },

  // 🔹 3. Lấy lại session (resume)
  getSession: async (sessionId: string): Promise<FlashcardSessionResumeResponse> => {
    const res = await axiosClient.get(`${BASE_URL}/${sessionId}`);
    return res.data; // progress object
  },

  getAllActiveSessionsByUser: async (
    page = 1,
    limit = 9,
  ): Promise<{
    items: LearningFlashcard[];
    total: number;
    page: number;
    pageCount: number;
  }> => {
    const res = await axiosClient.get(`${BASE_URL}/active-by-user`, {
      params: { page, limit },
    });
    const sessionItems = res.data.items.map((item: LearningFlashcard) => ({
      session_id: item.session_id,
      topic_vocabulary_id: item.topic._id,
    }));

    localStorage.setItem(
      "learningFlashcardSessions",
      JSON.stringify(sessionItems),
    );
    return res.data;
  },

  // 🔹 4. Hoàn tất session
  finalizeSession: async (
    sessionId: string,
    accuracy: number,
    avgTime: number,
    total: number,
    startedAt: string,
    finishedAt: string,
  ) => {
    const res = await axiosClient.post(`${BASE_URL}/finalize`, {
      session_id: sessionId,
      accuracy,
      avg_time: avgTime,
      total,
      started_at: startedAt,
      finished_at: finishedAt,
    });
    return res.data; // { message, attempt }
  },

  removeSession: async (sessionId: string) => {
    const res = await axiosClient.delete(`${BASE_URL}/remove/${sessionId}`);
    await flashCardProgressService.getAllActiveSessionsByUser();
    localStorage.removeItem("flashcard_session_id");
    return res.data;
  },
};
