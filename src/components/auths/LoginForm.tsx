import { FC, useState } from 'react';
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
} from '@mui/material';
import {
  Google,
  Facebook,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { Controller } from 'react-hook-form';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel.ts';

interface LoginFormProps {
  onSwitch: () => void; // chuyển sang Register
}

const LoginForm: FC<LoginFormProps> = ({ onSwitch }) => {
  const authViewModel = useAuthViewModel();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = authViewModel.useLoginForm();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onSubmit = handleSubmit(authViewModel.login);

  return (
    <Box
      component='form'
      onSubmit={onSubmit}
      sx={{
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title & Description */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          component='h1'
          variant='h4'
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          Welcome Back
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Please enter your details to sign in.
        </Typography>
      </Box>
      {/* Inputs */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name='username'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label='Username'
              variant='outlined'
              error={!!errors.username}
              helperText={errors.username?.message}
              size='small'
              autoFocus
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
              variant='outlined'
              error={!!errors.password}
              helperText={errors.password?.message}
              size='small'
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
      {/* Options */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          my: 2,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              color='primary'
            />
          }
          label={<Typography variant='body2'>Remember Me</Typography>}
        />
        <MuiLink href='#' variant='body2' underline='hover'>
          Forgot Password?
        </MuiLink>
      </Box>
      {/* Login */}
      <Button
        type='submit'
        variant='contained'
        size='small'
        fullWidth
        sx={{ py: 1, textTransform: 'uppercase', fontWeight: 'bold' }}
      >
        Login
      </Button>
      {/* Divider */}
      <Divider sx={{ my: 3 }}>
        <Typography variant='body2' color='text.secondary'>
          OR
        </Typography>
      </Divider>
      {/* Social */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Button
          variant='outlined'
          fullWidth
          startIcon={<Google />}
          sx={{
            color: '#DB4437',
            borderColor: '#DB4437',
            '&:hover': {
              backgroundColor: 'rgba(219, 68, 55, 0.04)',
              borderColor: '#DB4437',
            },
          }}
        >
          Google
        </Button>
        <Button
          variant='outlined'
          fullWidth
          startIcon={<Facebook />}
          sx={{
            color: '#1877F2',
            borderColor: '#1877F2',
            '&:hover': {
              backgroundColor: 'rgba(24, 119, 242, 0.04)',
              borderColor: '#1877F2',
            },
          }}
        >
          Facebook
        </Button>
      </Box>
      {/* Register link */}
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
          Don't Have An Account?
        </Typography>
        <MuiLink
          component='button'
          type='button'
          onClick={onSwitch}
          variant='body2'
          underline='hover'
        >
          Register Now
        </MuiLink>
      </Box>
      {/* Footer section */}{' '}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {' '}
        <Typography variant='caption' color='text.secondary' textAlign='center'>
          {' '}
          © {new Date().getFullYear()} TOEIC Master. All rights reserved.{' '}
        </Typography>{' '}
        <Typography
          variant='caption'
          color='text.secondary'
          textAlign='center'
          sx={{ cursor: 'pointer' }}
        >
          {' '}
          Private Policy{' '}
        </Typography>{' '}
      </Box>
    </Box>
  );
};

export default LoginForm;
