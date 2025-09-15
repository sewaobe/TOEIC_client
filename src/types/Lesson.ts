export type LessonStatus = "locked" | "todo" | "done" | "progress";
export type LessonType = "core" | "quiz" | "mini";

export interface LessonItem {
    id: string;
    week: number; // 1-based
    title: string;
    type: LessonType;
    status: LessonStatus;
    progress?: number; // 0..100
}

export interface CurrentLesson {
    id: string;
    week: number;
    title: string;
    type: LessonType;
}

export type QCOption = { key: string; text: string };
export type QCQuestion = { id: string; text: string; options: QCOption[]; answer: string };
