export interface UserProfile {
  fullname: string;
  avatar: string;
}

export interface User {
  _id: string;
  role_name: string;
  username: string;
  email: string;
  isActive: boolean;
  created_at: string;
  profile: UserProfile;
}
