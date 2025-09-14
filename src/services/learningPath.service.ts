import axiosClient from "./axiosClient";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const learningPathService = {
  getUserLearningPath: async () => {
    const res = await axiosClient.get<ApiResponse<any>>("/learning-path/");
    console.log("User Learning Path:", res.data);
    return res.data;
  },
};

export default learningPathService;
