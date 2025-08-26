// types/user.ts
export interface User {
  fullname: string;
  email: string;
}

// Nếu API trả về đúng kiểu { fullname, email }
// thì có thể khai báo như này
export interface UserResponse {
  fullname: string;
  email: string;
}
