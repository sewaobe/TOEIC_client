import { TranslationData } from "../types/Translation";
import axiosClient from "./axiosClient";

const BASE_URL = "/gemini"
export const translationService = {
    async translateText(
        sourceLang: string,
        targetLang: string,
        text: string
    ): Promise<TranslationData> {
        const res = await axiosClient.post(`${BASE_URL}/translate`, {
            sourceLang,
            targetLang,
            text
        });

        if (!res.data) {
            throw new Error("Không thể dịch văn bản");
        }

        return res.data.json;
    }
}