import axiosClient from "./axiosClient";

interface User {
  _id: string;
  username: string;
  email: string;
  profile?: {
    fullname: string;
    avatar: string;
  };
}

const userService = {
  getCurrentUser: async (): Promise<{ fullname: string; email: string; avatar: string }> => {
    const res = await axiosClient.get<User>("/users/me", {
      withCredentials: true,
    });
console.log("userService - getCurrentUser response:", res.data);
    // API trả {"profile":{"fullname":"..."}, "email":"..."}
    return {
      fullname: res.data.profile?.fullname || "Nguyễn Văn A",
      email: res.data.email || "abc@gmail.com",
      avatar: res.data.profile?.avatar || "",
    };
  },
    updateUserProfile: async (data: { fullname: string; email: string; avatar: string }) => {
        const res = await axiosClient.put("/users/me", data, {
        withCredentials: true,
        });
        return res.data;
    },
};

export default userService;
