import { Typography } from '@mui/material';
import BaseModal from './BaseModal';

interface ScoreModalProps {
  open: boolean;
  score: number;
  onClose: () => void;
}

const ScoreModal = ({ open, score, onClose }: ScoreModalProps) => {
  return (
    <BaseModal
      open={open}
      type="success"
      title="Kết quả bài thi"
      onConfirm={onClose}
      confirmText="OK"
    >
      <Typography variant="h6" align="center">
        Bạn đã đạt {score} điểm!
      </Typography>
    </BaseModal>
  );
};

export default ScoreModal;
