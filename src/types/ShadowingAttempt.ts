export type ShadowingAttemptStatus = "draft" | "completed";

export interface ShadowingSegmentAttempt {
  user_transcript: string;
  similarity_score: number;
  accuracy_score?: number;
  feedback?: string;
  duration?: number;
  attempted_at: Date | string;
}

export interface ShadowingSegmentResult {
  index: number;
  text: string;
  attempts: ShadowingSegmentAttempt[];
}

export interface ShadowingAttempt {
  _id: string;
  user_id: string;
  shadowing_id: string;
  session_id?: string;
  status: ShadowingAttemptStatus;
  recorded_audio?: string;
  similarity_score: number;
  total_segments: number;
  completed_segments: number;
  segment_results: ShadowingSegmentResult[];
  duration: number;
  started_at: Date | string;
  finished_at?: Date | string;
  accuracy_score?: number;
  fluency_score?: number;
  intonation_score?: number;
  overall_feedback?: string;
}

export interface SaveShadowingAttemptPayload {
  total_segments: number;
  completed_segments: number;
  segment_results: ShadowingSegmentResult[];
  duration?: number;
  similarity_score?: number;
  accuracy_score?: number;
  fluency_score?: number;
  intonation_score?: number;
  overall_feedback?: string;
}
