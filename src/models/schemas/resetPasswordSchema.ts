import { z } from 'zod';

// Step 1: nhập email
export const step1Schema = z.object({
  email: z.string().email('Email không hợp lệ'),
});
export type Step1Inputs = z.infer<typeof step1Schema>;

// Step 2: nhập OTP
export const step2Schema = z.object({
  otp: z.string().length(6, 'OTP phải đủ 6 ký tự'),
});
export type Step2Inputs = z.infer<typeof step2Schema>;

// Step 3: nhập mật khẩu mới
export const step3Schema = z
  .object({
    newPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmNewPassword: z
      .string()
      .min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });
export type Step3Inputs = z.infer<typeof step3Schema>;

export const verifyOtpSchema = step1Schema.merge(step2Schema);
export type VerifyOtpInputs = z.infer<typeof verifyOtpSchema>;

export const resetPasswordSchema = verifyOtpSchema.merge(step3Schema);
export type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;
