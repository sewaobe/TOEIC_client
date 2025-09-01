import React, { useState } from 'react';
import { Box, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import BaseModal from './BaseModal';

interface CreateFlashcardModalProps {
    titleModal: string;
    open: boolean;
    onClose: () => void;
    onSave: (data: { title: string; type: string; description: string }) => void;
}

const CreateFlashcardModal: React.FC<CreateFlashcardModalProps> = ({ titleModal, open, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');

    const handleConfirm = () => {
        if (!title.trim()) return;
        onSave({ title, type, description });
        setTitle('');
        setType('');
        setDescription('');
        onClose();
    };

    return (
        <BaseModal
            open={open}
            type="confirm"
            title={titleModal}
            confirmText="Lưu"
            cancelText="Hủy"
            onConfirm={handleConfirm}
            onCancel={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '90%', sm: 500 }, // xs <600px thì chiếm 90% màn hình, sm trở lên cố định 500px
                    maxWidth: '95%',
                    borderRadius: 2,
                },
            }}        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                <TextField
                    label="Tiêu đề list từ"
                    variant="outlined"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <FormControl fullWidth>
                    <InputLabel>Loại ngôn ngữ</InputLabel>
                    <Select
                        value={type}
                        label="Loại ngôn ngữ"
                        onChange={(e) => setType(e.target.value)}
                    >
                        <MenuItem value="Anh-Anh">Anh-Anh</MenuItem>
                        <MenuItem value="Anh-Mỹ">Anh-Mỹ</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Mô tả"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Box>
        </BaseModal>
    );
};

export default CreateFlashcardModal;
