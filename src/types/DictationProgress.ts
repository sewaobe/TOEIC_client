import type { DictationAttemptLog } from "./Dictation";

export type DictationProgressStatus = "in_progress" | "completed" | "cancelled";
export type DictationProgressDifficulty = "easy" | "medium" | "hard";

export interface DictationSentenceRecord {
  answers: Record<number, string>;
  showAnswer: boolean;
  accuracy: number;
  mistakes: string[];
  passed: boolean;
}

export interface DictationProgressSummary {
  accuracy: number;
  total: number;
  avgTime: number;
  totalTime: number;
  completedItems: number;
  difficulty: DictationProgressDifficulty;
  insights?: unknown;
  logs: DictationAttemptLog[];
}

export interface DictationProgress {
  _id: string;
  user_id: string;
  dictation_id: string;
  status: DictationProgressStatus;
  difficulty: DictationProgressDifficulty;
  current_index: number;
  completed_indices: number[];
  sentence_records: Record<number, DictationSentenceRecord>;
  attempt_logs: DictationAttemptLog[];
  summary?: Partial<DictationProgressSummary>;
  started_at: string;
  last_activity_at: string;
  completed_at?: string;
}

export interface DictationProgressPatch {
  difficulty?: DictationProgressDifficulty;
  current_index?: number;
  completed_indices?: number[];
  sentence_records?: Record<number, DictationSentenceRecord>;
  attempt_logs?: DictationAttemptLog[];
  summary?: Partial<DictationProgressSummary>;
}

export type DictationAIFeedbackSource =
  | "rule_based_gemini"
  | "rule_based_deepseek"
  | "rule_based_template"
  | "legacy_gemini";

export interface DictationRecommendation {
  dictationId: string;
  title: string;
  level?: string;
  part_type?: number;
  partLabel?: string;
  tags: string[];
  weight?: number;
  suggestedDifficulty?: DictationProgressDifficulty;
  recommendationGoal?:
    | "increase_difficulty"
    | "build_reflex"
    | "reinforce_foundation"
    | "retry_current"
    | "move_to_less_supported_mode"
    | "same_level_stabilization";
  action: "start_dictation" | "retry_dictation";
  score: number;
  reasons: string[];
}

export interface DictationAIFeedbackResponse {
  source: DictationAIFeedbackSource;
  summary: {
    accuracy: number;
    difficulty?: DictationProgressDifficulty;
    avgDuration?: number;
    totalTime?: number;
    rawPerformanceBand?: string;
    adjustedPerformanceBand?: string;
    performanceBand: string;
    speedStatus: string;
    speedReliable?: boolean;
    slowSentenceRate?: number;
    recommendationMode: string;
  };
  feedback: {
    overall: string;
    strengths: string[];
    weaknesses: string[];
    tips: string[];
    sentenceAccuracyInsights: string[];
    commonMistakeInsights: string[];
  };
  charts: {
    accuracyBySentence: { index: number; accuracy: number }[];
    frequentMistakes: { text: string; count: number }[];
  };
  recommendations: DictationRecommendation[];
  warnings?: string[];
}
