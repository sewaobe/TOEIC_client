import { RegisterFormInputs } from "./../models/schemas/registerSchema";
import { LoginFormInputs } from "./../models/schemas/loginSchema";
import axiosClient from "./axiosClient";
import {
  ResetPasswordInputs,
  Step1Inputs,
  VerifyOtpInputs,
} from "../models/schemas/resetPasswordSchema";

export type ResetPasswordPayload = Omit<
  ResetPasswordInputs,
  "confirmNewPassword"
>;

export interface BannedAccountError {
  status: "banned" | "banned_permanent";
  banned_reason: string;
  banned_at?: string;
  banned_by: string;
  is_permanent: boolean;
}

const authService = {
  login: (data: LoginFormInputs, isRemember: boolean) =>
    axiosClient.post("/auth/login", { ...data, isRemember }),
  loginWithGoogle: async (idToken: String): Promise<any> => {
    const res = await axiosClient.post("/auth/google", { idToken });
    return res;
  },
  register: (data: RegisterFormInputs) =>
    axiosClient.post("/auth/register", data),
  sendOtp: (data: Step1Inputs) => axiosClient.post("/auth/request-otp", data),
  verifyOtp: (data: VerifyOtpInputs) =>
    axiosClient.post("/auth/verify-otp", data),
  resetPassword: (data: ResetPasswordPayload) =>
    axiosClient.post("/auth/reset-password", data),
  logout: () => axiosClient.post("/auth/logout"),
};

export default authService;
