import { Word } from "../components/flashCardItem/FlashCard";
import { Attempt } from "../components/flashCardItem/FlashcardHistory";
import { Log } from "../components/flashCardItem/StatisticsModal";
import axiosClient from "./axiosClient";
import { ApiResponse } from "./learningPath.service";


export const flashCardService = {
  getFlashcardById: async (id: string): Promise<{ topic_id: string, dataVocabularies: Word[] }> => {
    const res = await axiosClient.get<ApiResponse<any[]>>(`/flash-card/${id}`);
    console.log('getFlashcardById', res);
    // map từ API response sang Word[]
    const words: Word[] = res.data ? res.data.map((item: any) => ({
      _id: item._id,
      word: item.word,
      meaning: item.definition,
      example: item.phonetic,
      weight: item.weight
    })) : [];

    return { topic_id: res.meta ? res.meta.topic_id : "", dataVocabularies: words };
  },
  submitAttemptFlashCard: async (
    topic_id: string,
    total_count: number,
    accuracy: number,
    started_at: string,
    finished_at: string,
    logs: Log[],
    dayStudyId: string,
    activityId: string,
  ): Promise<void> => {
    console.log(dayStudyId, activityId)
    const res = await axiosClient.post("/flash-card/submit",
      {
        flashCardAttempt: {
          topic_id,
          total_count,
          accuracy,
          started_at,
          finished_at,
          duration: new Date(started_at).getTime() - new Date(finished_at).getTime()
        },
        logs,
        dayStudyId,
        activityId
      }
    )
  },
  getHistoryFlashCardAttemptByTopic: async (topicId: string): Promise<Attempt[]> => {
    const res = await axiosClient.get(`/flash-card/history/${topicId}`);
    console.log("Get history flash card attempt by topic", res);
    return res.data;
  }
};
