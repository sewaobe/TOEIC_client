import axiosClient from "./axiosClient";
import {
  ApiResponse,
  MemoryStatusSummaryItem,
  MemoryUiBucket,
  PaginatedSuggestions,
  ReviewSchedulePoint,
  SuggestionBucket,
  SuggestionDetail,
  SuggestionFilterOptions,
  SuggestionPriority,
  SuggestionReason,
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
const MOCK_SUGGESTION_TOTAL = 416;

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
  bucket?: SuggestionBucket;
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

const mockSuggestionItems: PaginatedSuggestions["items"] = Array.from({ length: MOCK_SUGGESTION_TOTAL }, (_, index) => {
  const item = suggestedVocabularies[index % suggestedVocabularies.length];
  const idSuffix = index < suggestedVocabularies.length ? "" : `-${index + 1}`;

  return {
    id: `${item.vocabularyId}${idSuffix}`,
    vocabularyId: `${item.vocabularyId}${idSuffix}`,
    word: idSuffix ? `${item.word} ${index + 1}` : item.word,
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
  };
});

const mockSuggestionCounters: PaginatedSuggestions["counters"] = {
  all: 416,
  dueToday: 142,
  atRisk: 38,
  overdue: 20,
  mastered: 236,
};

const mockPaginatedSuggestions: PaginatedSuggestions = {
  items: mockSuggestionItems,
  pagination: {
    page: 1,
    limit: 20,
    total: mockSuggestionItems.length,
    totalPages: Math.ceil(mockSuggestionItems.length / 20),
  },
  counters: mockSuggestionCounters,
};

const mockSuggestionFilterOptions: SuggestionFilterOptions = {
  topics: Array.from(
    new Set(mockSuggestionItems.map((item) => item.topic).filter(Boolean)),
  )
    .sort()
    .map((topic) => ({ value: topic as string, label: topic as string })),
  levels: Array.from(
    new Set(mockSuggestionItems.map((item) => item.level).filter(Boolean)),
  )
    .sort()
    .map((level) => ({ value: level as string, label: level as string })),
  priorities: [
    { value: "high", label: "Cao" },
    { value: "medium", label: "Trung bình" },
    { value: "low", label: "Thấp" },
  ],
};

function buildMockPaginatedSuggestions(
  params: GetSuggestedVocabularyParams = {},
): PaginatedSuggestions {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 20);
  const search = params.search?.trim().toLowerCase();
  const todayKey = new Date().toDateString();

  const filtered = mockSuggestionItems.filter((item) => {
    if (
      search &&
      !item.word.toLowerCase().includes(search) &&
      !item.meaning?.toLowerCase().includes(search)
    ) {
      return false;
    }

    if (params.priority && params.priority !== "all" && item.priority !== params.priority) {
      return false;
    }

    if (params.topic && params.topic !== "all" && item.topic !== params.topic) {
      return false;
    }

    if (params.level && params.level !== "all" && item.level !== params.level) {
      return false;
    }

    if (params.bucket && params.bucket !== "all") {
      if (params.bucket === "due_today") {
        if (!item.dueAt || new Date(item.dueAt).toDateString() !== todayKey || item.status === "mastered") {
          return false;
        }
      } else if (item.memoryBucket !== params.bucket) {
        return false;
      }
    }

    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;

  return {
    items: filtered.slice(startIndex, startIndex + limit),
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
    counters: mockSuggestionCounters,
  };
}

function buildMockSuggestionDetail(vocabularyId: string): SuggestionDetail {
  const item =
    suggestedVocabularies.find((vocabulary) => vocabulary.vocabularyId === vocabularyId) ??
    suggestedVocabularies.find((vocabulary) => vocabularyId.startsWith(`${vocabulary.vocabularyId}-`)) ??
    suggestedVocabularies[0];
  const pRecallPercent = Math.round(item.pRecallNow * 100);

  return {
    vocabulary_id: vocabularyId,
    word: item.word,
    phonetic: item.phonetic,
    meaning: item.meaning,
    topic_title: item.topic,
    level: item.level,
    priority: item.priority,
    p_recall: item.pRecallNow,
    half_life_days: item.memory?.half_life_days ?? 0.54,
    last_reviewed_at: new Date(Date.now() - randomInt(1, 6) * DAY_MS).toISOString(),
    due_at: item.dueAt ?? item.memory?.due_at ?? null,
    last_response_time_avg_ms: randomInt(2600, 7800),
    reasons: buildMockSuggestionReasons(item.priority, pRecallPercent, item.vocabularyId),
  };
}

function buildMockSuggestionReasons(
  priority: SuggestionPriority,
  pRecallPercent: number,
  vocabularyId: string,
): SuggestionReason[] {
  const reasonSets: SuggestionReason[][] = [
    [
      {
        code: "OVERDUE",
        title: "Đã quá hạn ôn tập",
        description: "Từ này đã vượt lịch ôn dự kiến, nên được ưu tiên ôn lại.",
        severity: "high",
      },
      {
        code: "LOW_RECALL_PROBABILITY",
        title: "Nguy cơ quên cao",
        description: `Hệ thống ước tính bạn chỉ còn nhớ khoảng ${pRecallPercent}%, nên cần ôn sớm.`,
        severity: "high",
      },
      {
        code: "LAST_DHP_FORGOT",
        title: "Phiên gần nhất cho thấy trí nhớ chưa ổn định",
        description: "Kết quả học gần nhất được hệ thống xem là chưa nhớ chắc.",
        severity: "medium",
      },
    ],
    [
      {
        code: "DUE_TODAY",
        title: "Đã đến thời điểm ôn lại",
        description: "Từ này được lên lịch ôn vào hôm nay để duy trì trí nhớ.",
        severity: "high",
      },
      {
        code: "LAST_SESSION_HARD",
        title: "Bạn từng gặp khó với từ này",
        description: "Trong lần ôn gần nhất, bạn đã đánh giá từ này là Hard.",
        severity: "medium",
      },
      {
        code: "HIGH_DIFFICULTY",
        title: "Từ này có độ khó cao với bạn",
        description: "Mức difficulty hiện tại cao hơn nhiều từ khác trong danh sách.",
        severity: "medium",
      },
    ],
    [
      {
        code: "LOW_RECALL_PROBABILITY",
        title: "Nguy cơ quên cao",
        description: `Hệ thống ước tính bạn chỉ còn nhớ khoảng ${pRecallPercent}%, nên cần ôn sớm.`,
        severity: "high",
      },
      {
        code: "REPEATED_IN_LAST_SESSION",
        title: "Bạn đã phải ôn lại nhiều lần trong phiên trước",
        description: "Từ này từng xuất hiện nhiều lần trước khi bạn hoàn thành phiên học.",
        severity: "medium",
      },
      {
        code: "LONG_RESPONSE_TIME",
        title: "Bạn mất nhiều thời gian với từ này",
        description: "Thời gian phản hồi trung bình ở lần học gần nhất khá cao.",
        severity: "low",
      },
    ],
    [
      {
        code: "UPCOMING_DUE",
        title: "Sắp đến hạn ôn tập",
        description: "Từ này sẽ đến hạn trong vài ngày tới, bạn có thể ôn sớm nếu muốn.",
        severity: "low",
      },
      {
        code: "HIGH_DIFFICULTY",
        title: "Từ này có độ khó cao với bạn",
        description: "Mức difficulty hiện tại cao hơn nhiều từ khác trong danh sách.",
        severity: "medium",
      },
      {
        code: "LONG_RESPONSE_TIME",
        title: "Bạn mất nhiều thời gian với từ này",
        description: "Thời gian phản hồi trung bình ở lần học gần nhất khá cao.",
        severity: "low",
      },
    ],
  ];

  const hash = Math.abs(hashString(vocabularyId));

  if (priority === "high") {
    return reasonSets[hash % 3];
  }

  if (priority === "medium") {
    return reasonSets[(hash % 3) + 1];
  }

  return reasonSets[3];
}

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

function hasSuggestionDetailData(data?: SuggestionDetail | null): data is SuggestionDetail {
  return Boolean(data && data.vocabulary_id && data.word);
}

function hasSuggestionFilterOptionsData(
  data?: SuggestionFilterOptions | null,
): data is SuggestionFilterOptions {
  return Boolean(
    data &&
      Array.isArray(data.topics) &&
      Array.isArray(data.levels) &&
      Array.isArray(data.priorities),
  );
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hashString(value: string): number {
  return value.split("").reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) | 0;
  }, 0);
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

      return hasSuggestionData(response.data)
        ? response.data
        : buildMockPaginatedSuggestions(params);
    } catch (error) {
      return buildMockPaginatedSuggestions(params);
    }
  },

  getSuggestionFilterOptions: async (): Promise<SuggestionFilterOptions> => {
    try {
      const response = await axiosClient.get<ApiResponse<SuggestionFilterOptions>>(
        `${BASE_URL}/suggestions/filter-options`,
      );

      return hasSuggestionFilterOptionsData(response.data)
        ? response.data
        : mockSuggestionFilterOptions;
    } catch (error) {
      return mockSuggestionFilterOptions;
    }
  },

  getSuggestionDetail: async (vocabularyId: string): Promise<SuggestionDetail> => {
    try {
      const response = await axiosClient.get<ApiResponse<SuggestionDetail>>(
        `${BASE_URL}/suggestions/${vocabularyId}`,
      );

      return hasSuggestionDetailData(response.data)
        ? response.data
        : buildMockSuggestionDetail(vocabularyId);
    } catch (error) {
      return buildMockSuggestionDetail(vocabularyId);
    }
  },
};

export default userVocabularyProgressV2Service;
