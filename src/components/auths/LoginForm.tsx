import { FC, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Link as MuiLink,
  CircularProgress,
} from "@mui/material";
import {
  Google,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { useAuthViewModel } from "../../viewmodels/useAuthViewModel.ts";
import { signInWithGoogle } from "../../hooks/useFirebaseAuth.ts";
import BannedAccountModal from "../BannedAccountModal";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
interface LoginFormProps {
  onSwitch: () => void; // chuyển sang Register
}

const LoginForm: FC<LoginFormProps> = ({ onSwitch }) => {
  const authViewModel = useAuthViewModel();
  const { loginWithGoogle, bannedInfo, showBannedModal, closeBannedModal } =
    authViewModel;

  // 🌀 State cho Google login loading
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const cred = await signInWithGoogle();
      if (cred) {
        const { user } = cred;
        const idToken = await user.getIdToken();
        console.log("Google ID Token:", user);
        await loginWithGoogle(idToken);
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      if (err.code === "auth/popup-closed-by-user") {
        console.warn("User closed the popup.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = authViewModel.useLoginForm();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = handleSubmit((data) => {
    authViewModel.login(data, rememberMe);
  });

  const navigate = useNavigate();

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <Box sx={{ position: "relative", mb: 4, textAlign: "center", width: "100%" }}>
        {/* Nút Back được neo ở góc trên cùng bên trái */}
        <IconButton
          color="primary"
          sx={{ position: "absolute", left: -8, top: 0 }}
          onClick={() => navigate("/")}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography
          component="h1"
          variant="h4"
          sx={{ fontWeight: "bold", mb: 1 }}
        >
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please enter your details to sign in.
        </Typography>
      </Box>

      {/* Inputs */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Username"
              variant="outlined"
              error={!!errors.username}
              helperText={errors.username?.message}
              size="small"
              autoFocus
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password?.message}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Box>

      {/* Options */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          my: 2,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              color="primary"
            />
          }
          label={<Typography variant="body2">Remember Me</Typography>}
        />
        <MuiLink href="/reset-password" variant="body2" underline="hover">
          Forgot Password?
        </MuiLink>
      </Box>

      {/* Login Button */}
      <Button
        type="submit"
        variant="contained"
        size="small"
        fullWidth
        sx={{ py: 1, textTransform: "uppercase", fontWeight: "bold" }}
      >
        Login
      </Button>

      {/* Divider */}
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>

      {/* Social Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          fullWidth
          startIcon={
            googleLoading ? (
              <CircularProgress size={20} sx={{ color: "#DB4437" }} />
            ) : (
              <Google />
            )
          }
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          sx={{
            color: "#DB4437",
            borderColor: "#DB4437",
            "&:hover": {
              backgroundColor: "rgba(219, 68, 55, 0.04)",
              borderColor: "#DB4437",
            },
          }}
        >
          {googleLoading ? "Signing in..." : "Google"}
        </Button>
      </Box>

      {/* Register Link */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          mt: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Don't Have An Account?
        </Typography>
        <MuiLink
          component="button"
          type="button"
          onClick={onSwitch}
          variant="body2"
          underline="hover"
        >
          Register Now
        </MuiLink>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "30px",
        }}
      >
        <Typography variant="caption" color="text.secondary" textAlign="center">
          © {new Date().getFullYear()} TOEIC Smart. All rights reserved.
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="center"
          sx={{ cursor: "pointer" }}
        >
          Private Policy
        </Typography>
      </Box>

      {/* Banned Account Modal */}
      <BannedAccountModal
        open={showBannedModal}
        onClose={closeBannedModal}
        banInfo={bannedInfo}
      />
    </Box>
  );
};

export default LoginForm;
