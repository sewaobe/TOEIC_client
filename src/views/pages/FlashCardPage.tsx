import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import MainLayout from '../layouts/MainLayout';
import AlertBox from '../../components/flashCardItem/AlertBox';
import FlashcardsList from '../../components/flashCard/FlashcardList';
import FlashcardsLearningSection from '../../components/flashCard/FlashcardLearningSection';
import FlashcardsHeader from '../../components/flashCard/FlashCardHeader';

// src/mock/flashcardMock.ts
export interface FlashcardList {
    _id: string;
    title: string;
    description: string;
    vocabularies_id: string[];
    tags: string[];
    created_at: string;
}

const FlashcardsPage: React.FC = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<'myList' | 'learning' | 'explore'>('myList');

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
                        {activeTab === 'myList' && <FlashcardsList />}
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
