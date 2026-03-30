import axiosClient from "./axiosClient";

const BASE_URL = "/hlr";

/**
 * HLR Service - Frontend API calls cho Spaced Repetition
 */

// ============================================
// TYPES
// ============================================

export interface ReviewQueueItem {
  _id: string;
  user_id: string;
  vocabulary_id: string;
  right_count: number;
  wrong_count: number;
  last_practiced: string;
  half_life: number;
  next_review: string;
  recall_probability: number; // 0-1, xác suất còn nhớ (thấp = dễ quên)
  vocabulary?: {
    _id: string;
    word: string;
    phonetic?: string;
    type?: string;
    part_type?: string;
    definition?: string;
    examples?: Array<{ en: string; vi: string }>;
    image?: string;
    audio?: string;
    weight?: number;
    tags?: string[];
  };
}

export interface ReviewQueueResponse {
  count: number;
  items: ReviewQueueItem[];
}

export interface HLRStats {
  totalWords: number;
  dueToday: number;
  averageHalfLife: number;
  masteredWords: number;
}

export interface SubmitSessionItem {
  vocabulary_id: string;
  is_correct: boolean;
}

export interface SubmitSessionResponse {
  processed: number;
  results: Array<{
    vocabulary_id: string;
    is_correct: boolean;
    new_half_life: number;
    next_review: string;
  }>;
}

export type MemoryStatus = "critical" | "review_soon" | "stable";

export interface ProgressLibraryItem extends ReviewQueueItem {
  forgot_at: string;
  memory_status: MemoryStatus;
}

export interface ProgressLibraryResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: ProgressLibraryItem[];
}

// ============================================
// API CALLS
// ============================================

export const hlrService = {
  /**
   * Lấy danh sách từ cần ôn tập
   * @param limit - Số từ tối đa (default 20)
   * @param includeDetails - Có lấy chi tiết vocabulary không (default true)
   */
  getReviewQueue: async (
    limit: number = 20,
    includeDetails: boolean = true,
  ): Promise<ReviewQueueResponse> => {
    const res = await axiosClient.get(`${BASE_URL}/review-queue`, {
      params: { limit, includeDetails },
    });

    // Backend trả về vocabulary_id (populated), cần map sang vocabulary
    const backendData = res.data.data || res.data;
    const items = backendData.items.map((item: any) => {
      const populatedVocabulary =
        typeof item.vocabulary_id === "object" && item.vocabulary_id
          ? item.vocabulary_id
          : item.vocabulary;

      const normalizedVocabularyId =
        typeof item.vocabulary_id === "string"
          ? item.vocabulary_id
          : populatedVocabulary?._id || "";

      return {
        ...item,
        vocabulary_id: normalizedVocabularyId,
        vocabulary: populatedVocabulary, // Map populated data để UI render ổn định
      };
    });

    return {
      count: backendData.count,
      items,
    };
  },

  /**
   * Lấy thư viện tiến độ ghi nhớ (toàn bộ từ đã học, có phân trang)
   */
  getProgressLibrary: async (params?: {
    page?: number;
    limit?: number;
    includeDetails?: boolean;
    search?: string;
    sortBy?: "next_review" | "last_practiced" | "half_life";
    sortOrder?: "asc" | "desc";
  }): Promise<ProgressLibraryResponse> => {
    const res = await axiosClient.get(`${BASE_URL}/progress-library`, {
      params,
    });

    const backendData = res.data?.data || res.data;

    const items = (backendData.items || []).map((item: any) => {
      const populatedVocabulary =
        typeof item.vocabulary_id === "object" && item.vocabulary_id
          ? item.vocabulary_id
          : item.vocabulary;

      const normalizedVocabularyId =
        typeof item.vocabulary_id === "string"
          ? item.vocabulary_id
          : populatedVocabulary?._id || "";

      return {
        ...item,
        vocabulary_id: normalizedVocabularyId,
        vocabulary: populatedVocabulary,
      };
    });

    return {
      page: backendData.page || 1,
      limit: backendData.limit || 50,
      total: backendData.total || 0,
      totalPages: backendData.total_pages || 0,
      items,
    };
  },

  /**
   * Submit kết quả ôn tập
   * @param items - Mảng kết quả {vocabulary_id, is_correct}
   */
  submitSession: async (
    items: SubmitSessionItem[],
  ): Promise<SubmitSessionResponse> => {
    const res = await axiosClient.post(`${BASE_URL}/submit-session`, {
      items,
    });
    return res.data;
  },

  /**
   * Lấy thống kê HLR của user
   */
  getStats: async (): Promise<HLRStats> => {
    const res = await axiosClient.get(`${BASE_URL}/stats`);

    // axiosClient có thể đã unwrap ApiResponse, check cả 2 trường hợp
    const backendData = res.data?.data || res.data;

    // Map backend response (snake_case) to frontend interface (camelCase)
    return {
      totalWords: backendData.total_words || 0,
      dueToday: backendData.due_today || 0,
      averageHalfLife: backendData.average_half_life || 0,
      masteredWords: backendData.mastered || 0,
    };
  },
};

export default hlrService;
