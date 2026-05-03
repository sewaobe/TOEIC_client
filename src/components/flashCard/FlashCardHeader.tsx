import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
export type FlashcardPageTab = 'myList' | 'learning' | 'explore' | 'suggestion';

interface FlashcardsHeaderProps {
    activeTab: FlashcardPageTab;
    onChangeTab: (tab: FlashcardPageTab) => void;
}

const FlashcardsHeader: React.FC<FlashcardsHeaderProps> = ({ activeTab, onChangeTab }) => {
    const theme = useTheme();

    const btnStyle = (tab: FlashcardPageTab) => ({
        fontWeight: 600,
        borderRadius: 2,
        textTransform: 'none',
        ...(activeTab === tab
            ? { variant: 'contained', bgcolor: theme.palette.primary.main, color: '#fff' }
            : { variant: 'text', color: 'text.secondary', '&:hover': { bgcolor: 'primary.lighter' } }),
    });

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 100%)',
                p: { xs: 4, md: 6 },
                borderRadius: '16px 16px 0 0',
                mb: 0,
                boxShadow: 3,
            }}
        >
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                <LayersOutlinedIcon sx={{ mr: 1 }} /> Flashcards
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={() => onChangeTab('myList')} sx={btnStyle('myList')}>
                    List từ của tôi
                </Button>
                <Button onClick={() => onChangeTab('learning')} sx={btnStyle('learning')}>
                    Đang học
                </Button>
                <Button onClick={() => onChangeTab('explore')} sx={btnStyle('explore')}>
                    Khám phá
                </Button>
                <Button onClick={() => onChangeTab('suggestion')} sx={btnStyle('suggestion')}>
                    Gợi ý
                </Button>
            </Box>
        </Box>
    );
};


export default FlashcardsHeader;
