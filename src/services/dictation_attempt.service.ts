import { DictationAttemptLog } from "../types/Dictation";
import axiosClient from "./axiosClient";

const BASE_URL = '/dictation-attempts';
export const dictationAttemptService = {
    async createDictationAttempts(payload: Partial<DictationAttemptLog>[], dictationId: string): Promise<DictationAttemptLog[]> {
        const res = await axiosClient.post(`${BASE_URL}`, {
            data: payload,
            dictation_id: dictationId
        });
        return res.data;
    }
}