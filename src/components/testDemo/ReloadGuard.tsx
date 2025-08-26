import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

const ReloadGuard = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bắt phím F5 hoặc Ctrl+R
      if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    navigate('/home');
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Cảnh báo</DialogTitle>
      <DialogContent>Bạn có chắc chắn muốn rời khỏi trang không?</DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Hủy</Button>
        <Button color='error' onClick={handleConfirm}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReloadGuard;
