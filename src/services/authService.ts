import { RegisterFormInputs } from './../models/schemas/registerSchema';
import { LoginFormInputs } from './../models/schemas/loginSchema';
import axiosClient from './axiosClient';
import {
  ResetPasswordInputs,
  Step1Inputs,
  VerifyOtpInputs,
} from '../models/schemas/resetPasswordSchema';
export type ResetPasswordPayload = Omit<
  ResetPasswordInputs,
  'confirmNewPassword'
>;
const authService = {
  login: (data: LoginFormInputs) => axiosClient.post('/auth/login', data),
  register: (data: RegisterFormInputs) =>
    axiosClient.post('/auth/register', data),
  sendOtp: (data: Step1Inputs) => axiosClient.post('/auth/request-otp', data),
  verifyOtp: (data: VerifyOtpInputs) =>
    axiosClient.post('/auth/verify-otp', data),
  resetPassword: (data: ResetPasswordPayload) =>
    axiosClient.post('/auth/reset-password', data),
};

export default authService;
