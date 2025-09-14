import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BatchFlashcardModal from '../../components/modals/BatchFlashcardModal';
import PaginationContainer from '../../components/common/PaginationContainer';
import CreateFlashcardItemModal, { FlashcardData } from '../../components/modals/CreateFlashcardItemModal';
import CreateFlashcardModal from '../../components/modals/CreateFlashcardModal';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';

interface FlashcardItem {
    id: string;
    word: string;
    definition: string;
}
const mockFlashcards: FlashcardItem[] = [
    { id: '1', word: 'History', definition: 'Lịch sử' },
    { id: '2', word: 'Example', definition: 'Ví dụ' },
    { id: '3', word: 'Book', definition: 'Sách' },
    { id: '4', word: 'Teacher', definition: 'Giáo viên' },
    { id: '5', word: 'Student', definition: 'Học sinh' },
    { id: '6', word: 'School', definition: 'Trường học' },
    { id: '7', word: 'Lesson', definition: 'Bài học' },
    { id: '8', word: 'Exam', definition: 'Kỳ thi' },
    { id: '9', word: 'Knowledge', definition: 'Kiến thức' },
    { id: '10', word: 'Classroom', definition: 'Lớp học' },
];


const FlashcardDetail: React.FC = () => {
    const [flashcards, setFlashcards] = useState<FlashcardItem[]>(mockFlashcards);

    // Modal states
    const [openBatchModal, setOpenBatchModal] = useState(false);
    const [openItemModal, setOpenItemModal] = useState(false);
    const [editWord, setEditWord] = useState<FlashcardItem | null>(null);

    const handleDelete = (id: string) => {
        setFlashcards(flashcards.filter((f) => f.id !== id));
    };

    // Mở modal tạo mới / chỉnh sửa
    const handleOpenItemModal = (item?: FlashcardItem) => {
        setEditWord(item || null);
        setOpenItemModal(true);
    };

    // Lưu từ mới hoặc chỉnh sửa
    const handleSaveItem = (data: FlashcardData) => {
        if (editWord) {
            // chỉnh sửa
            setFlashcards(flashcards.map(f =>
                f.id === editWord.id ? { ...f, word: data.word, definition: data.definition } : f
            ));
        } else {
            // thêm mới
            setFlashcards([...flashcards, { id: Date.now().toString(), word: data.word, definition: data.definition }]);
        }
        setOpenItemModal(false);
    };

    const handleSaveBatch = (data: { word: string; definition: string }[]) => {
        const newFlashcards = data.map(d => ({ id: Date.now().toString() + Math.random(), ...d }));
        setFlashcards([...flashcards, ...newFlashcards]);
        setOpenBatchModal(false);
    };
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const navigate = useNavigate();

    return (
        <MainLayout>
            <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 900, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Flashcards: Chủ đề business
                    </Typography>
                    <Button variant="contained" size="small" onClick={() => setOpenCreateModal(true)}>
                        Chỉnh sửa
                    </Button>
                    <Button variant="contained" size="small" onClick={() => handleOpenItemModal()}>
                        Thêm từ mới
                    </Button>
                    <Button variant="contained" size="small" onClick={() => setOpenBatchModal(true)}>
                        Tạo hàng loạt
                    </Button>
                </Box>

                {/* Info box */}
                <Paper sx={{ p: 2, bgcolor: '#DFFBF0', mb: 2 }}>
                    <Typography variant="body2">
                        Chú ý: nếu list từ vựng là tiếng Trung, Nhật, Hàn, click chỉnh sửa để thay đổi ngôn ngữ.
                        Audio mặc định là tiếng Anh-Anh và Anh-Mỹ. Các ngôn ngữ khác chỉ hỗ trợ trên máy tính.
                    </Typography>
                </Paper>

                {/* Luyện tập button */}
                <Button variant="contained" fullWidth sx={{ mb: 1 }} onClick={() => navigate("practice")}>
                    Luyện tập flashcards
                </Button>

                <Typography variant="body2" sx={{ mb: 2, cursor: 'pointer', color: 'primary.main' }}>
                    Xem ngẫu nhiên
                </Typography>

                {/* Flashcard list + pagination */}
                <PaginationContainer
                    items={flashcards}
                    itemsPerPage={5}
                    renderItem={(f: FlashcardItem) => (
                        <Paper
                            key={f.id}
                            sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                        >
                            <Box>
                                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {f.word} <VolumeUpIcon fontSize="small" sx={{ cursor: 'pointer' }} />
                                    <IconButton size="small" onClick={() => handleOpenItemModal(f)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Typography>
                                <Typography variant="body2">Định nghĩa: {f.definition}</Typography>
                            </Box>
                            <IconButton onClick={() => handleDelete(f.id)}>
                                <DeleteIcon color="error" />
                            </IconButton>
                        </Paper>
                    )}
                />

                {/* Modals */}
                <CreateFlashcardModal
                    titleModal='Chỉnh sửa List từ'
                    open={openCreateModal}
                    onClose={() => setOpenCreateModal(false)}
                    onSave={() => { console.log("Edited") }}
                />

                <CreateFlashcardItemModal
                    open={openItemModal}
                    listName="Flashcard List Chủ đề business"
                    onClose={() => setOpenItemModal(false)}
                    onSave={handleSaveItem}
                />

                <BatchFlashcardModal
                    open={openBatchModal}
                    onClose={() => setOpenBatchModal(false)}
                    onSave={handleSaveBatch}
                />
            </Box>
        </MainLayout>
    );
};

export default FlashcardDetail;
