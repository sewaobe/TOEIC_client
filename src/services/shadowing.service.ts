import { Dictation } from "../types/Dictation";
import axiosClient from "./axiosClient";

const BASE_URL = "/shadowings";
export const shadowingService = {
    async getAllShadowingData(): Promise<Dictation[]> {
        const res = await axiosClient.get(`${BASE_URL}`);
        return res.data;
    },
    async getShadowingById(id: string): Promise<Dictation> {
        const res = await axiosClient.get(`${BASE_URL}/${id}`);
        return res.data;
    }
}