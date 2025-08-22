import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type ToastType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'loading'
  | 'normal';

export const useNavigateToast = () => {
  const navigate = useNavigate();

  const showToastAndRedirect = (
    type: ToastType,
    message: string,
    path: string,
    toastId?: string | number,
  ) => {
    switch (type) {
      case 'success':
        toast.success(message, toastId ? { id: toastId } : undefined);
        break;
      case 'info':
        toast.info(message, toastId ? { id: toastId } : undefined);
        break;
      case 'warning':
        toast.warning(message, toastId ? { id: toastId } : undefined);
        break;
      case 'error':
        toast.error(message, toastId ? { id: toastId } : undefined);
        break;
      case 'loading':
        toast.loading(message, toastId ? { id: toastId } : undefined);
        break;
      default:
        toast(message, toastId ? { id: toastId } : undefined);
    }

    navigate(path);
  };

  return { showToastAndRedirect };
};
