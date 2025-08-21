import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Box,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Chương trình học', href: '/programs' },
  { label: 'Đề thi online', href: '/exams' },
  { label: 'Flash Card', href: '/flashcards' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar
        position='fixed'
        elevation={1}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar className='flex justify-between'>
          {/* Logo + tên website */}
          <div className='flex items-center gap-2'>
            <SchoolIcon sx={{ color: theme.palette.primary.main }} />
            <Typography
              variant='h6'
              component='div'
              sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
            >
              TOEIC Master
            </Typography>
          </div>

          {/* Nav links (Desktop) */}
          <div className='hidden md:flex items-center gap-6'>
            {navLinks.map((item) => (
              <Button
                key={item.label}
                href={item.href}
                sx={{
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant='contained'
              color='primary'
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: '20px',
                px: 3,
              }}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
          </div>

          {/* Mobile menu icon */}
          <div className='md:hidden'>
            <IconButton onClick={handleDrawerToggle}>
              <MenuIcon sx={{ color: theme.palette.text.primary }} />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* Drawer (Mobile) */}
      <Drawer
        anchor='right'
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          className='flex flex-col gap-4 p-6 w-64'
          role='presentation'
          onClick={handleDrawerToggle}
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          {navLinks.map((item) => (
            <Button
              key={item.label}
              href={item.href}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: theme.palette.text.primary,
                textTransform: 'none',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {item.label}
            </Button>
          ))}
          <Button
            variant='contained'
            color='primary'
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '20px',
            }}
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
