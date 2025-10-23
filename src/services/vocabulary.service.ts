import axiosClient from "./axiosClient";

const BASE_URL = "ctv/vocabularies";
export const vocabularyService = {
    createVocabulary: async (payload: any) => {
        const res = await axiosClient.post(`${BASE_URL}`, payload);
        return res.data;
    },
    updateVocabulary: async (id: string, data: any) => {
        const res = await axiosClient.put(`${BASE_URL}/${id}`, data);
        return res.data;
    },
    deleteVocabulary: async (id: string, topicId?: string) => {
        const res = await axiosClient.delete(`${BASE_URL}/${id}`, {
            params: {
                topicId
            }
        });
        return res.data;
    },
}