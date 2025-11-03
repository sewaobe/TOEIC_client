import axiosClient from "./axiosClient";

const BASE_URL = '/progress/statistic-result';

export interface OverviewStatistic {
    avgListening: number;
    avgReading: number;
    avgScore: number;
    year: number;
    month: number;
}

export interface SkillsOverview {
    listening: number;
    reading: number;
    vocabulary: number;
    speaking: number;
}

export interface SkillActivity {
    title: string;
    date: string;
    score: number;
    progress: string;
}

export interface PartAccuracyData {
    part: string;
    accuracy: number;
}

export interface PartAccuracyStats {
    listeningData: PartAccuracyData[];
    readingData: PartAccuracyData[];
}

export const progressService = {
    async getOverviewStatistic(): Promise<OverviewStatistic[]> {
        const res = await axiosClient.get(`${BASE_URL}/overview`);

        return res.data;
    },
    async getUserTestStatistics(
        year?: number,
        month?: number | "all",
    ): Promise<any> {
        const params: any = {};

        if (year) params.year = year;
        if (month) params.month = month;

        const res = await axiosClient.get(`${BASE_URL}/user-tests`, { params });

        return res.data;
    },
    
    // 🎯 API mới cho PracticeSkillPanel
    async getSkillsOverview(): Promise<SkillsOverview> {
        const res = await axiosClient.get(`${BASE_URL}/skills-overview`);
        return res.data;
    },
    
    async getSkillActivities(
        skillType: "listening" | "reading" | "vocabulary" | "speaking"
    ): Promise<SkillActivity[]> {
        const res = await axiosClient.get(`${BASE_URL}/skill-activities/${skillType}`);
        return res.data;
    },
    
    // 📊 API cho AccuracyComparisonChart
    async getPartAccuracyStats(
        year?: number,
        month?: number | "all"
    ): Promise<PartAccuracyStats> {
        const params: any = {};
        if (year) params.year = year;
        if (month) params.month = month;
        
        const res = await axiosClient.get(`${BASE_URL}/part-accuracy`, { params });
        return res.data;
    }
}
