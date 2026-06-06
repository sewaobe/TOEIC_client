import axiosClient from "./axiosClient";

export type LearningPathV2SetupPayload = {
  target_score: number;
  target_completion_date: string | Date;
  time_per_day: number;
  days_per_week: number;
};

const BASE_URL = "/learning-path-v2";

const learningPathV2Service = {
  setup: async (payload: LearningPathV2SetupPayload) => {
    return axiosClient.put(`${BASE_URL}/setup`, payload);
  },

  getGenerationContext: async () => {
    return axiosClient.get(`${BASE_URL}/generation-context`);
  },

  initialGeneration: async (learningPathId: string) => {
    return axiosClient.post(`${BASE_URL}/${learningPathId}/initial-generation`, {});
  },

  getCurrentCycle: async (learningPathId: string) => {
    return axiosClient.get(`${BASE_URL}/${learningPathId}/current-cycle`);
  },

  getOverview: async (learningPathId: string) => {
    return axiosClient.get(`${BASE_URL}/${learningPathId}/overview`);
  },
};

export default learningPathV2Service;
