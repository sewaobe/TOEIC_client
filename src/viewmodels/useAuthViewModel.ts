import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoginFormInputs, loginSchema } from '../models/schemas/loginSchema';
import {
  RegisterFormInputs,
  registerSchema,
} from '../models/schemas/registerSchema';
export const useAuthViewModel = {
  useLoginForm() {
    return useForm<LoginFormInputs>({
      resolver: zodResolver(loginSchema),
      defaultValues: { username: '', password: '' },
    });
  },
  useRegisterForm() {
    return useForm<RegisterFormInputs>({
      resolver: zodResolver(registerSchema),
      defaultValues: { username: ' ', email: '', password: '', fullname: '' },
    });
  },

  async login(data: LoginFormInputs) {
    console.log('Login data', data);
  },
  async register(data: RegisterFormInputs) {
    console.log('Register data', data);
  },
};
