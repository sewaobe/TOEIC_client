// viewmodels/useAuthViewModel.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormInputs, loginSchema } from '../models/schemas/loginSchema';
import {
  RegisterFormInputs,
  registerSchema,
} from '../models/schemas/registerSchema';
import { useNavigateToast } from '../hooks/useNavigateToast';
import authService from '../services/authService';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../stores/store';
import { getUserThunk, setAuth } from '../stores/userSlice';

export const useAuthViewModel = () => {
  const { showToastAndRedirect } = useNavigateToast();
  const dispatch = useDispatch<AppDispatch>();

  // -------- Login ----------
  const useLoginForm = () => {
    return useForm<LoginFormInputs>({
      resolver: zodResolver(loginSchema),
      defaultValues: { username: '', password: '' },
    });
  };

  // -------- Register ----------
  const useRegisterForm = () => {
    return useForm<RegisterFormInputs>({
      resolver: zodResolver(registerSchema),
      defaultValues: { username: '', email: '', password: '', fullname: '' },
    });
  };

  // -------- Login ----------
  const login = async (data: LoginFormInputs) => {
    try {
      const res = await authService.login(data) as any;
      if (res?.meta?.role_name === "student") {
        localStorage.setItem("activeUserId", res.meta.user_id)
        dispatch(setAuth(true));
        dispatch(getUserThunk());
        showToastAndRedirect(
          'success',
          'Bạn đã đăng nhập thành công',
          '/home',
          'login-toast',
        );
      }
      else {
        showToastAndRedirect(
          'error',
          'Đăng nhập thất bại!',
          '/login',
          'login-toast',
        );
      }
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

  // -------- Register ----------
  const register = async (data: RegisterFormInputs, onSwitch: () => void) => {
    try {
      await authService.register(data);
      showToastAndRedirect(
        'success',
        'Bạn đã đăng ký thành công',
        '/login',
        'register-toast',
      );
      onSwitch();
    } catch (error) {
      showToastAndRedirect('error', 'Đăng ký thất bại!', '', 'register-toast');
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
