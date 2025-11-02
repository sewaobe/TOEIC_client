import { Dictation } from "../types/Dictation";
import axiosClient from "./axiosClient";

const BASE_URL = "/dictations";
export const dictationService = {
    async getAllDictationData(): Promise<Dictation[]> {
        const res = await axiosClient.get(`${BASE_URL}`);
        return res.data;
    },
    async getDictationById(id: string): Promise<Dictation> {
        const res = await axiosClient.get(`${BASE_URL}/${id}`);
        return res.data;
    }
}