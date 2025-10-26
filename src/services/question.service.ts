import axiosClient from "./axiosClient"

const BASE_URL = 'questions'
export const questionService = {
    getQuestionByIdFromGroup: async (questionId: string, testId: string) => {
        const res = await axiosClient.get(`${BASE_URL}/${questionId}`, {
            params: {
                test_id: testId
            }
        })

        return {
            ...res.data,
            imagesUrl: res.data.imagesUrl.map((img: any) => img.url),
            audioUrl: res.data.audioUrl ? res.data.audioUrl.url : null,
        }
    }
}