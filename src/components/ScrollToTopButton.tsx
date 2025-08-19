import { FC, useState, useEffect } from 'react';
import { Fab, Zoom, useTheme } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface ScrollToTopButtonProps {
  /**
   * Ngưỡng cuộn (bằng pixel) để nút bắt đầu hiện ra.
   * @default 1000
   */
  scrollThreshold?: number;
}

const ScrollToTopButton: FC<ScrollToTopButtonProps> = ({
  scrollThreshold = 1000,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  // Hàm xử lý việc hiển thị/ẩn nút dựa trên vị trí cuộn
  const handleScroll = () => {
    if (window.scrollY > scrollThreshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Hàm xử lý việc cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    // Thêm event listener khi component được mount
    window.addEventListener('scroll', handleScroll);

    // Dọn dẹp event listener khi component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold]); // Chỉ chạy lại effect nếu threshold thay đổi

  return (
    <Zoom in={isVisible}>
      <Fab
        color='primary'
        aria-label='scroll back to top'
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: theme.spacing(4), // Cách dưới 32px
          right: theme.spacing(4), // Cách phải 32px
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};

export default ScrollToTopButton;
