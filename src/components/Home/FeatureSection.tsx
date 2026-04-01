import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, useTheme, CircularProgress } from '@mui/material';
import {
  SettingsSuggest,
  EmojiObjects,
  StarBorderPurple500Outlined,
  CheckCircleOutline,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores/store';
import learningPathService from '../../services/learningPath.service';
import OnboardingModal from '../modals/OnBoardingModal';

// Định nghĩa kiểu cho props của FeatureItem
interface FeatureItemProps {
  icon: React.ReactElement;
  text: string;
}

// Định nghĩa component con ngay bên trong file này
const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => {
  const theme = useTheme();
  return (
    <div className='flex items-center space-x-2'>
      {React.cloneElement(icon, {
        sx: { color: theme.palette.primary.main, fontSize: 32 },
      })}
      <Typography
        variant='body2'
        sx={{ color: theme.palette.text.primary }}
        className='text-base'
      >
        {text}
      </Typography>
    </div>
  );
};

const FeatureSection: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  const [hasLearningPath, setHasLearningPath] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openOnboarding, setOpenOnboarding] = useState(false);

  useEffect(() => {
    const checkLearningPath = async () => {
      if (!isAuthenticated) {
        setHasLearningPath(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await learningPathService.getUserLearningPath();
        // Kiểm tra nếu có data và data không null
        setHasLearningPath(response.success && response.data !== null);
      } catch (error) {
        console.error('Error checking learning path:', error);
        setHasLearningPath(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkLearningPath();
  }, [isAuthenticated]);

  const ComingSoonRibbon = () => {
    const theme = useTheme();
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '180px',
          height: '150px',
          overflow: 'hidden',
          pointerEvents: 'none', // Không chặn click vào các phần tử bên dưới
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.secondary.main, // Hoặc màu cam/đỏ tùy bạn
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '12px',
            py: '4px',
            width: '200px',
            transform: 'rotate(45deg) translate(45px, -15px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Coming Soon
        </Box>
      </Box>
    );
  };

  const isProd = import.meta.env.PROD;

  return (
    <Box
      className='flex flex-col gap-4 items-center justify-center text-center 
      p-8 md:p-16 rounded-3xl max-w-6xl m-auto mt-3 mb-3 overflow-hidden'
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.background.paper,
        boxShadow:
          'rgba(0, 0, 0, 0.12) 0px 2px 4px 0px, rgba(0, 0, 0, 0.12) 0px -2px 4px 0px', // Thêm giá trị bóng đổ âm cho phía trên
      }}
    >
      {isProd && <ComingSoonRibbon />}

      {isLoading ? (
        // Loading state
        <Box className="flex flex-col items-center justify-center py-8">
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
            Đang kiểm tra lộ trình học...
          </Typography>
        </Box>
      ) : hasLearningPath ? (
        // User đã có learning path
        <>
          {/* Badge "Đã có lộ trình" */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1,
              borderRadius: '20px',
              backgroundColor: theme.palette.success.main,
              color: '#fff',
              mb: 2,
            }}
          >
            <CheckCircleOutline fontSize="small" />
            <Typography variant="body2" fontWeight="600">
              Bạn đã có lộ trình học
            </Typography>
          </Box>

          {/* Tiêu đề */}
          <div>
            <Typography
              variant='h3'
              sx={{
                color: theme.palette.text.primary,
                fontSize: { xs: '2rem', md: '34px' },
              }}
              className='font-bold mb-2'
            >
              <span style={{ color: theme.palette.primary.main }}>
                Tiếp tục hành trình{' '}
              </span>
              <span style={{ color: theme.palette.secondary.main }}>
                chinh phục TOEIC
              </span>
            </Typography>
          </div>

          {/* Mô tả */}
          <div>
            <Typography
              variant='body1'
              className='text-base md:text-base mb-6 max-w-5xl'
              sx={{ color: theme.palette.text.secondary }}
            >
              Lộ trình học tập cá nhân hóa của bạn đã sẵn sàng! Tiếp tục theo dõi
              tiến độ, hoàn thành các bài học và đạt được mục tiêu điểm số TOEIC của bạn.
            </Typography>
          </div>

          {/* Danh sách các tính năng - đã có lộ trình */}
          <div className='flex flex-wrap justify-center gap-6 mb-8'>
            <FeatureItem icon={<TrendingUp />} text='Theo dõi tiến độ' />
            <FeatureItem icon={<CheckCircleOutline />} text='Lộ trình cá nhân' />
            <FeatureItem
              icon={<StarBorderPurple500Outlined />}
              text='Mục tiêu rõ ràng'
            />
          </div>

          {/* Nút - đã có lộ trình */}
          <div className="flex gap-3">
            <Button
              variant='contained'
              size='large'
              className='rounded-full px-8 py-3 normal-case font-bold'
              onClick={() => navigate('/programs')}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: '#fff',
                '&:hover': {
                  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                },
              }}
            >
              Xem lộ trình học
            </Button>
            <Button
              variant='outlined'
              size='large'
              className='rounded-full px-8 py-3 normal-case font-bold'
              onClick={() => navigate(`/tests`)}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              Làm bài test
            </Button>
          </div>
        </>
      ) : (
        // User chưa có learning path
        <>
          {/* Tiêu đề */}
          <div>
            <Typography
              variant='h3'
              sx={{
                color: theme.palette.text.primary,
                fontSize: { xs: '2rem', md: '34px' },
              }}
              className='font-bold mb-2'
            >
              <span style={{ color: theme.palette.primary.main }}>
                Mở khóa lộ trình học tập{' '}
              </span>
              <span style={{ color: theme.palette.secondary.main }}>
                cá nhân hóa của bạn
              </span>
            </Typography>
          </div>

          {/* Mô tả */}
          <div>
            <Typography
              variant='body1'
              className='text-base md:text-base mb-6 max-w-5xl'
              sx={{ color: theme.palette.text.secondary }}
            >
              Tập trung vào điểm mạnh của bạn, cải thiện các điểm yếu với các bài
              học được thiết kế riêng, và duy trì lộ trình với một kế hoạch học tập
              tùy chỉnh dành riêng cho bạn, đảm bảo tiến bộ nhanh hơn và điểm số cao
              hơn!
            </Typography>
          </div>

          {/* Danh sách các tính năng */}
          <div className='flex flex-wrap justify-center gap-6 mb-8'>
            <FeatureItem icon={<SettingsSuggest />} text='Ứng dụng công nghệ AI' />
            <FeatureItem icon={<EmojiObjects />} text='Học theo mục tiêu' />
            <FeatureItem
              icon={<StarBorderPurple500Outlined />}
              text='Hiệu suất tốt nhất'
            />
          </div>

          {/* Nút */}
          <div>
            <Button
              disabled={isProd}
              variant='contained'
              size='large'
              className='rounded-full px-8 py-3 normal-case font-bold'
              onClick={() => !isProd && setOpenOnboarding(true)}
              sx={{
                color: '#fff',
                '&:hover': {
                  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                },
                opacity: isProd ? 0.7 : 1, // Làm mờ nhẹ nút nếu chưa sẵn sàng
                cursor: isProd ? "not-allowed" : "pointer",
                backgroundColor: isProd ? theme.palette.action.disabledBackground : theme.palette.primary.main,
              }}
            >
              {isProd ? "Sắp ra mắt" : "Bắt đầu ngay!"}
            </Button>
          </div>
        </>
      )}
      {/* Onboarding modal shown for new users; navigates when closed */}
      <OnboardingModal
        open={openOnboarding}
        onClose={() => setOpenOnboarding(false)}
        onNavigate={() => navigate(`/overview-test?testId=68af851b1918226d4c424e7f&demo_test=true`)}
      />
    </Box>
  );
};

export default FeatureSection;
