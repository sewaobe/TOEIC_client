import React from 'react';
import { Alert, Typography} from '@mui/material';

interface AlertBoxProps {
  severity?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'filled' | 'outlined' | 'standard';
  message: string | React.ReactNode;
  mb?: number; 
}

const AlertBox: React.FC<AlertBoxProps> = ({
  severity = 'info',
  variant = 'standard',
  message,
  mb = 4,
}) => {

  return (
    <Alert
      severity={severity}
      variant={variant}
      sx={{
        mb,
        borderRadius: 2,
        bgcolor: severity === 'info' ? 'primary.lighter' : undefined,
      }}
    >
      {typeof message === 'string' ? (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {message}
        </Typography>
      ) : (
        message
      )}
    </Alert>
  );
};

export default AlertBox;
