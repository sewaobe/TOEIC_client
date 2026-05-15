export type VocabularyMemoryStatus = "learning" | "reviewing" | "mastered";

export type MemoryUiBucket =
  | "mastered"
  | "active_reviewing"
  | "overdue";

export type SuggestionBucket = "all" | "due_today" | MemoryUiBucket;

export type DhpRecallResult = "remembered" | "forgot";

export type FlashcardEvalType = "easy" | "medium" | "hard" | "skip";

export type UserVocabularyMemoryId = string;

export type VocabularyId = string;

export type ISODateString = string;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: unknown;
  meta?: unknown;
}

export interface UserVocabularyMemoryV2 {
  _id?: UserVocabularyMemoryId;
  user_id: string;
  vocabulary_id: VocabularyId;

  difficulty: number;
  half_life_days: number;

  last_reviewed_at: ISODateString | null;
  due_at: ISODateString | null;
  status: VocabularyMemoryStatus;

  review_count: number;
  session_count: number;

  last_p_recall?: number;
  last_interval_days?: number;
  last_seen_count?: number;
  last_hard_count?: number;
  last_medium_count?: number;
  last_easy_count?: number;
  last_skip_count?: number;
  last_learning_effort?: number;
  last_response_time_avg?: number;
  last_recall_failure_score?: number;
  last_dhp_recall_result?: DhpRecallResult;

  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface FlashcardSessionLogV2 {
  vocab_id: VocabularyId;
  vocab_word?: string;
  eval_type: FlashcardEvalType;
  response_time: number;
  attempted_at: ISODateString;
}

export interface VocabularySessionSummaryV2 {
  vocabularyId: VocabularyId;

  seenCount: number;
  hardCount: number;
  mediumCount: number;
  easyCount: number;
  skipCount: number;

  firstAttemptedAt: ISODateString;
  lastAttemptedAt: ISODateString;

  totalResponseTimeMs: number;
  avgResponseTimeMs: number;

  learningEffort: number;
  initialDifficulty: number;

  recallFailureScore: number;
  dhpRecallResult: DhpRecallResult;
}

export interface VocabularyMemoryV2UpdateResult {
  vocabularyId: VocabularyId;
  isNewMemory: boolean;

  previousDifficulty?: number;
  previousHalfLifeDays?: number;

  observedDifficulty: number;
  nextDifficulty: number;

  previousPRecall?: number;
  nextHalfLifeDays: number;

  nextIntervalDays: number;
  dueAt: ISODateString;
  status: VocabularyMemoryStatus;

  seenCount: number;
  hardCount: number;
  mediumCount: number;
  easyCount: number;
  skipCount: number;
  learningEffort: number;
  recallFailureScore: number;
  dhpRecallResult: DhpRecallResult;
}

export interface SspMmcPolicyEntry {
  halfLife: number;
  interval: number;
}

export interface SspMmcPolicy {
  unit: "days";
  source?: string;
  difficultyMin: number;
  difficultyMax: number;
  policies: Record<string, SspMmcPolicyEntry[]>;
}

export interface TodayReviewSummary {
  total: number;
  dueToday: number;
  overdue: number;
  primaryReviewCount: number;
  overdueReviewCount: number;
}

export interface ReviewSchedulePoint {
  date: ISODateString;
  label: string;
  count: number;
}

export interface MemoryStatusSummaryItem {
  bucket: MemoryUiBucket;
  label: string;
  count: number;
  percentage: number;
}

export interface SuggestedVocabularyApiItem {
  id: string;
  vocabularyId: VocabularyId;
  word: string;
  phonetic?: string;
  meaning?: string;
  type?: string;
  topic?: string;
  level?: string;
  pRecallNow: number;
  dueAt: ISODateString | null;
  dueLabel: string;
  memoryBucket: MemoryUiBucket;
  status: VocabularyMemoryStatus;
  halfLifeDays: number;
  difficulty: number;
  reviewCount: number;
  sessionCount: number;
}

export interface SuggestedVocabularyPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuggestedVocabularyCounters {
  all: number;
  dueToday: number;
  activeReviewing: number;
  overdue: number;
  mastered: number;
}

export interface PaginatedSuggestions {
  items: SuggestedVocabularyApiItem[];
  pagination: SuggestedVocabularyPagination;
  counters: SuggestedVocabularyCounters;
}

export interface SuggestionFilterOption {
  value: string;
  label: string;
}

export interface SuggestionFilterOptions {
  topics: SuggestionFilterOption[];
  levels: SuggestionFilterOption[];
}

export type SuggestionReasonCode =
  | "OVERDUE"
  | "DUE_TODAY"
  | "UPCOMING_DUE"
  | "LOW_RECALL_PROBABILITY"
  | "LAST_SESSION_HARD"
  | "LAST_DHP_FORGOT"
  | "HIGH_DIFFICULTY"
  | "REPEATED_IN_LAST_SESSION"
  | "LONG_RESPONSE_TIME";

export interface SuggestionReason {
  code: SuggestionReasonCode;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface SuggestionDetail {
  vocabulary_id: VocabularyId;
  word: string;
  phonetic?: string;
  meaning?: string;
  examples?: {
    en: string,
    vi: string
  }[];
  topic_title?: string;
  level?: string;
  difficulty: number;
  p_recall: number;
  half_life_days: number;
  last_reviewed_at: ISODateString | null;
  due_at: ISODateString | null;
  last_response_time_avg_ms: number | null;
  reasons: SuggestionReason[];
}

export type SuggestionDueTone = "danger" | "warning" | "success";

export interface VocabularyDisplayInfo {
  vocabularyId: VocabularyId;
  word: string;
  phonetic?: string;
  meaning: string;
  topic?: string;
  topicColor?: string;
  level?: string;
}

export interface SuggestedVocabularyItem extends VocabularyDisplayInfo {
  memory?: Pick<
    UserVocabularyMemoryV2,
    | "difficulty"
    | "half_life_days"
    | "due_at"
    | "status"
    | "last_p_recall"
    | "last_interval_days"
    | "last_seen_count"
    | "last_hard_count"
    | "last_medium_count"
    | "last_easy_count"
    | "last_skip_count"
    | "last_learning_effort"
    | "last_recall_failure_score"
    | "last_dhp_recall_result"
  >;
  pRecallNow: number;
  pRecallPercent: number;
  dueAt?: ISODateString | null;
  dueLabel: string;
  dueTone: SuggestionDueTone;
  memoryBucket?: MemoryUiBucket;
}

export interface SuggestionReviewStat {
  key: "dueToday" | "overdue";
  label: string;
  value: number;
  color: string;
}

export interface SuggestionSchedulePoint {
  label: string;
  value: number;
}

export interface SuggestionMemoryStatus {
  bucket: MemoryUiBucket;
  label: string;
  value: number;
  percent: number;
  color: string;
}
