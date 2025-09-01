import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Alert, useTheme } from '@mui/material';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MainLayout from '../layouts/MainLayout';
import PaginationContainer from '../../components/PaginationContainer';
import AlertBox from '../../components/flashCardItem/AlertBox';
import FlashcardsHeader from '../../components/flashcard/FlashCardHeader';
import FlashcardsLearningSection from '../../components/flashcard/FlashcardLearningSection';
import FlashcardsList from '../../components/flashcard/FlashcardList';

// src/mock/flashcardMock.ts
export interface FlashcardList {
    id: string;
    title: string;
    wordsCount: number;
    views: number;
    owner: string;
}

// Mock data
export const mockLists: FlashcardList[] = [
    { id: '1', title: 'Danh sách từ vựng TOEIC cơ bản', wordsCount: 20, views: 120, owner: 'A' },
    { id: '2', title: 'Danh sách từ vựng chủ đề Travel', wordsCount: 15, views: 85, owner: 'A' },
    { id: '3', title: 'Danh sách từ vựng chủ đề Business', wordsCount: 25, views: 200, owner: 'A' },
    { id: '4', title: 'Danh sách từ vựng chủ đề Food & Drinks', wordsCount: 18, views: 60, owner: 'D' },
    { id: '5', title: 'Danh sách từ vựng chủ đề Health', wordsCount: 22, views: 140, owner: 'A' },
    { id: '6', title: 'Danh sách từ vựng chủ đề Technology', wordsCount: 30, views: 180, owner: 'A' },
    { id: '7', title: 'Danh sách từ vựng chủ đề Education', wordsCount: 12, views: 70, owner: 'A' },
    { id: '8', title: 'Danh sách từ vựng chủ đề Environment', wordsCount: 16, views: 95, owner: 'A' },
    { id: '9', title: 'Danh sách từ vựng chủ đề Sports', wordsCount: 20, views: 110, owner: 'A' },
    { id: '10', title: 'Danh sách từ vựng nâng cao TOEIC', wordsCount: 28, views: 160, owner: 'A' },
];

const FlashcardsPage: React.FC = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<'myList' | 'learning' | 'explore'>('myList');

    // Kết hợp tạo list từ và flashcard list
    const flashcardItems: (FlashcardList | { id: string; isCreateCard?: boolean })[] = [
        { id: 'create', isCreateCard: true },
        ...mockLists,
    ];

    return (
        <MainLayout>
            <Box sx={{ p: { xs: 3, md: 6 }, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
                <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
                    {/* Header */}
                    <FlashcardsHeader activeTab={activeTab} onChangeTab={setActiveTab} />

                    {/* Content */}
                    <Box
                        sx={{
                            bgcolor: 'background.paper',
                            p: { xs: 3, md: 6 },
                            borderRadius: '0 0 16px 16px',
                            mt: 0,
                            boxShadow: 3,
                        }}
                    >
                        <AlertBox
                            severity="info"
                            message={
                                <>
                                    Bạn có thể tạo flashcards từ highlights trong trang chi tiết kết quả bài thi.{' '}
                                    <a
                                        href="#"
                                        style={{ textDecoration: 'underline', fontWeight: 600, color: theme.palette.primary.main }}
                                    >
                                        Xem hướng dẫn
                                    </a>
                                </>
                            }
                        />

                        {/* Nội dung thay đổi theo activeTab */}
                        {activeTab === 'myList' && <FlashcardsList items={flashcardItems} itemsPerPage={8} />}
                        {activeTab === 'learning' && <FlashcardsLearningSection />}
                        {activeTab === 'explore' && (
                            <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                                Khám phá flashcards mới tại đây...
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </MainLayout>
    );
};


export default FlashcardsPage;
