import { LessonType } from "../../types/Lesson";
import { Box, Card, Grid, Skeleton } from "@mui/material";

const FullWidthCardSkeleton = () => (
  <Card sx={{ borderRadius: '24px', p: 3, boxShadow: '0 8px 32px -12px rgba(0, 0, 0, 0.1)' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Skeleton variant="circular" width={60} height={60} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="rectangular" width="100%" height={50} sx={{ mt: 3, borderRadius: '12px' }} />
    </Box>
  </Card>
);

// --- Skeleton cho layout 2 cột (dùng cho Video/Transcript, Quiz/Sidebar...) ---
const TwoColumnLessonSkeleton = () => (
  <>
    <Grid size={{ xs: 12, md: 8 }}>
      <Skeleton variant="rectangular" width="100%" sx={{ height: { xs: 200, md: 350 }, borderRadius: '16px' }} />
      <Skeleton variant="text" sx={{ fontSize: '2rem', mt: 2 }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <Skeleton variant="rectangular" width="100%" sx={{ height: { xs: 150, md: '100%' }, borderRadius: '16px' }} />
    </Grid>
  </>
);

// --- Component Skeleton "Thông minh" ---
// Nó sẽ nhận `lessonType` để quyết định render bộ xương nào cho phù hợp
interface LessonContentSkeletonProps {
  lessonType: LessonType
}
export const LessonContentSkeleton: React.FC<LessonContentSkeletonProps> = ({ lessonType }) => {
  switch (lessonType) {
    case 'quiz':
    case 'lesson':
    case 'flash_card':
    case 'shadowing':
    case 'dictation':
    default:
      // Mặc định hiển thị layout 1 cột cho các loại còn lại và trường hợp chưa xác định
      return <FullWidthCardSkeleton />;
  }
};