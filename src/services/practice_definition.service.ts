import axiosClient from "./axiosClient";
import {
  PracticeDefinitionTopicsResponse,
  VocabularyWordsResponse,
  VocabularyWord,
} from "../types/PracticeDefinition";

const BASE_URL = "/practice-definition";

export const practiceDefinitionService = {
  /**
   * Lấy danh sách topics
   */
  async getTopics(params?: {
    page?: number;
    limit?: number;
    level?: string;
    search?: string;
    isPublic?: boolean;
    created_by?: string;
  }): Promise<PracticeDefinitionTopicsResponse> {
    const res = await axiosClient.get(`${BASE_URL}/topics`, { params });
    return res.data;
  },

  /**
   * Lấy chi tiết 1 topic
   */
  async getTopicById(topicId: string) {
    const res = await axiosClient.get(`${BASE_URL}/topics/${topicId}`);
    return res.data;
  },

  /**
   * Lấy danh sách vocabulary words của topic
   */
  async getVocabularyWordsByTopic(
    topicId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<VocabularyWordsResponse> {
    const res = await axiosClient.get(`${BASE_URL}/topics/${topicId}/words`, {
      params,
    });
    return res.data;
  },

  /**
   * Lấy random words để luyện tập
   */
  async getRandomVocabularyWords(
    topicId: string,
    count?: number
  ): Promise<VocabularyWord[]> {
    const res = await axiosClient.get(
      `${BASE_URL}/topics/${topicId}/words/random`,
      {
        params: { count },
      }
    );
    return res.data;
  },

  /**
   * Đánh giá định nghĩa từ vựng bằng Gemini AI
   */
  async evaluateDefinition(
    word: string,
    correctDefinition: string,
    studentDefinition: string
  ): Promise<{
    similarity: number;
    feedback: string;
    is_correct: boolean;
    standard_definition: string;
  }> {
    const res = await axiosClient.post(`${BASE_URL}/evaluate-definition`, {
      word,
      correct_definition: correctDefinition,
      student_definition: studentDefinition,
    });
    return res.data;
  },
};
