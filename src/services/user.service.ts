import axiosClient from "./axiosClient";
import { User } from "../types/user";

const userService = {

  getProfile: async (): Promise<{user:User}> => {
    const res = await axiosClient.get('/users/me');
    const user = res.data;
    console.log(user);
    return {user};
  },
  // Lấy user theo username
  getUserByUsername: async (username: string): Promise<{ user: User }> => {
    const res = await axiosClient.get(`/users/${username}`);
    console.log("userService - getUserByUsername response:", res.data);
    const user = res.data
    console.log("Formatted user object:", user);
    return { user };
  },

  updateUserProfile: async (data: {
    fullname: string;
    email: string;
    avatar: string;
  }) => {
    const res = await axiosClient.put("/users/me", data);
    return res.data;
  },
};

export default userService;
