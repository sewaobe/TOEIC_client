import { Attempt } from "../components/flashCardItem/FlashCardHistory";
import { Log } from "../components/flashCardItem/StatisticsModal";
import { FlashcardItem } from "../components/modals/CreateFlashcardItemModal";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./learningPath.service";

export const flashCardService = {
  getFlashcardById: async (
    id: string
  ): Promise<{ topic_id: string; dataVocabularies: FlashcardItem[] }> => {
    const res = await axiosClient.get<ApiResponse<any>>(`/flash-card/${id}`);

    const data = res.data || {};
    const ids: string[] = data._id || [];
    const wordsArr: string[] = data.word || [];
    const defsArr: string[] = data.definition || [];
    const phoneticsArr: string[] = data.phonetic || [];
    const weightsArr: number[] = data.weight || [];

    const words: FlashcardItem[] = ids.map((idVal, index) => ({
      _id: idVal,
      word: wordsArr[index],
      definition: defsArr[index],
      phonetic: phoneticsArr[index],
      weight: weightsArr[index],
    }));

    return {
      topic_id: res.meta ? res.meta.topic_id : "",
      dataVocabularies: words,
    };
  },
  submitAttemptFlashCard: async (
    topic_id: string,
    total_count: number,
    accuracy: number,
    started_at: string,
    finished_at: string,
    logs: Log[],
    dayStudyId: string,
    activityId: string
  ): Promise<void> => {
    const res = await axiosClient.post("/flash-card/submit", {
      flashCardAttempt: {
        topic_id,
        total_count,
        accuracy,
        started_at,
        finished_at,
        duration:
          new Date(finished_at).getTime() - new Date(started_at).getTime(),
      },
      logs,
      dayStudyId,
      activityId,
    });
  },
  getHistoryFlashCardAttemptByTopic: async (
    topicId: string
  ): Promise<Attempt[]> => {
    const res = await axiosClient.get(`/flash-card/history/${topicId}`);
    return res.data;
  },
};
