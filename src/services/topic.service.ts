import { FlashcardList } from "../views/pages/FlashCardPage";
import axiosClient from "./axiosClient"

const BASE_URL = '/ctv/topics'
export const topicService = {
    getAllTopicVocabulary: async (page = 1, limit = 7): Promise<{
        items: FlashcardList[];
        total: number;
        page: number;
        pageCount: number;
    }> => {
        const res = await axiosClient.get(`${BASE_URL}`, {
            params: {
                page,
                limit
            }
        })
        return res.data
    },
    createTopicVocabulary: async (data: any) => {
        const res = await axiosClient.post(`${BASE_URL}`, data)
        return res.data
    },
    updateTopicVocabulary: async (id: string, data: any) => {
        const res = await axiosClient.put(`${BASE_URL}/${id}`, data)
        return res.data
    },
    deleteTopicVocabulary: async (id: string) => {
        const res = await axiosClient.delete(`${BASE_URL}/${id}`)
        return res.data
    },
    getTopicVocabularyDetail: async (topicId: string, page=1, limit=10) => {
        const res = await axiosClient.get(`${BASE_URL}/${topicId}`, {
            params: {
                page,
                limit
            }
        })
        return res.data
    }
}