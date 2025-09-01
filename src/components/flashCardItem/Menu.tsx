import { Button, Menu as MuiMenu, MenuItem } from '@mui/material';
import { useState } from 'react';
import {
  ArrowBack,
  Settings,
  VisibilityOff,
  EventBusy,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Menu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className='flex justify-between items-center mb-6'>
      <div className='flex gap-2 items-center flex-nowrap '>
        <Button
          startIcon={<ArrowBack sx={{ color: 'primary.main' }} />}
          variant='text'
          sx={{
            color: 'grey.700', // chữ màu xám
            whiteSpace: 'nowrap',
            fontSize: '0.75rem',
          }}
          onClick={() => navigate(location.pathname.substring(0, location.pathname.lastIndexOf("/")))}
        >
          Xem tất cả
        </Button>
        <Button
          startIcon={<Settings sx={{ color: 'primary.main' }} />}
          variant='text'
          sx={{
            color: 'grey.700', // chữ màu xám
            whiteSpace: 'nowrap',
            fontSize: '0.75rem',
          }}
          onClick={handleClick}
        >
          Cài đặt chế độ review
        </Button>

        <MuiMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          disableScrollLock
        >
          <MenuItem onClick={handleClose}>Tùy chọn 1</MenuItem>
          <MenuItem onClick={handleClose}>Tùy chọn 2</MenuItem>
          <MenuItem onClick={handleClose}>Tùy chọn 3</MenuItem>
        </MuiMenu>
        <Button
          startIcon={<VisibilityOff sx={{ color: 'primary.main' }} />}
          variant='text'
          sx={{
            color: 'grey.700', // chữ màu xám
            whiteSpace: 'nowrap',
            fontSize: '0.75rem',
          }}
        >
          Các từ đã bỏ qua
        </Button>
      </div>
      <div>
        <Button
          startIcon={<EventBusy />}
          variant='text'
          sx={{
            color: 'red',
            whiteSpace: 'nowrap',
            fontSize: '0.75rem', // ~12px
          }}
        >
          Dừng học list từ này
        </Button>
      </div>
    </div>
  );
}
