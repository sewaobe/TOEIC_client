import React, { useEffect, useState } from 'react';
import { Box, Paper, Skeleton, Typography } from '@mui/material';
import PaginationContainer from '../common/PaginationContainer';
import FlashcardCard from './FlashcardCard';
import { FlashcardList } from '../../views/pages/FlashCardPage';
import CreateFlashcardModal from '../modals/CreateFlashcardModal';
import { toast } from 'sonner';
import { topicService } from '../../services/topic.service';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface FlashcardsListProps {

}

const FlashcardsList: React.FC<FlashcardsListProps> = ({ }) => {
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [flashcardItems, setFlashcardItems] = useState<FlashcardList[]>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const itemsPerPage = 7;
    const [isLoading, setIsLoading] = useState(false);

    const fetchFlashcardItems = async () => {
        try {
            setIsLoading(true);
            const res = await topicService.getAllTopicVocabulary(page, itemsPerPage);
            setFlashcardItems(res.items);
            setPageCount(res.pageCount);
        } catch (err) {
            toast.error('Lấy danh sách list từ thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchFlashcardItems();
    }, [page]);

    const handleCreateCard = () => {
        setOpenCreateModal(true);
    };

    const handleSave = async (data: { title: string; tags: string[]; description: string }) => {
        try {
            toast.promise(await topicService.createTopicVocabulary(data), {
                loading: 'Đang tạo list từ...',
                success: 'Tạo list từ thành công!',
                error: 'Tạo list từ thất bại. Vui lòng thử lại.',
            })
            await fetchFlashcardItems();
        }
        catch (err) {
            toast.error('Tạo list từ thất bại. Vui lòng thử lại.');
            return;
        }
        finally {
            setOpenCreateModal(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            toast.promise(await topicService.deleteTopicVocabulary(id), {
                loading: 'Đang xóa list từ...',
                success: 'Xóa list từ thành công!',
                error: 'Xóa list từ thất bại. Vui lòng thử lại.',
            })
            await fetchFlashcardItems();
        }
        catch (err) {
            toast.error('Xóa list từ thất bại. Vui lòng thử lại.');
            return;
        }
    };

    const displayedItems =
        page === 1
            ? [{ _id: 'create-card', isCreateCard: true } as any, ...flashcardItems]
            : flashcardItems;


    return (
        <>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>
                List từ đã tạo
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, width: "100%" }}>
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <Paper
                            key={index}
                            sx={{
                                flex: '1 1 calc(25% - 16px)',
                                minWidth: 250,
                                p: 3,
                                borderRadius: 3,
                                boxShadow: 2,
                            }}
                        >
                            <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
                            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Skeleton variant="rounded" width={60} height={24} />
                                <Skeleton variant="rounded" width={60} height={24} />
                            </Box>
                        </Paper>
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div className="w-full">
                            <PaginationContainer
                                items={displayedItems}
                                pageCount={pageCount}
                                page={page}
                                onPageChange={setPage}
                                containerSx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                                    gap: 2,
                                }}
                                renderItem={(item) => (
                                    <motion.div
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.25, ease: 'easeOut' }}
                                        style={{
                                            flex: '1 1 calc(25% - 16px)',
                                            minWidth: 250,
                                        }}
                                    >
                                        <FlashcardCard
                                            item={item}
                                            onCreateCard={handleCreateCard}
                                            onDelete={handleDelete}
                                        />
                                    </motion.div>
                                )}
                            />
                        </div>
                    </AnimatePresence>
                )}
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
