import BaseModal from './BaseModal';

interface ConfirmModalProps {
  open: boolean;
  message: string; // Nội dung modal
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  title?: string;
  type?: 'confirm' | 'warning' | 'info'; // Kiểu modal, mặc định confirm
}

const ConfirmModal = ({
  open,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  title,
  type = 'confirm',
}: ConfirmModalProps) => {
  return (
    <BaseModal
      open={open}
      type={type}
      title={title}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText={confirmText}
      cancelText={cancelText}
    >
      {message}
    </BaseModal>
  );
};

export default ConfirmModal;
