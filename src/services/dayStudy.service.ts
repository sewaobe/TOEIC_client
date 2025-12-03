import { LessonItem, LessonResponse } from "../types/Lesson";
import axiosClient from "./axiosClient";
function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
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
};
