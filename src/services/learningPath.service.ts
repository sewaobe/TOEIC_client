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

    static fail<T = null>(
        message: string,
        errors: any = null
    ): ApiResponse<T> {
        return new ApiResponse<T>(false, null, message, errors);
    }
}

const learningPathService = {
  // Lấy lộ trình hiện tại của user
  getUserLearningPath: async () => {
    const res = await axiosClient.get<ApiResponse<any>>("/learning-path/");
    return res.data;
  },

  // Tạo lộ trình mới từ draft payload
  createUserLearningPath: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<any>>(
      "/learning-path/",
      payload
    );
    console.log(res);
    return res.data;
  },
};

export default learningPathService;
