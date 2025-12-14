export enum AdjustmentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum AdjustmentActionType {
  REMOVE = "REMOVE",
  ADD = "ADD",
  REPLACE = "REPLACE",
  RESCHEDULE = "RESCHEDULE",
}

export interface IAdjustmentChange {
  action: AdjustmentActionType;
  targetDate?: string;
  lessonId?: string; // ID của lesson/quiz/flashcard/etc
  oldLessonId?: string; // ID của lesson/quiz cũ (cho REPLACE)
  lessonTitle?: string; // Tên bài học (lưu trực tiếp)
  oldLessonTitle?: string; // Tên bài cũ (cho REPLACE)
  dayStudyId?: string;
  note?: string;
  weekNumber: number; // Luôn có giá trị, không undefined
  dayNumber: number; // Luôn có giá trị, không undefined
  weekTitle: string; // Luôn có giá trị
  dayTitle: string; // Luôn có giá trị
}

export interface IAdjustmentRequest {
  _id: string;
  studentId: string;
  collaboratorId: { _id: string; fullName: string; avatar: string };
  learningPathId: string;
  status: AdjustmentStatus;
  reason: string;
  rejectionReason?: string;
  changes: IAdjustmentChange[];
  createdAt: string;
  updatedAt: string;
}
