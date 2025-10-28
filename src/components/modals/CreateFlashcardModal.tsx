import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Autocomplete,
    Switch,
    FormControlLabel,
} from '@mui/material';
import BaseModal from './BaseModal';
import { toast } from 'sonner';
import { TOEIC_TAGS } from '../../constants/toeicTags';

interface CreateFlashcardModalProps {
    titleModal: string;
    open: boolean;
    onClose: () => void;
    onSave: (data: { title: string; tags: string[]; description: string; isPublic: boolean }) => void;
    data?: { title: string; tags: string[]; description: string; isPublic: boolean };
}

const CreateFlashcardModal: React.FC<CreateFlashcardModalProps> = ({
    titleModal,
    open,
    onClose,
    onSave,
    data,
}) => {
    const [formData, setFormData] = useState<{
        title: string;
        tags: string[];
        description: string;
        isPublic: boolean;
    }>({
        title: data?.title || '',
        tags: data?.tags || [],
        description: data?.description || '',
        isPublic: data?.isPublic || false,
    });

    useEffect(() => {
        if (data) {
            setFormData({
                title: data.title || '',
                tags: data.tags || [],
                description: data.description || '',
                isPublic: data.isPublic ?? false,
            });
        }
    }, [data]);

    const handleConfirm = () => {
        if (!formData.title.trim()) {
            toast.error('Tiêu đề không được để trống');
            return;
        }
        onSave({
            title: formData.title,
            tags: formData.tags,
            description: formData.description,
            isPublic: formData.isPublic,
        });
        setFormData({
            title: '',
            tags: [],
            description: '',
            isPublic: false,
        });
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
                    width: { xs: '90%', sm: 500 },
                    maxWidth: '95%',
                    borderRadius: 2,
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                <TextField
                    label="Tiêu đề list từ"
                    variant="outlined"
                    fullWidth
                    value={formData.title}
                    onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                    }
                />

                <Autocomplete
                    multiple
                    freeSolo
                    options={TOEIC_TAGS}
                    getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option
                    }
                    isOptionEqualToValue={(option, value) =>
                        typeof option === 'string' && typeof value === 'string'
                            ? option === value
                            : option ===
                            (typeof value === 'string' ? value : value)
                    }
                    value={formData.tags || []}
                    onChange={(_, newValue) =>
                        setFormData({
                            ...formData,
                            tags: newValue.map((item) =>
                                typeof item === 'string' ? item : item
                            ),
                        })
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Thẻ (tags)"
                            placeholder="Thêm thẻ liên quan đến chủ đề TOEIC"
                        />
                    )}
                />

                <TextField
                    label="Mô tả"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            description: e.target.value,
                        })
                    }
                />

                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.isPublic}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    isPublic: e.target.checked,
                                })
                            }
                            color="primary"
                        />
                    }
                    label={
                        formData.isPublic
                            ? 'Công khai (mọi người có thể xem)'
                            : 'Riêng tư (chỉ bạn thấy)'
                    }
                />
            </Box>
        </BaseModal>
    );
};

export default CreateFlashcardModal;
