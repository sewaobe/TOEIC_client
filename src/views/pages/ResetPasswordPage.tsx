import { Box, Paper, Typography } from '@mui/material';
import ResetPasswordForm from '../../components/auths/ResetPasswordForm';

const ResetPasswordPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Header */}
        <Typography
          variant='h4'
          fontWeight='bold'
          textAlign='center'
          color='primary'
        >
          TOEIC Master
        </Typography>
        <Typography variant='body1' textAlign='center' color='text.secondary'>
          Đặt lại mật khẩu của bạn
        </Typography>

        {/* Form */}
        <ResetPasswordForm />
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
