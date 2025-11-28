export type LessonStatus = "lock" | "in_progress" | "completed";
export type LessonType =
  | "flash_card"
  | "shadowing"
  | "dictation"
  | "quiz"
  | "lesson"
  | "mini_test";

export interface LessonItem {
  id: string;
  week: number; // 1-based
  title: string;
  type: LessonType;
  status: LessonStatus;
}
export interface LessonResponse {
  accuracy_overall: number;
  sessions: {
    session_no: number;
    status: LessonStatus;
    part_type: number;
    items: {
      kind: string;
      activity_id: string;
      status: LessonStatus;
    }[];
  }[];
}
export type QCOption = { key: string; text: string };
export type QCQuestion = {
  id: string;
  text: string;
  options: QCOption[];
  answer: string;
};
