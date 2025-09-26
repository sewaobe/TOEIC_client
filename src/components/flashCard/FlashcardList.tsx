import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PaginationContainer from '../common/PaginationContainer';
import FlashcardCard from './FlashcardCard';
import { FlashcardList } from '../../views/pages/FlashCardPage';
import CreateFlashcardModal from '../modals/CreateFlashcardModal';

interface FlashcardsListProps {
    items: (FlashcardList | { id: string; isCreateCard?: boolean })[];
    itemsPerPage?: number;
}

const FlashcardsList: React.FC<FlashcardsListProps> = ({ items, itemsPerPage = 8 }) => {
    const [openCreateModal, setOpenCreateModal] = useState(false);

    const handleCreateCard = () => {
        setOpenCreateModal(true);
    };

    const handleSave = (data: { title: string; type: string; description: string }) => {
        console.log('New flashcard list', data);
        setOpenCreateModal(false);
        // TODO: update state items nếu muốn thêm vào danh sách
    };

    return (
        <>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>
                List từ đã tạo
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <PaginationContainer
                    items={items}
                    pageCount={10}
                    itemsPerPage={itemsPerPage}
                    page={1}
                    onPageChange={() => {}}
                    renderItem={(item) => (
                        <Box key={'id' in item ? item.id : 'create'} sx={{ flex: '1 1 calc(25% - 16px)', minWidth: 250 }}>
                            <FlashcardCard
                                item={item}
                                onCreateCard={handleCreateCard} // truyền callback
                            />
                        </Box>
                    )}
                />
            </Box>

            <CreateFlashcardModal
                titleModal='Tạo List từ mới'
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onSave={handleSave}
            />
        </>
    );
};

export default FlashcardsList;
