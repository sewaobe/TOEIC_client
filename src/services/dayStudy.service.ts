import { LessonItem, LessonResponse } from "../types/Lesson";
import axiosClient from "./axiosClient";

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export interface FeedbackPayload {
  rating: number;
  reasons?: string[];
  comment?: string;
}

export interface LessonFeedback {
  day_study_id: string;
  rating: number;
  reasons: string[];
  comment?: string;
  is_positive: boolean;
  created_at: string;
}

export const dayStudyService = {
  getDayStudyById: async (dayId: string, week: string): Promise<LessonItem[]> => {
    const res = await axiosClient.get(
      `/day-study/${dayId}`
    );
    console.log("Get Day Study By Id: ", res);
    const data: LessonResponse = res.data;
    const lessons: LessonItem[] = [];

    data.sessions.forEach((session) => {
      session.items.forEach((it, idx) => {
        lessons.push({
          id: `${it.activity_id ?? idx}`,
          week: Number(week),
          title: `${capitalizeFirst(it.kind)} ${session.part_type ? `— Part ${session.part_type}` : ""}`,
          type: it.kind as LessonItem["type"],
          status: it.status
        });
      });
    });
    return lessons;
  },

  /**
   * Gửi feedback cho buổi học
   * POST /api/day-study/:dayId/feedback
   */
  submitFeedback: async (
    dayId: string,
    payload: FeedbackPayload
  ): Promise<LessonFeedback> => {
    const res = await axiosClient.post(`/day-study/${dayId}/feedback`, payload);
    return res.data;
  },

  /**
   * Lấy feedback của user cho ngày học
   * GET /api/day-study/:dayId/feedback
   */
  getFeedback: async (dayId: string): Promise<LessonFeedback | null> => {
    const res = await axiosClient.get(`/day-study/${dayId}/feedback`);
    return res.data;
  },
};
