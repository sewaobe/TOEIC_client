import { FC, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Link,
  Container,
  Divider,
} from '@mui/material';

const footerLinks = [
  { title: 'About', href: '#' },
  { title: 'Blog', href: '#' },
  { title: 'FAQ', href: '#' },
  { title: 'Contact', href: '#' },
];

const Footer: FC = () => {
  // 1. Tạo state để lưu trạng thái hệ thống (Mặc định cho màu xám/loading)
  const [systemStatus, setSystemStatus] = useState<'checking' | 'up' | 'down'>('checking');

  // 2. Tự động kiểm tra sức khỏe Backend khi load trang
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const res = await fetch('https://api.toeic-smart.io.vn/api/healthy', {
          method: 'GET',
        });

        if (res.ok) {
          setSystemStatus('up');
        } else {
          setSystemStatus('down');
        }
      } catch (error) {
        setSystemStatus('down');
      }
    };

    checkBackendHealth();
  }, []);

  // 3. Cấu hình màu sắc theo trạng thái
  const statusColor =
    systemStatus === 'up' ? '#22c55e' : // Xanh lá
      systemStatus === 'down' ? '#ef4444' : // Đỏ
        '#9ca3af'; // Xám (đang check)

  const statusText =
    systemStatus === 'up' ? 'All Systems Normal' :
      systemStatus === 'down' ? 'System Degraded' :
        'Checking Status...';

  return (
    <Box
      component='footer'
      sx={{
        bgcolor: 'background.paper',
        pt: { xs: 2, md: 4 },
        pb: { xs: 1, md: 2 },
      }}
    >
      <Container maxWidth='lg'>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' alignItems='center' spacing={{ xs: 3, md: 2 }}>
          <Typography variant='h6' fontWeight='bold' color='text.primary'>
            TOEIC Smart
          </Typography>

          <Stack direction='row' spacing={4} alignItems='center'>
            {footerLinks.map((link) => (
              <Link key={link.title} href={link.href} color='text.secondary' underline='none' sx={{ transition: 'color 0.2s', '&:hover': { color: 'primary.main' } }}>
                {link.title}
              </Link>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' alignItems='center' spacing={2}>
          <Typography variant='body2' color='text.secondary'>
            © {new Date().getFullYear()} TOEIC Smart. All rights reserved.
          </Typography>

          <Link
            href="https://status.toeic-smart.io.vn"
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.2, px: 1.5, py: 0.75, borderRadius: 2, bgcolor: 'action.hover',
              transition: 'background-color 0.2s', '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            {/* Chấm tròn đổi màu theo System Status */}
            <Box
              sx={{
                width: 8, height: 8, borderRadius: '50%',
                bgcolor: statusColor,
                boxShadow: `0 0 0 0 ${statusColor}b3`, // Thêm b3 ở cuối để tạo mã màu hex trong suốt (opacity 70%)
                animation: systemStatus === 'checking' ? 'none' : 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: `0 0 0 0 ${statusColor}b3` },
                  '70%': { boxShadow: `0 0 0 6px ${statusColor}00` }, // 00 là opacity 0%
                  '100%': { boxShadow: `0 0 0 0 ${statusColor}00` },
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              {statusText}
            </Typography>
          </Link>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;