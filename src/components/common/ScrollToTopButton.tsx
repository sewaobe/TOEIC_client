import { FC, useState, useEffect } from 'react';
import { Fab, Zoom, useTheme } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface ScrollToTopButtonProps {
  /**
   * Ngưỡng cuộn (px) để nút hiện ra.
   * @default 1000
   */
  scrollThreshold?: number;

  /**
   * Selector của container scroll tùy chỉnh (VD: ".custom-scrollbar").
   * Nếu không truyền, mặc định lắng nghe window.
   */
  scrollContainerSelector?: string;
}

const ScrollToTopButton: FC<ScrollToTopButtonProps> = ({
  scrollThreshold = 1000,
  scrollContainerSelector = '.custom-scrollbar', // 🔹 default cho bạn
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  // ✅ Lấy reference đến container scroll
  useEffect(() => {
    const el = document.querySelector(scrollContainerSelector) as HTMLElement | null;
    setScrollEl(el);
  }, [scrollContainerSelector]);

  // ✅ Lắng nghe sự kiện cuộn của container (hoặc window nếu không có)
  useEffect(() => {
    if (!scrollEl) return;

    const handleScroll = () => {
      const scrollTop = scrollEl.scrollTop;
      setIsVisible(scrollTop > scrollThreshold);
    };

    scrollEl.addEventListener('scroll', handleScroll);
    return () => {
      scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, [scrollEl, scrollThreshold]);

  // ✅ Cuộn container về đầu
  const scrollToTop = () => {
    if (scrollEl) {
      scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Zoom in={isVisible}>
      <Fab
        color="primary"
        aria-label="scroll back to top"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: theme.spacing(4),
          right: theme.spacing(4),
          zIndex: 1500,
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};

export default ScrollToTopButton;
