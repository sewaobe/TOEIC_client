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
