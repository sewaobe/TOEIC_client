import axiosClient from "./axiosClient";

const BASE_URL = "/lessons-learningpath";

export const lessonService = {
  /**
   * Lấy chi tiết lesson theo id (có thể kèm dayStudyId để kiểm tra unlock)
   */
  async getLessonById(lessonId: string, dayStudyId?: string) {
    const res = await axiosClient.get(`${BASE_URL}/${lessonId}`, {
      params: { day_study_id: dayStudyId },
    });
    return res.data?.data || res.data;
  },
};

export default lessonService;
