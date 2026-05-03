export type VocabularyMemoryStatus = "learning" | "reviewing" | "mastered";

export type DhpRecallResult = "remembered" | "forgot";

export type FlashcardEvalType = "easy" | "medium" | "hard" | "skip";

export type UserVocabularyMemoryId = string;

export type VocabularyId = string;

export type ISODateString = string;

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

export type SuggestionPriority = "Cao" | "Trung bình" | "Thấp";

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
  priority: SuggestionPriority;
  pRecall: number;
  pRecallPercent: number;
  dueLabel: string;
  dueTone: SuggestionDueTone;
}

export interface SuggestionReviewStat {
  label: string;
  value: number;
  color: string;
}

export interface SuggestionSchedulePoint {
  label: string;
  value: number;
}

export interface SuggestionMemoryStatus {
  label: string;
  status?: VocabularyMemoryStatus;
  value: number;
  percent: number;
  color: string;
}
