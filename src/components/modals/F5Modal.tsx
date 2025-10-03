// F5Modal.tsx
import { useEffect, useState } from 'react';
import BaseModal from './BaseModal';

interface F5ModalProps {
  title?: string;
  content?: string;
  onConfirm: () => void; // reload page hoặc navigate
}

const F5Modal = ({
  title = "Cảnh báo rời trang",
  content = "Bạn có chắc chắn muốn rời khỏi trang không? Mọi dữ liệu chưa lưu có thể bị mất.",
  onConfirm }: F5ModalProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BaseModal
      open={open}
      type="error"
      title={title}
      onConfirm={() => {
        setOpen(false);
        onConfirm();
      }}
      onCancel={() => setOpen(false)}
      confirmText="Xác nhận"
      cancelText="Hủy"
    >
      {content}
    </BaseModal>
  );
};

export default F5Modal;
