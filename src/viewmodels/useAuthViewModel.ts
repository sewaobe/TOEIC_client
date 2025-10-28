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
import { getUserThunk, logout, setAuth } from '../stores/userSlice';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useAuthViewModel = () => {
  const { showToastAndRedirect } = useNavigateToast();
  const navigate = useNavigate();
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
  const login = async (data: LoginFormInputs, isRemember: boolean) => {
    try {
      const res = await authService.login(data, isRemember) as any;
      if (res?.meta?.role_name === "student") {
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

  const loginWithGoogle = async (tokenId: string) => {
    return toast.promise(
      (async () => {
        try {
          const res = await authService.loginWithGoogle(tokenId);
          // Kiểm tra quyền truy cập
          if (!res?.success || res?.meta?.role_name !== "student") {
            throw new Error("Unauthorized");
          }
          // Cập nhật redux & load user
          dispatch(setAuth(true));
          await dispatch(getUserThunk());
          navigate('/home');
          
        } catch (error: any) {
          console.error("Login error:", error);
          // Logout local nếu xảy ra lỗi
          await authService.logout();
          dispatch(logout());
          navigate('/auth')
          throw error; // để toast.promise catch được và hiển thị error toast
        }
      })(),
      {
        loading: "Đang đăng nhập bằng Google...",
        success: "Đăng nhập thành công 🎉",
        error: "Đăng nhập thất bại. Vui lòng thử lại!",
      }
    );
  };

  return {
    useLoginForm,
    useRegisterForm,
    login,
    register,
    loginWithGoogle
  };
};
