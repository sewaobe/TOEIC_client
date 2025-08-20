import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import animationData from '../assets/roadmap.json';

const LottieAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // 1. Tạo state để làm "công tắc"
  const [isVisible, setIsVisible] = useState(false);

  // 2. useEffect này chịu trách nhiệm quan sát
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // entries[0] là element đang được quan sát (containerRef)
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          // Tối ưu hóa: Khi đã thấy rồi thì không cần quan sát nữa
          observer.unobserve(containerRef.current!);
        }
      },
      {
        rootMargin: '0px', // Có thể thêm margin để load sớm hơn một chút
        threshold: 0.1, // Kích hoạt khi 10% element hiện ra
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Dọn dẹp observer khi component unmount
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []); // Phụ thuộc rỗng để chỉ chạy 1 lần khi component mount

  // 3. useEffect này chịu trách nhiệm load Lottie, và nó chỉ chạy KHI isVisible = true
  useEffect(() => {
    // Chỉ thực thi khi element đã hiện ra VÀ ref đã tồn tại
    if (isVisible && containerRef.current) {
      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false, // Giữ nguyên yêu cầu chạy 1 lần
        autoplay: true,
        animationData,
      });

      return () => {
        anim.destroy();
      };
    }
  }, [isVisible]); // Phụ thuộc vào isVisible!

  return (
    <div
      ref={containerRef}
      className='inline-flex justify-center opacity-90 transition-transform duration-300 ease-in-out  '
      style={{ minHeight: '300px', minWidth: '300px' }} 
    />
  );
};

export default LottieAnimation;
