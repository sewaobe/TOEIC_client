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
    }
}

export default userTestService;