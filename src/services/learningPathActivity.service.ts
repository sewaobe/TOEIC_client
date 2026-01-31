import axiosClient from "./axiosClient";

export const learningPathActivityService = {
  // Lesson
  submitLesson: async (
    lessonId: string,
    dayStudyId: string,
    timeSpentSec: number
  ) => {
    const res = await axiosClient.post(`/lessons-learningpath/${lessonId}/complete`, {
      day_study_id: dayStudyId,
      time_spent: timeSpentSec,
    })

    if (res.data.day_completed) {
      localStorage.setItem('day_study_completed', 'true');
    }
  },

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
  ) => {
    const res = await axiosClient.post(`/quiz-learningpath/${quizId}/submit`, {
      answers,
      time_spent: timeSpentSec,
      day_study_id: dayStudyId,
    });

    if (res.data.day_completed) {
      localStorage.setItem('day_study_completed', 'true');
    }
  },

  // Dictation
  getDictation: async (dictationId: string, dayStudyId?: string) => {
    const res = await axiosClient.get(
      `/dictation-learningpath/${dictationId}`,
      {
        params: { day_study_id: dayStudyId },
      }
    );
    return res.data?.data || res.data;
  },
  submitDictation: async (
    dictationId: string,
    data: any[],
    dayStudyId: string
  ) => {
    const res = await axiosClient.post(`/dictation-learningpath/${dictationId}/submit`, {
      data,
      day_study_id: dayStudyId,
    });

    if (res.data.day_completed) {
      localStorage.setItem('day_study_completed', 'true');
    }
  },
  // Shadowing
  getShadowing: async (shadowingId: string, dayStudyId?: string) => {
    const res = await axiosClient.get(
      `/shadowing-learningpath/${shadowingId}`,
      {
        params: { day_study_id: dayStudyId },
      }
    );
    return res.data?.data || res.data;
  },
  submitShadowing: async (
    shadowingId: string,
    data: any[],
    dayStudyId: string
  ) => {
    const res = await axiosClient.post(`/shadowing-learningpath/${shadowingId}/submit`, {
      data,
      day_study_id: dayStudyId,
    });

    if (res.data.day_completed) {
      localStorage.setItem('day_study_completed', 'true');
    }
  },
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
  ) => {
    const res = await axiosClient.post(`/flashcards-learningpath/${topicId}/submit`, payload);
    if (res.data.day_completed) {
      localStorage.setItem('day_study_completed', 'true');
    }
  },

  // Mini Test - chỉ cần complete activity (submit đã xử lý ở TestHeader)
  completeMiniTest: async (
    testId: string,
    dayStudyId: string,
    userTestId: string
  ) =>
    axiosClient.post(`/day-study/${dayStudyId}/complete-activity`, {
      activity_id: testId,
      activity_type: "MINI_TEST",
      attempt_id: userTestId,
    }),
};

export default learningPathActivityService;
