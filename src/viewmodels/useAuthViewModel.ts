import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoginFormInputs, loginSchema } from '../models/schemas/loginSchema';
import {
  RegisterFormInputs,
  registerSchema,
} from '../models/schemas/registerSchema';
import { useNavigateToast } from '../hooks/useNavigateToast';
export const useAuthViewModel = () => {
  const { showToastAndRedirect } = useNavigateToast();

  const useLoginForm = () => {
    return useForm<LoginFormInputs>({
      resolver: zodResolver(loginSchema),
      defaultValues: { username: '', password: '' },
    });
  };

  const useRegisterForm = () => {
    return useForm<RegisterFormInputs>({
      resolver: zodResolver(registerSchema),
      defaultValues: { username: '', email: '', password: '', fullname: '' },
    });
  };

  const login = async (data: LoginFormInputs) => {
    try {
      console.log('Login data', data);
      showToastAndRedirect(
        'success',
        'Bạn đã đăng nhập thành công',
        '/overview-test',
        'login-toast',
      );
    } catch (error) {
      showToastAndRedirect(
        'error',
        'Đăng nhập thất bại!',
        '/login',
        'login-toast',
      );
      console.error(error);
    }
  };

  const register = async (data: RegisterFormInputs) => {
    try {
      console.log('Register data', data);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    useLoginForm,
    useRegisterForm,
    login,
    register,
  };
};
