import axiosClient from "./axiosClient";

export interface IApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors: any;
  meta?: any;
}

export class ApiResponse<T> implements IApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors: any;
  meta?: any;

  constructor(
    success: boolean,
    data: T | null,
    message: string,
    errors: any = null,
    meta: any = null
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.errors = errors;
    this.meta = meta;
  }

  static success<T>(
    data: T,
    message: string = "Success",
    meta: any = null
  ): ApiResponse<T> {
    return new ApiResponse<T>(true, data, message, null, meta);
  }

  static fail<T = null>(message: string, errors: any = null): ApiResponse<T> {
    return new ApiResponse<T>(false, null, message, errors);
  }
}

export interface LearningProgressOverview {
  completed_lessons: number;
  total_lessons: number;
  completion_rate: number;
  total_study_time: number;
  streak_days: number;
  current_score: number;
  target_score: number;
}

export interface WeekProgress {
  _id?: string;
  week_no: number;
  status: 'lock' | 'in_progress' | 'completed';
  progress: number; // %
  accuracy: number; // %
  started_at?: string;
  ended_at?: string;
  is_current: boolean;
  days?: any[]; // Include days array with IDs
}

export interface LearningProgressResponse {
  overview: LearningProgressOverview;
  weeks: WeekProgress[];
  current_week: number;
}

export interface SessionItem {
  kind: string;
  activity_id?: string;
  status: string;
  completed: boolean;
}

export interface SessionDetail {
  session_no: number;
  status: string;
  part_type?: number | null;
  items: SessionItem[];
}

export interface DayDetail {
  dayOfWeek: number;
  status: string;
  accuracy: number;
  progress: number;
  sessions: SessionDetail[];
}

export interface WeekDetailResponse {
  week_no: number;
  description: string;
  status: string;
  accuracy: number;
  days: DayDetail[];
}

export interface SessionData {
  start: string;
  end: string;
  activity: string;
  focus: number;
  understanding: number;
  correct: number;
  total: number;
  duration: number;
}

export interface DayDetailResponse {
  day_of_week: number;
  status: string;
  accuracy: number;
  sessions: SessionData[];
  metrics: {
    dayMinutesActual: number;
    dayMinutesPlanned: number;
    dailyEfficiency: number;
  };
}

export interface WeekStatsResponse {
  week_no: number;
  weekActual: number;
  weekPlanned: number;
  weeklyActualPerDay: number[];
  weeklyPlannedPerDay: number[];
}

export interface CumulativeStatsResponse {
  cumulativePlanned: number[];
  cumulativeActual: number[];
}

const learningPathService = {
  // Lấy lộ trình hiện tại của user
  getUserLearningPath: async () => {
    const res = await axiosClient.get<ApiResponse<any>>("/learning-path/");
    // axiosClient interceptor already returns response.data (the ApiResponse wrapper)
    // so return the wrapper itself to keep stable shape: { success, data, message }
    return res;
  },

  // Tạo lộ trình mới từ draft payload
  createUserLearningPath: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<any>>(
      "/learning-path/",
      payload
    );
    return res.data;
  },

  // Lấy tiến độ học tập (learning progress)
  getLearningProgress: async () => {
    const res = await axiosClient.get<ApiResponse<LearningProgressResponse>>(
      "/learning-path/progress"
    );
    return res;
  },

  // Lấy chi tiết 1 tuần học
  getWeekDetail: async (weekId: string) => {
    const res = await axiosClient.get<ApiResponse<WeekDetailResponse>>(
      `/learning-path/week/${weekId}`
    );
    return res;
  },

  // Lấy chi tiết 1 ngày học
  getDayDetail: async (dayId: string, date?: string) => {
    const params = date ? `?date=${date}` : '';
    const res = await axiosClient.get<ApiResponse<DayDetailResponse>>(
      `/learning-path/day/${dayId}${params}`
    );
    return res;
  },

  // Lấy thống kê tuần
  getWeekStats: async (weekId: string) => {
    const res = await axiosClient.get<ApiResponse<WeekStatsResponse>>(
      `/learning-path/week/${weekId}/stats`
    );
    return res;
  },

  // Lấy dữ liệu tích lũy
  getCumulativeStats: async () => {
    const res = await axiosClient.get<ApiResponse<CumulativeStatsResponse>>(
      `/learning-path/cumulative-stats`
    );
    return res;
  },
};

export default learningPathService;
