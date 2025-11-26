import axiosClient from "./axiosClient";
import { BaseAttemptSummary, HistoryLessonType } from "../components/history/HistoryModalShell";

export const historyService = {
  getLessonHistory: async (
    lessonType: HistoryLessonType,
    lessonId: string
  ): Promise<BaseAttemptSummary[]> => {
    const res = await axiosClient.get<{
      success: boolean;
      data: BaseAttemptSummary[];
      message?: string;
    }>(`/history/${lessonType}/${lessonId}`);

    // axiosClient interceptor unwraps data, so res is the ApiResponse
    // ensure we always return an array
    // @ts-ignore
    return (res as any)?.data ?? (res as any) ?? [];
  },
};
