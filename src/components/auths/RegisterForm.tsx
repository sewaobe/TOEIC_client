// src/features/auth/components/RegisterForm.tsx
import { FC, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Link as MuiLink,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel';

interface RegisterFormProps {
  onSwitch: () => void; // chuyển lại Login
}

const RegisterForm: FC<RegisterFormProps> = ({ onSwitch }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useAuthViewModel.useRegisterForm?.() ?? ({} as any); // phòng khi hook tên khác

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = handleSubmit?.(useAuthViewModel.register) ?? (() => {});

  return (
    <Box
      component='form'
      onSubmit={onSubmit}
      sx={{
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Title */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          component='h1'
          variant='h4'
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          Create Account
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Fill the fields below to get started.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name='username'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Username'
              size='small'
              error={!!errors?.username}
              helperText={errors?.username?.message as string}
            />
          )}
        />

        <Controller
          name='email'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Email'
              size='small'
              error={!!errors?.email}
              helperText={errors?.email?.message as string}
            />
          )}
        />

        <Controller
          name='password'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Password'
              type={showPassword ? 'text' : 'password'}
              size='small'
              error={!!errors?.password}
              helperText={errors?.password?.message as string}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge='end'
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
      <Button
        type='submit'
        variant='contained'
        size='small'
        fullWidth
        sx={{ mt: 2, py: 1, textTransform: 'uppercase', fontWeight: 'bold' }}
      >
        Register
      </Button>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          mt: 3,
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          Already have an account?
        </Typography>
        <MuiLink
          component='button'
          type='button'
          onClick={onSwitch}
          variant='body2'
          underline='hover'
        >
          Back to Login
        </MuiLink>
      </Box>

      {/* Footer section */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant='caption' color='text.secondary' textAlign='center'>
          © {new Date().getFullYear()} TOEIC Master. All rights reserved.{' '}
        </Typography>
        <Typography
          variant='caption'
          color='text.secondary'
          textAlign='center'
          sx={{ cursor: 'pointer' }}
        >
          Private Policy
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;
