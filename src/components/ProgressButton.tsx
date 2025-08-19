import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import StarIcon from '@mui/icons-material/Star';
import { Box, Typography } from '@mui/material';

interface ProgressButtonProps {
  progress: number; // Giá trị tiến trình từ 0 đến 100
  size?: number; // Kích thước của toàn bộ component
}

const ProgressButton: React.FC<ProgressButtonProps> = ({
  progress,
  size = 100,
}) => {
  const thickness = 6;
  const fabSize = size - thickness * 4; // Điều chỉnh kích thước nút bên trong

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Speech Bubble "START" */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: 'common.white',
          padding: '8px 16px',
          borderRadius: '8px',
          boxShadow: 1,
          mb: 1.5, // Margin bottom to create space
          border: '2px solid #e5e5e5',
          '&::before': {
            // Border cho cái đuôi
            content: '""',
            position: 'absolute',
            bottom: '-13px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '12px 12px 0',
            borderStyle: 'solid',
            borderColor: '#e5e5e5 transparent transparent transparent',
            zIndex: -1,
          },
        }}
      >
        <Typography variant='h6' sx={{ color: '#4caf50', fontWeight: 'bold' }}>
          Started
        </Typography>
      </Box>

      {/* Vòng tròn tiến trình */}
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Vòng tròn nền (màu xám) */}
        <CircularProgress
          variant='determinate'
          value={100}
          size={size}
          thickness={thickness}
          sx={{
            color: '#e0e0e0',
            position: 'absolute',
            left: 0,
          }}
        />
        {/* Vòng tròn tiến trình (màu vàng) */}
        <CircularProgress
          variant='determinate'
          value={progress}
          size={size}
          thickness={thickness}
          sx={{ color: '#ffc107' }}
        />

        {/* Nút bấm ở giữa */}
        <Box
          sx={{
            top: -5,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Fab
            aria-label='start'
            sx={{
              backgroundColor: '#58cc02',
              width: fabSize,
              height: fabSize,
              boxShadow: '0 5px 0 #4aa403',
              '&:hover': {
                backgroundColor: '#61e302',
              },
            }}
          >
            <StarIcon sx={{ color: 'white', fontSize: fabSize * 0.6 }} />
          </Fab>
        </Box>
      </Box>
    </Box>
  );
};

export default ProgressButton;
