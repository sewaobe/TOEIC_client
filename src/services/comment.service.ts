import axiosClient from "./axiosClient";
import { IComment } from "../types/comment.type";
import { CommentListResponse } from "../types/comment.type";

const commentService = {
  getCommentsByTest: async (testId: string, page = 1, limit = 5) => {
    const res = await axiosClient.get<CommentListResponse>(
      `/comments/test/${testId}`,
      { params: { page, limit } }
    );
    return res.data;
  },

  getRepliesByComment: async (parentId: string, page = 1, limit = 5) => {
    const res = await axiosClient.get<CommentListResponse >(
      `/comments/${parentId}/replies?page=${page}&limit=${limit}`
    );
    return res.data;
  },

  createComment: async (testId: string, content: string, parentId?: string) => {
    const res = await axiosClient.post<IComment>(`/comments/test/${testId}`, {
      content,
      ...(parentId ? { parentId } : {}),
    });
    console.log("comment service:", res.data);
    return res.data;
  },
};

export default commentService;
