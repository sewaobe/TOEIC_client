import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ReactNode } from 'react';

type ModalType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

interface BaseModalProps {
  open: boolean;
  type?: ModalType; // để tự chọn icon & màu
  title?: string;
  children: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const typeConfig: Record<ModalType, { icon: JSX.Element; color: string }> = {
  success: { icon: <CheckCircleIcon />, color: '#10B981' },
  error: { icon: <ErrorIcon />, color: '#EF4444' },
  info: { icon: <InfoIcon />, color: '#3B82F6' },
  warning: { icon: <WarningIcon />, color: '#F59E0B' },
  confirm: { icon: <HelpOutlineIcon />, color: '#2563EB' },
};

const BaseModal = ({
  open,
  type = 'info',
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Hủy',
}: BaseModalProps) => {
  const { icon, color } = typeConfig[type];

  return (
    <Dialog open={open} onClose={onCancel || onConfirm} PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color }}>
        {icon}
        {title || type.charAt(0).toUpperCase() + type.slice(1)}
      </DialogTitle>
      <DialogContent>
        <Box>{children}</Box>
      </DialogContent>
      <DialogActions>
        {onCancel && (
          <Button onClick={onCancel} sx={{ textTransform: 'none' }}>
            {cancelText}
          </Button>
        )}
        {onConfirm && (
          <Button
            onClick={onConfirm}
            variant="contained"
            sx={{ textTransform: 'none', backgroundColor: color, '&:hover': { backgroundColor: color } }}
          >
            {confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BaseModal;
