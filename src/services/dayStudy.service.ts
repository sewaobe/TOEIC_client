// src/services/dayStudy.service.ts
import axiosClient from "./axiosClient";

export const dayStudyService = {
  getDayStudyById: async (dayId: string): Promise<any> => {
    const res = await axiosClient.get(`/day-study/${dayId}`);
    return res; // res ở đây chính là ApiResponse<any> vì axiosClient đã unwrap .data ở interceptor
  },
};
