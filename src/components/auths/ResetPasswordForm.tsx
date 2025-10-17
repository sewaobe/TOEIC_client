import { FC, useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  step1Schema,
  step2Schema,
  step3Schema,
  Step1Inputs,
  Step2Inputs,
  Step3Inputs,
} from '../../models/schemas/resetPasswordSchema';

import authService from '../../services/authService';
import { useNavigateToast } from '../../hooks/useNavigateToast';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type ResetStep = 1 | 2 | 3;

const ResetPasswordForm: FC = () => {
  const [resetStep, setResetStep] = useState<ResetStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  // form step 1: email
  const form1 = useForm<Step1Inputs>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: '' },
  });

  // form step 2: otp
  const form2 = useForm<Step2Inputs>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: '' },
  });

  // form step 3: password
  const form3 = useForm<Step3Inputs>({
    resolver: zodResolver(step3Schema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  const handleStep1 = async (data: Step1Inputs) => {
    console.log('Step1 data:', data);
    await toast.promise(authService.sendOtp(data), {
      loading: 'Đang gửi OTP...',
      success: () => {
        setResetStep(2);
        return 'OTP đã được gửi đến email của bạn'
      },
      error: 'Gửi OTP thất bại. Vui lòng thử lại.',
    });

  };

  const handleStep2 = async (data: Step2Inputs) => {
    console.log('Step2 data:', data);
    const emailFromStep1 = form1.getValues('email');
    await toast.promise(authService.verifyOtp({ ...data, email: emailFromStep1 }), {
      loading: 'Đang xác thực OTP...',
      success: () => {
        setResetStep(3);
        return 'Xác thực OTP thành công'
      },
      error: 'Xác thực OTP thất bại. Vui lòng thử lại.',
    });
  };

  const handleStep3 = async (data: Step3Inputs) => {
    console.log('Step3 data:', data);
    const emailFromStep1 = form1.getValues('email');
    const otpFromStep2 = form2.getValues('otp');
    await toast.promise(authService.resetPassword({
      newPassword: data.newPassword,
      email: emailFromStep1,
      otp: otpFromStep2,
    }), {
      loading: 'Đang đặt lại mật khẩu...',
      success: () => {
        navigate('/login');
        return 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.'
      },
      error: 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.',
    });

    form1.reset();
    form2.reset();
    form3.reset();
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {resetStep === 1 && (
        <Box component='form' onSubmit={form1.handleSubmit(handleStep1)}>
          <Controller
            name='email'
            control={form1.control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Email'
                type='email'
                error={!!form1.formState.errors.email}
                helperText={form1.formState.errors.email?.message}
                fullWidth
              />
            )}
          />
          <Button type='submit' variant='contained' fullWidth sx={{ mt: 2 }}>
            Send OTP
          </Button>
        </Box>
      )}

      {resetStep === 2 && (
        <Box component='form' onSubmit={form2.handleSubmit(handleStep2)}>
          <Controller
            name='otp'
            control={form2.control}
            render={({ field }) => (
              <Box display='flex' gap={1} justifyContent='center'>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <TextField
                    key={idx}
                    value={(field.value ?? '').charAt(idx) || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      const otpArr = (field.value ?? '').split('');
                      otpArr[idx] = val;
                      field.onChange(otpArr.join(''));
                      if (val && idx < 5) {
                        otpRefs.current[idx + 1]?.focus();
                      }
                    }}
                    inputRef={(el) => (otpRefs.current[idx] = el)}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center', fontSize: '18px' },
                    }}
                    sx={{ width: 45 }}
                  />
                ))}
              </Box>
            )}
          />
          {form2.formState.errors.otp && (
            <Typography color='error' textAlign='center' fontSize={12}>
              {form2.formState.errors.otp.message}
            </Typography>
          )}
          <Button type='submit' variant='contained' fullWidth sx={{ mt: 2 }}>
            Verify OTP
          </Button>
        </Box>
      )}

      {resetStep === 3 && (
        <Box component='form' onSubmit={form3.handleSubmit(handleStep3)}>
          <Controller
            name='newPassword'
            control={form3.control}
            render={({ field }) => (
              <TextField
                {...field}
                label='New Password'
                type={showPassword ? 'text' : 'password'}
                error={!!form3.formState.errors.newPassword}
                helperText={form3.formState.errors.newPassword?.message}
                sx={{ marginBottom: '10px' }}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowPassword((p) => !p)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name='confirmNewPassword'
            control={form3.control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Confirm Password'
                type={showConfirmPassword ? 'text' : 'password'}
                error={!!form3.formState.errors.confirmNewPassword}
                helperText={form3.formState.errors.confirmNewPassword?.message}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowConfirmPassword((p) => !p)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Button type='submit' variant='contained' fullWidth sx={{ mt: 2 }}>
            Reset Password
          </Button>
        </Box>
      )}

      <Typography variant='body2' textAlign='center' mt={2}>
        Don’t have an account?{' '}
        <Button variant='text' size='small' onClick={() => navigate('/login')}>
          Register Now
        </Button>
      </Typography>
    </Box>
  );
};

export default ResetPasswordForm;
