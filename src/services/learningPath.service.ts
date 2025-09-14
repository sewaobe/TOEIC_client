import axiosClient from "./axiosClient";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
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
