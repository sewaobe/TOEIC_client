import axiosClient from "./axiosClient";
import {
  ApiResponse,
  MemoryStatusSummaryItem,
  PaginatedSuggestions,
  ReviewSchedulePoint,
  SuggestionBucket,
  SuggestionDetail,
  SuggestionFilterOptions,
  TodayReviewSummary,
} from "../types/UserVocabularyProgressV2";


const BASE_URL = "/v2/user-vocabulary-progress";

export interface GetReviewScheduleParams {
  rangeDays?: 7 | 14 | 30;
}

export interface GetSuggestedVocabularyParams {
  page?: number;
  limit?: number;
  search?: string;
  topic?: string;
  level?: string;
  bucket?: SuggestionBucket;
  sortBy?: "due_at" | "p_recall" | "word";
  sortOrder?: "asc" | "desc";
}

export const userVocabularyProgressV2Service = {
  getTodayReviewSummary: async (): Promise<TodayReviewSummary> => {
    const response = await axiosClient.get<ApiResponse<TodayReviewSummary>>(
      `${BASE_URL}/today-review`,
    );

    return response.data;
  },

  getReviewSchedule: async (
    params: GetReviewScheduleParams = {},
  ): Promise<ReviewSchedulePoint[]> => {
    const response = await axiosClient.get<ApiResponse<ReviewSchedulePoint[]>>(
      `${BASE_URL}/review-schedule`,
      {
        params,
      },
    );

    return response.data;
  },

  getMemoryStatusSummary: async (): Promise<MemoryStatusSummaryItem[]> => {
    const response = await axiosClient.get<ApiResponse<MemoryStatusSummaryItem[]>>(
      `${BASE_URL}/memory-status`,
    );

    return response.data;
  },

  getSuggestedVocabulary: async (
    params: GetSuggestedVocabularyParams = {},
  ): Promise<PaginatedSuggestions> => {
    const response = await axiosClient.get<ApiResponse<PaginatedSuggestions>>(
      `${BASE_URL}/suggestions`,
      {
        params,
      },
    );
    return response.data;
  },

  getSuggestionFilterOptions: async (): Promise<SuggestionFilterOptions> => {
    const response = await axiosClient.get<ApiResponse<SuggestionFilterOptions>>(
      `${BASE_URL}/suggestions/filter-options`,
    );
    return response.data;
  },

  getSuggestionDetail: async (vocabularyId: string): Promise<SuggestionDetail> => {
    const response = await axiosClient.get<ApiResponse<SuggestionDetail>>(
      `${BASE_URL}/suggestions/${vocabularyId}`,
    );
    return response.data;
  },
};

export default userVocabularyProgressV2Service;
