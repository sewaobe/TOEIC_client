import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Divider, Collapse } from '@mui/material';
import BaseModal from './BaseModal';

interface CreateFlashcardItemModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: FlashcardData) => void;
    listName: string;
}

export interface FlashcardData {
    word: string;
    definition: string;
    image?: File | null;
    type?: string;
    pronunciation?: string;
    examples?: string;
    notes?: string;
}

const CreateFlashcardItemModal: React.FC<CreateFlashcardItemModalProps> = ({ open, onClose, onSave, listName }) => {
    const [word, setWord] = useState('');
    const [definition, setDefinition] = useState('');
    const [showExtra, setShowExtra] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [type, setType] = useState('');
    const [pronunciation, setPronunciation] = useState('');
    const [examples, setExamples] = useState('');
    const [notes, setNotes] = useState('');

    const handleSave = () => {
        onSave({ word, definition, image, type, pronunciation, examples, notes });
        // reset form
        setWord('');
        setDefinition('');
        setShowExtra(false);
        setImage(null);
        setType('');
        setPronunciation('');
        setExamples('');
        setNotes('');
    };

    return (
        <BaseModal
            open={open}
            type="info"
            title="Tạo flashcard"
            onCancel={onClose}
            onConfirm={handleSave}
            confirmText="Lưu"
        >
            <Typography variant="body2" sx={{ mb: 1 }}>
                List từ: {listName}
            </Typography>

            <TextField
                fullWidth
                label="Từ mới"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                multiline
                minRows={2}
                label="Định nghĩa"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Button
                variant="text"
                onClick={() => setShowExtra(!showExtra)}
                sx={{ mb: 1, textTransform: 'none' }}
            >
                Thêm phiên âm, ví dụ, ảnh, ghi chú {showExtra ? '▲' : '▼'}
            </Button>

            <Collapse in={showExtra}>
                <Box sx={{ mt: 1 }}>
                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2">Ảnh</Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        label="Loại từ (N, V, ADJ...)"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Phiên âm"
                        value={pronunciation}
                        onChange={(e) => setPronunciation(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Ví dụ (tối đa 10 câu)"
                        value={examples}
                        onChange={(e) => setExamples(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Ghi chú"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </Box>
            </Collapse>
        </BaseModal>
    );
};

export default CreateFlashcardItemModal;
