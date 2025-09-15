import { RawAnswer } from "../utils/mapAnswersToParts";
import axiosClient from "./axiosClient"

const userTestService = {
    getUserTestHistories: async (page: number = 1, limit: number = 3, testId: string) => {
        const res = await axiosClient.get(`/tests/${testId}/history`, {
            params: {
                page,
                limit
            }
        });
        console.log("History Test", res.data);
        return res.data;
    },
    getTestHistoryDetail: async (historyId: string): Promise<{
        score: number,
        answers: RawAnswer[],
        completedPart: string,
        duration: number;
        submit_at: Date
    }> => {
        const res = await axiosClient.get(`/user-test/${historyId}`);
        console.log("Test Detail", res);
        return res.data;
    }
}

export default userTestService;