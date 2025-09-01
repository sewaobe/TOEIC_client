import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const FlashcardsLearningSection: React.FC = () => {
    const theme = useTheme();

    return (
        <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Đang học
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Bạn chưa học list từ nào.{' '}
                <a
                    href="#"
                    style={{ textDecoration: 'underline', fontWeight: 600, color: theme.palette.primary.main }}
                >
                    Khám phá ngay
                </a>{' '}
                hoặc bắt đầu tạo các list từ mới.
            </Typography>
        </Box>
    );
};

export default FlashcardsLearningSection;
