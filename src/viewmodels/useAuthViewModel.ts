import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormInputs, loginSchema } from "../models/schemas/loginSchema";
import {
  RegisterFormInputs,
  registerSchema,
} from "../models/schemas/registerSchema";
import { useNavigateToast } from "../hooks/useNavigateToast";
import authService, { BannedAccountError } from "../services/authService";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../stores/store";
import { getUserThunk, logout, setAuth } from "../stores/userSlice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useAuthViewModel = () => {
  const { showToastAndRedirect } = useNavigateToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [bannedInfo, setBannedInfo] = useState<BannedAccountError | null>(null);
  const [showBannedModal, setShowBannedModal] = useState(false);

  // -------- Login ----------
  const useLoginForm = () => {
    return useForm<LoginFormInputs>({
      resolver: zodResolver(loginSchema),
      defaultValues: { username: "", password: "" },
    });
  };

  // -------- Register ----------
  const useRegisterForm = () => {
    return useForm<RegisterFormInputs>({
      resolver: zodResolver(registerSchema),
      defaultValues: { username: "", email: "", password: "", fullname: "" },
    });
  };

  // -------- Login ----------
  const login = async (data: LoginFormInputs, isRemember: boolean) => {
    try {
      const res = (await authService.login(data, isRemember)) as any;
      if (res?.meta?.role_name === "student") {
        dispatch(setAuth(true));
        dispatch(getUserThunk());
        showToastAndRedirect(
          "success",
          "Bạn đã đăng nhập thành công",
          "/home",
          "login-toast"
        );
      } else {
        showToastAndRedirect(
          "error",
          "Đăng nhập thất bại!",
          "/login",
          "login-toast"
        );
      }
    } catch (error: any) {
      console.log("Login error:", error);
      console.log("Error response:", error.response);
      console.log("Error response data:", error.response?.data);

      // Kiểm tra nếu là lỗi account bị ban
      if (error.response?.status === 403) {
        const errorData = error.response?.data;
        // Backend trả về data trong field 'data' của ApiResponse
        if (errorData?.data) {
          console.log("Banned account detected:", errorData.data);
          setBannedInfo(errorData.data);
          setShowBannedModal(true);
          return;
        }
      }

      const errorMessage =
        error.response?.data?.message || "Đăng nhập thất bại!";
      showToastAndRedirect("error", errorMessage, "/login", "login-toast");
      console.error(error);
    }
  };

  // -------- Register ----------
  const register = async (data: RegisterFormInputs, onSwitch: () => void) => {
    try {
      await authService.register(data);
      showToastAndRedirect(
        "success",
        "Bạn đã đăng ký thành công",
        "/login",
        "register-toast"
      );
      onSwitch();
    } catch (error) {
      showToastAndRedirect("error", "Đăng ký thất bại!", "", "register-toast");
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
          navigate("/home");
        } catch (error: any) {
          console.error("Login error:", error);
          console.log("Error response:", error.response);
          console.log("Error response data:", error.response?.data);

          // Kiểm tra nếu là lỗi account bị ban
          if (error.response?.status === 403) {
            const errorData = error.response?.data;
            if (errorData?.data) {
              console.log("Banned account detected (Google):", errorData.data);
              setBannedInfo(errorData.data);
              setShowBannedModal(true);
              throw new Error("Account is banned");
            }
          }

          // Logout local nếu xảy ra lỗi
          await authService.logout();
          dispatch(logout());
          navigate("/auth");
          throw error; // để toast.promise catch được và hiển thị error toast
        }
      })(),
      {
        loading: "Đang đăng nhập bằng Google...",
        success: "Đăng nhập thành công 🎉",
        error: (err) => {
          if (err.message === "Account is banned") {
            return "Tài khoản của bạn đã bị khóa";
          }
          return "Đăng nhập thất bại. Vui lòng thử lại!";
        },
      }
    );
  };

  const closeBannedModal = () => {
    setShowBannedModal(false);
    setBannedInfo(null);
  };

  return {
    useLoginForm,
    useRegisterForm,
    login,
    register,
    loginWithGoogle,
    bannedInfo,
    showBannedModal,
    closeBannedModal,
  };
};
