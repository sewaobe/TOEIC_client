import { z } from 'zod';
export const loginSchema = z.object({
  username: z.string().min(6, { message: 'Username phải ít nhất có 6 kí tự' }),
  password: z.string().min(8, { message: 'Mật khẩu phải ít thiểu 8 kí tự' }),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;
