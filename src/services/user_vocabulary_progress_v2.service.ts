import axiosClient from "./axiosClient";
import {
  ApiResponse,
  MemoryStatusSummaryItem,
  MemoryUiBucket,
  PaginatedSuggestions,
  ReviewSchedulePoint,
  SuggestionPriority,
  TodayReviewSummary,
} from "../types/UserVocabularyProgressV2";
import {
  memoryStatuses,
  schedulePoints,
  suggestedVocabularies,
  todayReviewSummary,
} from "../components/flashcard-suggestion/mockData";

const BASE_URL = "/v2/user-vocabulary-progress";
const DAY_MS = 24 * 60 * 60 * 1000;

export interface GetReviewScheduleParams {
  rangeDays?: 7 | 14 | 30;
}

export interface GetSuggestedVocabularyParams {
  page?: number;
  limit?: number;
  search?: string;
  topic?: string;
  level?: string;
  priority?: SuggestionPriority | "all";
  bucket?: MemoryUiBucket | "all";
  sortBy?: "due_at" | "p_recall" | "word";
  sortOrder?: "asc" | "desc";
}

const mockScheduleBaseValues = [
  42, 25, 18, 22, 20, 10, 5, 14, 18, 12,
  16, 9, 11, 7, 13, 17, 8, 15, 10, 6,
  12, 9, 14, 7, 11, 5, 8, 6, 10, 4,
];

function buildMockReviewSchedule(rangeDays: 7 | 14 | 30 = 7): ReviewSchedulePoint[] {
  return Array.from({ length: rangeDays }, (_, index) => {
    const baseValue = mockScheduleBaseValues[index] ?? 8;
    const variance = randomInt(-5, 6);

    return {
      date: new Date(Date.now() + index * DAY_MS).toISOString(),
      label:
        index === 0
          ? schedulePoints[0]?.label ?? "Hôm nay"
          : index === 1
            ? schedulePoints[1]?.label ?? "Ngày mai"
            : `Ngày ${index + 1}`,
      count: Math.max(1, baseValue + variance),
    };
  });
}

function buildMockMemoryStatusSummary(): MemoryStatusSummaryItem[] {
  const counts: Record<MemoryUiBucket, number> = {
    mastered: randomInt(190, 261),
    active_reviewing: randomInt(150, 231),
    at_risk: randomInt(30, 76),
    overdue: randomInt(12, 41),
  };
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return memoryStatuses.map((status) => ({
    bucket: status.bucket,
    label: status.label,
    count: counts[status.bucket],
    percentage: Math.round((counts[status.bucket] / total) * 100),
  }));
}

const mockPaginatedSuggestions: PaginatedSuggestions = {
  items: suggestedVocabularies.map((item) => ({
    id: item.vocabularyId,
    vocabularyId: item.vocabularyId,
    word: item.word,
    phonetic: item.phonetic,
    meaning: item.meaning,
    topic: item.topic,
    level: item.level,
    priority: item.priority,
    priorityLabel: item.priorityLabel,
    pRecallNow: item.pRecallNow,
    dueAt: item.dueAt ?? item.memory?.due_at ?? null,
    dueLabel: item.dueLabel,
    memoryBucket: item.memoryBucket ?? "active_reviewing",
    status: item.memory?.status ?? "reviewing",
    halfLifeDays: item.memory?.half_life_days ?? 0,
    difficulty: item.memory?.difficulty ?? 0,
    reviewCount: 0,
    sessionCount: 0,
  })),
  pagination: {
    page: 1,
    limit: 20,
    total: suggestedVocabularies.length,
    totalPages: 1,
  },
  counters: {
    all: 416,
    dueToday: 142,
    atRisk: 38,
    overdue: 20,
    mastered: 236,
  },
};

function hasTodayReviewData(data?: TodayReviewSummary | null): data is TodayReviewSummary {
  return Boolean(data && data.total > 0);
}

function hasArrayData<T>(data?: T[] | null): data is T[] {
  return Array.isArray(data) && data.length > 0;
}

function hasScheduleData(data?: ReviewSchedulePoint[] | null): data is ReviewSchedulePoint[] {
  return hasArrayData(data) && data.some((item) => item.count > 0);
}

function hasMemoryStatusData(
  data?: MemoryStatusSummaryItem[] | null,
): data is MemoryStatusSummaryItem[] {
  return hasArrayData(data) && data.some((item) => item.count > 0);
}

function hasSuggestionData(data?: PaginatedSuggestions | null): data is PaginatedSuggestions {
  return Boolean(data && Array.isArray(data.items) && data.items.length > 0);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const userVocabularyProgressV2Service = {
  getTodayReviewSummary: async (): Promise<TodayReviewSummary> => {
    try {
      const response = await axiosClient.get<ApiResponse<TodayReviewSummary>>(
        `${BASE_URL}/today-review`,
      );

      return hasTodayReviewData(response.data) ? response.data : todayReviewSummary;
    } catch (error) {
      return todayReviewSummary;
    }
  },

  getReviewSchedule: async (
    params: GetReviewScheduleParams = {},
  ): Promise<ReviewSchedulePoint[]> => {
    try {
      const response = await axiosClient.get<ApiResponse<ReviewSchedulePoint[]>>(
        `${BASE_URL}/review-schedule`,
        {
          params,
        },
      );

      return hasScheduleData(response.data)
        ? response.data
        : buildMockReviewSchedule(params.rangeDays);
    } catch (error) {
      return buildMockReviewSchedule(params.rangeDays);
    }
  },

  getMemoryStatusSummary: async (): Promise<MemoryStatusSummaryItem[]> => {
    try {
      const response = await axiosClient.get<ApiResponse<MemoryStatusSummaryItem[]>>(
        `${BASE_URL}/memory-status`,
      );

      return hasMemoryStatusData(response.data)
        ? response.data
        : buildMockMemoryStatusSummary();
    } catch (error) {
      return buildMockMemoryStatusSummary();
    }
  },

  getSuggestedVocabulary: async (
    params: GetSuggestedVocabularyParams = {},
  ): Promise<PaginatedSuggestions> => {
    try {
      const response = await axiosClient.get<ApiResponse<PaginatedSuggestions>>(
        `${BASE_URL}/suggestions`,
        {
          params,
        },
      );

      return hasSuggestionData(response.data) ? response.data : mockPaginatedSuggestions;
    } catch (error) {
      return mockPaginatedSuggestions;
    }
  },
};

export default userVocabularyProgressV2Service;
