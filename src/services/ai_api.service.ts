import axiosAIClient from "./axiosAIClient";

const BASE_URL = "/sentence-eval";

export const AI_API_SERVICE = {
    submit_sentence_eval: async (student_def: string, correct_def: string): Promise<{
        feedback: string;
        similarity: number;
    }> => {
        const res = await axiosAIClient.post(`${BASE_URL}`, {
            student_def,
            correct_def
        })
        return res.data;
    }
}