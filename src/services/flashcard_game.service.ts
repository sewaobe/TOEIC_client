import axiosClient from "./axiosClient";

const BASE_URL = "/flash-card";

export interface MatchingGameResult {
  totalPairs: number;
  correctPairs: number;
  wrongAttempts: number;
  score: number;
  timeSpent: number; // seconds
  // HLR data
  vocabularyIds?: string[];
  correctPairIds?: string[];
  wrongAttemptCounts?: Record<string, number>; // Map vocab_id -> số lần click sai
}

export interface WordRecallGameResult {
  totalWords: number;
  correctWords: number;
  wrongWords: number;
  totalScore: number;
  combo: number;
  wrongList: string[]; // danh sách từ sai
  timeSpent: number; // seconds
  // HLR data
  correctWordIds?: string[];
  wrongWordIds?: string[];
}

export const flashCardGameService = {
  // Submit Matching Game Result
  submitMatchingGame: async (
    topicId: string,
    result: MatchingGameResult,
    startedAt: string,
    finishedAt: string,
  ) => {
    const accuracy =
      result.totalPairs > 0
        ? Math.round((result.correctPairs / result.totalPairs) * 100)
        : 0;

    const res = await axiosClient.post(`${BASE_URL}/submit-game`, {
      topic_id: topicId,
      game_type: "matching",
      game_result: {
        totalPairs: result.totalPairs,
        correctPairs: result.correctPairs,
        wrongAttempts: result.wrongAttempts,
        score: result.score,
        accuracy,
        timeSpent: result.timeSpent,
        started_at: startedAt,
        finished_at: finishedAt,
        // HLR data
        vocabularyIds: result.vocabularyIds || [],
        correctPairIds: result.correctPairIds || [],
        wrongAttemptCounts: result.wrongAttemptCounts || {}, // Số lần sai cho từng từ
      },
    });
    return res.data;
  },

  // Submit Word Recall Game Result
  submitWordRecallGame: async (
    topicId: string,
    result: WordRecallGameResult,
    startedAt: string,
    finishedAt: string,
  ) => {
    const accuracy =
      result.totalWords > 0
        ? Math.round((result.correctWords / result.totalWords) * 100)
        : 0;

    const res = await axiosClient.post(`${BASE_URL}/submit-game`, {
      topic_id: topicId,
      game_type: "word_recall",
      game_result: {
        totalWords: result.totalWords,
        correctWords: result.correctWords,
        wrongWords: result.wrongWords,
        totalScore: result.totalScore,
        combo: result.combo,
        wrongList: result.wrongList,
        accuracy,
        timeSpent: result.timeSpent,
        started_at: startedAt,
        finished_at: finishedAt,
        // HLR data
        correctWordIds: result.correctWordIds || [],
        wrongWordIds: result.wrongWordIds || [],
      },
    });
    return res.data;
  },
};
