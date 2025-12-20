import axiosClient from "./axiosClient";

const BASE_URL = "/irt";
export const IRT_SERVICE = {
  generateWeeklyPlan: async (
    testId: string,
    answers: {
      question_id: string;
      selectedOption: string;
    }[],
    duration: number,
    day_study_id?: string
  ) => {
    const res = await axiosClient.post(`${BASE_URL}/weekly-plan`, {
      testId,
      answers,
      duration,
      ...(day_study_id ? { day_study_id } : {}),
    });

    return {
      score: res.data.score,
      answers: res.data.detailedAnswers,
    };
  },
};
