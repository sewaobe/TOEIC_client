import { SortValue } from "../components/practices/shadowing-list-v2/ShadowingLessonSectionModal"
import { Level, ShadowingCategory, ShadowingLessonProgress, ShadowingSummaryLesson } from "../views/pages/PracticeShadowingListPageV2"
import axiosClient from "./axiosClient"
import { ApiResponse } from "./learningPath.service"

const BASE_URL = '/v2/shadowings'

export interface ShadowingTiming {
    endTime: number;
    startTime: number;
    text: string;
    ipa: string;
    translationVi: string;
}

export interface ShadowingLessonDetail {
    id: string;
    title: string;
    level: string;
    part_type: number;
    source_type?: 'audio' | 'youtube';
    thumbnail: string;
    tags: string[];
    status: string;
    transcript: string;
    audio_url: string;
    duration: number;
    timings: ShadowingTiming[];
}

interface ShadowingDetailApi {
    _id: string;
    title: string;
    level: string;
    part_type: number;
    media_type?: 'audio' | 'youtube';
    thumbnailUrl?: string;
    tags?: string[];
    status?: string;
    transcript?: string;
    audio_url?: string;
    duration?: number;
    timings?: ShadowingTiming[];
}

export const shadowingV2Service = {
    getList: async (query: {
        category: ShadowingCategory,
        level: Level,
        sortType?: SortValue,
        limit: number,
        page: number
    }) => {
        const res = await axiosClient.get<ApiResponse<ShadowingSummaryLesson[]>>(BASE_URL, { params: query });

        return res.data;
    },
    getProgressByIds: async (shadowingIds: string[]) => {
        const res = await axiosClient.post<ApiResponse<ShadowingLessonProgress[]>>(`${BASE_URL}/progress`, { shadowingIds });

        return res.data;
    },
    getDetail: async (shadowingId: string) => {
        const res = await axiosClient.get<ApiResponse<ShadowingDetailApi>>(`${BASE_URL}/${shadowingId}`);
        const data = res.data;

        if (!data) {
            return null;
        }

        return {
            id: data._id,
            title: data.title,
            level: data.level,
            part_type: data.part_type,
            source_type: data.media_type || 'audio',
            thumbnail: data.thumbnailUrl || '',
            tags: data.tags || [],
            status: data.status || '',
            transcript: data.transcript || '',
            audio_url: data.audio_url || '',
            duration: data.duration || 0,
            timings: data.timings || [],
        } as ShadowingLessonDetail;
    }
}