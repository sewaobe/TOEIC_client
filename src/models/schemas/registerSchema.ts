import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Email invalid'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .trim()
    .regex(/^\S+$/, 'Password must not contain spaces')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter (A–Z)')
    .regex(/[0-9]/, 'Password must include at least one number (0–9)')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must include at least one special character',
    ),
  fullname: z
    .string()
    .trim()
    .min(1, 'Fullname is required')
    .max(100, 'Fullname must be less than 100 characters')
    .regex(/^[\p{L}\s]+$/u, 'Fullname must contain only letters and spaces'),
  username: z
    .string()
    .trim()
    .min(8, 'Username must be at least 8 characters long')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[a-z0-9_]+$/,
      'Username must contain only lowercase letters (a–z), numbers (0–9), and underscores',
    ),
});

export type RegisterFormInputs = z.infer<typeof registerSchema>;
