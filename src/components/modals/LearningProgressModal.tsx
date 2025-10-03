import { useState, FC, useEffect } from 'react';
import { Box, Dialog, Divider, IconButton, Stack, Typography } from '@mui/material';

import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import LearningProgress from '../../components/learningProgress/LearningProgress';

interface LearningProgressModalProps {
    isFirstVisitToday: boolean;
    setIsFirstVisitToday: (flag: boolean) => void
}

export const LearningProgressModal: FC<LearningProgressModalProps> = ({
    isFirstVisitToday,
    setIsFirstVisitToday
}) => {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        // Tìm đến thẻ <html>
        const htmlElement = document.documentElement;

        if (isFirstVisitToday) {
            // Khi modal mở, thêm class
            htmlElement.classList.add('lock-action');
        }

        // --- Hàm dọn dẹp (Cleanup Function) ---
        // Hàm này sẽ chạy khi modal đóng
        return () => {
            // Xóa class đi để trả lại scroll cho trang
            htmlElement.classList.remove('lock-action');
        };

    }, [isFirstVisitToday]); // useEffect sẽ chạy lại mỗi khi isFirstVisitToday thay đổi

    const handleClose = () => {
        setIsFirstVisitToday(false);
        if (isMaximized) {
            setIsMaximized(false);
        }
    };

    return (
        <Dialog
            open={isFirstVisitToday}
            onClose={handleClose}
            fullWidth
            fullScreen={isMaximized}
            maxWidth={isMaximized ? false : 'md'}
            disableScrollLock
            PaperProps={{
                sx: {
                    borderRadius: isMaximized ? 0 : 4,
                    p: 2,
                    // =======================================================
                    // THAY ĐỔI CHÍNH Ở ĐÂY
                    // Làm cho chiều cao tối đa linh hoạt theo trạng thái
                    maxHeight: isMaximized ? "100vh" : "90vh",
                    // =======================================================
                    maxWidth: isMaximized ? "100%" : "1000px",
                    transition: (theme) => theme.transitions.create(['max-width', 'max-height', 'border-radius'], {
                        duration: theme.transitions.duration.shorter,
                    }),
                },
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={800}>
                    Tiến trình học
                </Typography>
                <Stack direction="row">
                    <IconButton onClick={() => setIsMaximized(!isMaximized)}>
                        {isMaximized ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {/* Chiều cao của Box nội dung cũng cần linh hoạt */}
            <Box sx={{ overflowY: "auto", height: '100%', pr: 1 }}>
                <LearningProgress />
            </Box>
        </Dialog>
    )
}