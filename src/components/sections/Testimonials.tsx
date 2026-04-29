import { FC, useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Avatar,
  Stack,
  IconButton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import SwiperCore from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y, Autoplay } from 'swiper/modules';
import './testimonials-swiper.css';

import { motion, useInView } from 'framer-motion';

const getAvatarLabel = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

// Dữ liệu mẫu
const testimonialsData = [
  {
    quote:
      'Nhờ có lộ trình cá nhân hóa, mình đã tăng được 150 điểm chỉ sau 1 tháng. Giao diện thi thử y hệt thi thật giúp mình không còn bị áp lực tâm lý nữa.',
    name: 'Nguyễn Thu Trang',
    title: 'Sinh viên FTU',
  },
  {
    quote:
      'Kho đề thi và tài liệu cực kỳ chất lượng và luôn được cập nhật. Phần giải thích chi tiết sau mỗi câu hỏi thực sự là cứu cánh cho mình.',
    name: 'Trần Minh Quang',
    title: 'Nhân viên IT',
  },
  {
    quote:
      'Mình đã thử nhiều nền tảng khác nhưng chỉ ở đây mình mới cảm thấy thực sự tiến bộ. Cộng đồng học tập rất sôi nổi và hữu ích.',
    name: 'Lê Hoàng Yến',
    title: 'Sinh viên NEU',
  },
  {
    quote:
      'Tính năng flashcard và luyện nghe thực sự tuyệt vời. Giao diện thân thiện và dễ sử dụng trên cả điện thoại.',
    name: 'Phạm Anh Khoa',
    title: 'Marketing Manager',
  },
  {
    quote:
      'Nhờ có lộ trình cá nhân hóa, mình đã tăng được 150 điểm chỉ sau 1 tháng. Giao diện thi thử y hệt thi thật giúp mình không còn bị áp lực tâm lý nữa.',
    name: 'Nguyễn Quynh Nhu',
    title: 'Sinh viên FPT',
  },
  {
    quote:
      'Kho đề thi và tài liệu cực kỳ chất lượng và luôn được cập nhật. Phần giải thích chi tiết sau mỗi câu hỏi thực sự là cứu cánh cho mình.',
    name: 'Trần Minh Quoc',
    title: 'Nhân viên IT',
  },
  {
    quote:
      'Mình đã thử nhiều nền tảng khác nhưng chỉ ở đây mình mới cảm thấy thực sự tiến bộ. Cộng đồng học tập rất sôi nổi và hữu ích.',
    name: 'Lê Hoàng Thanh',
    title: 'Sinh viên NEU',
  },
  {
    quote:
      'Tính năng flashcard và luyện nghe thực sự tuyệt vời. Giao diện thân thiện và dễ sử dụng trên cả điện thoại.',
    name: 'Phạm Anh Khoi',
    title: 'Marketing Manager',
  },
];

const Testimonials: FC = () => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperCore | null>(null);

  // ref để detect khi block vào viewport
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.2 });

  //Chặn auto play khi chưa inView
  useEffect(() => {
    if (!swiperInstance) return;
    if (inView) {
      swiperInstance.autoplay?.start();
    } else {
      swiperInstance.autoplay?.stop();
    }
  }, [inView, swiperInstance]);
  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        contain: 'content' // <-- Thêm dòng này để cách ly Layout Thrashing
      }}
    >
      <Box sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 } }}>
        <Container maxWidth='lg'>
          <Typography
            variant='h3'
            component='h2'
            fontWeight='bold'
            textAlign='center'
            sx={{ mb: 8 }}
            className='text-title'
          >
            Hàng Ngàn Học Viên Đã Thành Công
          </Typography>

          <Box sx={{ position: 'relative', px: { xs: 0, md: 5 } }}>
            {/* Prev button */}
            <IconButton
              onClick={() => swiperInstance?.slidePrev()}
              sx={{
                position: 'absolute',
                top: '45%',
                left: 0,
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: 'background.paper',
                boxShadow: 3,
                '&:hover': { bgcolor: 'background.default' },
                display: { xs: 'none', md: 'flex' },
              }}
              aria-label='previous slide'
            >
              <ArrowBackIosNewIcon />
            </IconButton>

            {/* Swiper */}
            {inView ? (
              <Swiper
                modules={[Pagination, A11y, Autoplay]}
                onSwiper={setSwiperInstance}
                spaceBetween={16}
                slidesPerView={1}
                centeredSlides
                loop={testimonialsData.length >= 4}
                autoplay={{
                  delay: 1200,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                pagination={{ clickable: true }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 3, spaceBetween: 30 },
                }}
                style={{ paddingBottom: '50px', minHeight: 300 }}
              >
                {testimonialsData.map((testimonial) => (
                  <SwiperSlide key={testimonial.name} style={{ minHeight: '250px' }}>
                    {({ isActive }) => (
                      <Card
                        sx={{
                          height: '100%',
                          borderRadius: '16px',
                          display: 'flex',
                          transform: isActive ? 'scale(1.0)' : 'scale(0.9)',
                          transition: 'transform 0.4s ease',
                        }}
                      >
                        <CardContent
                          sx={{ p: 4, display: 'flex', flexDirection: 'column' }}
                        >
                          <Stack spacing={3} sx={{ flexGrow: 1 }}>
                            <Typography
                              variant='body1'
                              fontStyle='italic'
                              color='text.secondary'
                              sx={{ flexGrow: 1 }}
                            >
                              "{testimonial.quote}"
                            </Typography>
                            <Stack
                              direction='row'
                              spacing={2}
                              alignItems='center'
                            >
                              <Avatar
                                alt={testimonial.name}
                                sx={{
                                  bgcolor: 'primary.main',
                                  fontWeight: 700,
                                }}
                              >
                                {getAvatarLabel(testimonial.name)}
                              </Avatar>
                              <Box>
                                <Typography fontWeight='600'>
                                  {testimonial.name}
                                </Typography>
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  {testimonial.title}
                                </Typography>
                              </Box>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div style={{ minHeight: 300 }} />
            )}

            {/* Next button */}
            <IconButton
              onClick={() => swiperInstance?.slideNext()}
              sx={{
                position: 'absolute',
                top: '45%',
                right: 0,
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: 'background.paper',
                boxShadow: 3,
                '&:hover': { bgcolor: 'background.default' },
                display: { xs: 'none', md: 'flex' },
              }}
              aria-label='next slide'
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </motion.div>
  );
};

export default Testimonials;
