import axiosClient from "./axiosClient";

export const learningPathActivityService = {
  // Lesson
  submitLesson: async (lessonId: string, dayStudyId: string, timeSpentSec: number) =>
    axiosClient.post(`/lessons-learningpath/${lessonId}/complete`, {
      day_study_id: dayStudyId,
      time_spent: timeSpentSec,
    }),

  // Quiz
  getQuiz: async (quizId: string, dayStudyId?: string) => {
    const res = await axiosClient.get(`/quiz-learningpath/${quizId}`, {
      params: { day_study_id: dayStudyId },
    });
    return res.data?.data || res.data;
  },
  submitQuiz: async (
    quizId: string,
    answers: { question_id: string; user_answer: string }[],
    dayStudyId: string,
    timeSpentSec: number
  ) =>
    axiosClient.post(`/quiz-learningpath/${quizId}/submit`, {
      answers,
      time_spent: timeSpentSec,
      day_study_id: dayStudyId,
    }),

  // Dictation
  getDictation: async (dictationId: string, dayStudyId?: string) => {
    const res = await axiosClient.get(`/dictation-learningpath/${dictationId}`, {
      params: { day_study_id: dayStudyId },
    });
    return res.data?.data || res.data;
  },
  submitDictation: async (
    dictationId: string,
    data: any[],
    dayStudyId: string
  ) =>
    axiosClient.post(`/dictation-learningpath/${dictationId}/submit`, {
      data,
      day_study_id: dayStudyId,
    }),

  // Shadowing
  getShadowing: async (shadowingId: string, dayStudyId?: string) => {
    const res = await axiosClient.get(`/shadowing-learningpath/${shadowingId}`, {
      params: { day_study_id: dayStudyId },
    });
    return res.data?.data || res.data;
  },
  submitShadowing: async (
    shadowingId: string,
    data: any[],
    dayStudyId: string
  ) =>
    axiosClient.post(`/shadowing-learningpath/${shadowingId}/submit`, {
      data,
      day_study_id: dayStudyId,
    }),

  // Flashcard
  getFlashcard: async (topicId: string, dayStudyId?: string) => {
    const res = await axiosClient.get(`/flashcards-learningpath/${topicId}`, {
      params: { day_study_id: dayStudyId },
    });
    return res.data?.data || res.data;
  },
  submitFlashcard: async (
    topicId: string,
    payload: {
      accuracy?: number;
      learned_words?: string[];
      time_spent?: number;
      day_study_id: string;
    }
  ) => axiosClient.post(`/flashcards-learningpath/${topicId}/submit`, payload),
};

export default learningPathActivityService;
