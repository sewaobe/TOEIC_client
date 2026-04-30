import { SortValue } from "../components/practices/shadowing-list-v2/ShadowingLessonSectionModal"
import { DB, Level, ShadowingCategory, ShadowingLessonProgress, ShadowingSummaryLesson } from "../views/pages/PracticeShadowingListPageV2"
import axiosClient from "./axiosClient"
import { ApiResponse } from "./learningPath.service"

const BASE_URL = '/v2/shadowings'

export const shadowingV2Service = {
    getList: async (query: {
        category: ShadowingCategory,
        level: Level,
        sortType?: SortValue,
        limit: number,
        page: number
    }) => {
        try {
            const res = await axiosClient.get<ApiResponse<ShadowingSummaryLesson[]>>(BASE_URL, { params: query });

            return res.data;
        } catch {
            return DB;
        }
    },
    getProgressByIds: async (shadowingIds: string[]) => {
        const res = await axiosClient.post<ApiResponse<ShadowingLessonProgress[]>>(`${BASE_URL}/progress`, { shadowingIds });

        return res.data;
    },
    getDetail: async(shadowingId: string) => {
        const res = await axiosClient.get(`${BASE_URL}/${shadowingId}`);

        return res.data;
    }
}