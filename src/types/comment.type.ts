export interface IUserProfile {
  fullname: string;
  avatar: string;
}

export interface IUser {
  _id: string;
  username: string;
  profile: IUserProfile;
}

// Comment trên client đã có replies
export interface IComment {
  _id: string;
  user_id: IUser;
  test_id: string;
  parent_id: string | null;
  content: string;
  create_at: string;
  __v: number;
  replies?: IComment[]; // thêm optional, server trả về hoặc rỗng
}

export interface CommentPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CommentListResponse {
  comments: IComment[];
  pagination: CommentPagination;
}

export interface CommentSingleResponse {
  data: IComment;
}
