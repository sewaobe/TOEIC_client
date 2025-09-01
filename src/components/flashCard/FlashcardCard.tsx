import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { FlashcardList } from '../../views/pages/FlashCardPage';
import { useNavigate } from 'react-router-dom';

interface FlashcardCardProps {
    item: FlashcardList | { id: string; isCreateCard?: boolean };
    onCreateCard?: () => void; // callback mở modal
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({ item, onCreateCard }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/flash-cards/${item.id}`); // route bạn muốn chuyển tới
    };
    if ('isCreateCard' in item && item.isCreateCard) {
        return (
            <Paper
                sx={{
                    p: 4,
                    border: `2px dashed ${theme.palette.primary.light}`,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 180,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { bgcolor: 'primary.lighter', boxShadow: 4 },
                }}
                onClick={onCreateCard} // gọi callback khi click
            >
                <AddCircleOutlineIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography sx={{ fontWeight: 600, fontSize: '1.125rem', color: 'primary.main' }}>
                    Tạo list từ
                </Typography>
            </Paper>
        );
    }

    const data = item as FlashcardList;
    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 2,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 180,
                transition: 'all 0.3s',
                '&:hover': { boxShadow: 6 },
            }}
            onClick={handleClick}
        >
            <Typography
                sx={{
                    mb: 1,
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'text.primary',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                }}
            >
                {data.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', fontSize: 14, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocalOfferIcon sx={{ fontSize: 16 }} /> <span>{data.wordsCount} từ</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <VisibilityIcon sx={{ fontSize: 16 }} /> <span>{data.views}</span>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: 'grey.300',
                        color: 'grey.700',
                        fontWeight: 600,
                        mr: 2,
                        fontSize: 12,
                    }}
                >
                    {data.owner}
                </Box>
                <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>{data.id}</Typography>
            </Box>
        </Paper>
    );
};

export default FlashcardCard;
