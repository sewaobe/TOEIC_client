import { DictionaryData } from "../types/Dictionary";
import axiosClient from "./axiosClient";

const BASE_URL = '/gemini';
export const dictionaryService = {
    async lookup(query: string): Promise<DictionaryData> {
        const res = await axiosClient.post(
            `${BASE_URL}/dictionary`,
            { query }
        );

        if (!res.data) {
            throw new Error("Không thể tra cứu từ điển");
        }

        return res.data.json;
    },
    async suggestWords(prefix: string): Promise<string[]> {
        if (!prefix.trim()) return [];

        try {
            const res = await fetch(
                `https://api.datamuse.com/sug?s=${encodeURIComponent(prefix)}`
            );

            if (!res.ok) {
                throw new Error("Lỗi khi gọi Datamuse API");
            }

            const data: { word: string; score: number }[] = await res.json();

            // Lọc gợi ý top 7 từ, loại trùng lặp
            const uniqueWords = Array.from(new Set(data.map((item) => item.word)));

            return uniqueWords.slice(0, 7);
        } catch (err) {
            console.error("Lỗi gợi ý Datamuse:", err);
            return [];
        }
    },
}