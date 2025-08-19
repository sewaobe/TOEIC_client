import { FC } from 'react';
import {
  Box,
  Typography,
  Stack,
  Link,
  Container,
  Divider, // Import Divider để tạo đường kẻ ngang
} from '@mui/material';

// Tách dữ liệu ra để dễ quản lý
const footerLinks = [
  { title: 'About', href: '#' },
  { title: 'Blog', href: '#' },
  { title: 'FAQ', href: '#' },
  { title: 'Contact', href: '#' },
];

const Footer: FC = () => {
  return (
    <Box
      component='footer'
      sx={{
        // 1. Dùng màu từ theme, không dùng className
        bgcolor: 'background.paper',
        py: { xs: 5, md: 6 }, // Padding responsive
      }}
    >
      <Container maxWidth='lg'>
        {/* 2. Bố cục responsive: row trên desktop, column trên mobile */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent='space-between'
          alignItems='center'
          spacing={{ xs: 3, md: 2 }} // Giảm spacing trên desktop
        >
          <Typography variant='h6' fontWeight='bold' color='text.primary'>
            TOEIC Master
          </Typography>

          <Stack direction='row' spacing={4} alignItems='center'>
            {footerLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                color='text.secondary' // Dùng màu phụ cho link để dịu mắt hơn
                underline='none'
                sx={{
                  // 4. Thêm hiệu ứng hover tinh tế
                  transition: 'color 0.2s ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {link.title}
              </Link>
            ))}
          </Stack>
        </Stack>

        {/* 3. Thêm Divider để phân cấp thị giác */}
        <Divider sx={{ my: 4 }} />

        <Typography variant='body2' color='text.secondary' textAlign='center'>
          © {new Date().getFullYear()} TOEIC Master. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
