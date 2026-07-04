import type { DictationAttemptLog } from "../types/Dictation";
import type {
  DictationProgress,
  DictationProgressDifficulty,
  DictationProgressPatch,
} from "../types/DictationProgress";
import axiosClient from "./axiosClient";

const BASE_URL = "/dictation-progress";

const unwrap = <T>(res: any): T => res.data ?? res;

export const dictationProgressService = {
  getActive: async (dictationId: string): Promise<DictationProgress | null> => {
    const res = await axiosClient.get(`${BASE_URL}/${dictationId}/active`);
    return unwrap<DictationProgress | null>(res);
  },

  start: async (
    dictationId: string,
    difficulty: DictationProgressDifficulty,
  ): Promise<DictationProgress> => {
    const res = await axiosClient.post(`${BASE_URL}/${dictationId}/start`, {
      difficulty,
    });
    return unwrap<DictationProgress>(res);
  },

  update: async (
    progressId: string,
    patch: DictationProgressPatch,
  ): Promise<DictationProgress> => {
    const res = await axiosClient.patch(`${BASE_URL}/${progressId}`, patch);
    return unwrap<DictationProgress>(res);
  },

  complete: async (
    progressId: string,
    patch: DictationProgressPatch & { attempts: DictationAttemptLog[] },
  ): Promise<{ progress: DictationProgress; attempts: DictationAttemptLog[] }> => {
    const res = await axiosClient.post(`${BASE_URL}/${progressId}/complete`, patch);
    return unwrap<{ progress: DictationProgress; attempts: DictationAttemptLog[] }>(res);
  },

  cancel: async (progressId: string): Promise<DictationProgress> => {
    const res = await axiosClient.post(`${BASE_URL}/${progressId}/cancel`);
    return unwrap<DictationProgress>(res);
  },
};
