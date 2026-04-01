import React, { useState, forwardRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Alert,
    Slide,
    Box,
    Tooltip
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import {
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    ContentCopy as ContentCopyIcon,
    Sync as SyncIcon,
    RadioButtonUnchecked as RadioButtonUncheckedIcon,
    Check as CheckIcon
} from '@mui/icons-material';

// ----------------------------------------------------------------------
// Constants & Setup
// ----------------------------------------------------------------------

type FeatureStatus = 'integrated' | 'wip' | 'pending';

interface ProjectFeature {
    name: string;
    status: FeatureStatus;
}

interface RoleFeatures {
    role: string;
    features: ProjectFeature[];
}

// Các chức năng hoạt động được phân chia theo Role
const PROJECT_FEATURES: RoleFeatures[] = [
    {
        role: 'Khách',
        features: [
            { name: 'Trang chủ giới thiệu hệ thống', status: 'integrated' },
            { name: 'Đăng nhập, đăng ký và quên mật khẩu', status: 'integrated' },
            { name: 'Làm thử bài kiểm tra năng lực đầu vào', status: 'pending' },
        ],
    },
    {
        role: 'Học viên',
        features: [
            { name: 'Xem và cập nhật thông tin cá nhân', status: 'integrated' },
            { name: 'Gợi ý lộ trình học dựa trên kết quả đầu vào', status: 'pending' },
            { name: 'Làm bài thi TOEIC (Full Test, Part, Mini Test)', status: 'integrated' },
            { name: 'Xem điểm, đáp án và lời giải chi tiết', status: 'integrated' },
            { name: 'Tìm kiếm và lọc đề thi', status: 'integrated' },
            { name: 'Học từ vựng qua Flashcard', status: 'integrated' },
            { name: 'Bình luận và thảo luận dưới mỗi đề thi', status: 'integrated' },
            { name: 'Luyện tập cải thiện kỹ năng (Dictation, Shadowing, Quiz, Speaking conversation)', status: 'pending' }
        ],
    },
    {
        role: 'Cộng tác viên',
        features: [
            { name: 'Thêm, sửa, xóa và quản lý đề thi', status: 'pending' },
            { name: 'Tìm kiếm và xem chi tiết các đề thi', status: 'pending' },
            { name: 'Giải đáp và quản lý bình luận của học viên', status: 'pending' },
            { name: 'Xem và cập nhật thông tin cá nhân', status: 'pending' },
        ],
    },
    {
        role: 'Quản trị viên',
        features: [
            { name: 'Quản lý, phân quyền và khóa tài khoản người dùng', status: 'pending' },
            { name: 'Duyệt hoặc từ chối đề thi từ Cộng tác viên', status: 'pending' },
            { name: 'Quản lý và kiểm duyệt bình luận cộng đồng', status: 'pending' },
            { name: 'Xem báo cáo thống kê (số lượng người dùng, lượt thi...)', status: 'pending' },
        ],
    },
];

// Hiệu ứng trượt từ trên xuống cho Modal
const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="down" ref={ref} {...props} />;
});

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------

interface SmartCopyButtonProps {
    textToCopy: string;
    tooltipText?: string;
}

const SmartCopyButton: React.FC<SmartCopyButtonProps> = ({ textToCopy, tooltipText = 'Copy' }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        }).catch(() => {
            console.error('Failed to copy text');
        });
    };

    return (
        <Tooltip title={copied ? 'Đã copy!' : tooltipText} placement="top">
            <IconButton
                onClick={handleCopy}
                size="small"
                className={`transition-colors duration-200 ${copied ? 'text-green-500' : 'text-blue-500'}`}
            >
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
        </Tooltip>
    );
};

// ----------------------------------------------------------------------
// Component: AnnouncementModal
// ----------------------------------------------------------------------

interface AnnouncementModalProps {
    open: boolean;
    onClose: () => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ open, onClose }) => {

    const renderFeatureIcon = (status: FeatureStatus) => {
        switch (status) {
            case 'integrated':
                return <CheckCircleIcon color="success" fontSize="small" className="mr-2 shrink-0" />;
            case 'wip':
                return <SyncIcon color="warning" fontSize="small" className="mr-2 shrink-0 animate-spin-slow" />;
            case 'pending':
                return <RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} fontSize="small" className="mr-2 shrink-0" />;
            default:
                return null;
        }
    };

    const renderRoleFeatureGroup = (roleGroup: RoleFeatures) => (
        <Box key={roleGroup.role}>
            <Typography
                variant="subtitle2"
                className="font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded inline-block !mb-3"
            >
                {roleGroup.role}
            </Typography>
            <ul className="space-y-2 pl-1">
                {roleGroup.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start text-gray-800">
                        {renderFeatureIcon(feature.status)}
                        <Typography variant="body2" className={feature.status === 'pending' ? 'text-gray-500' : 'text-gray-800'}>
                            {feature.name}
                        </Typography>
                    </li>
                ))}
            </ul>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="announcement-dialog-title"
            aria-describedby="announcement-dialog-description"
            TransitionComponent={Transition}
            maxWidth="md"
            fullWidth
            PaperProps={{
                className: 'rounded-xl',
                sx: { m: { xs: 2, sm: 'auto' } }
            }}
        >
            {/* === 1. HEADER === */}
            <DialogTitle id="announcement-dialog-title" className="flex justify-between items-center pb-2" component="div">
                <Typography variant="h6" className="font-bold text-gray-800">
                    Thông Báo Dự Án Demo
                </Typography>
                <IconButton onClick={onClose} size="small" aria-label="close">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers className="py-4 px-4 sm:px-6 space-y-5 no-scrollbar" id="announcement-dialog-description">
                {/* === 2. WARNING BANNER === */}
                <Alert severity="warning" className="rounded-lg">
                    Chào bạn! Đây là website demo phục vụ môn học và đang trong quá trình phát triển (WIP). Một số tính năng có thể chưa hoàn thiện.
                </Alert>

                {/* === 3. PROJECT FEATURES SECTION (SCROLLABLE) === */}
                <Box className="flex flex-col space-y-3">
                    <Typography variant="subtitle2" className="text-gray-700 font-bold uppercase tracking-wide">
                        Tiến độ các chức năng
                    </Typography>

                    {/* Legend (Chú thích) */}
                    <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2 rounded-md border border-gray-100 mb-2">
                        <div className="flex items-center text-xs text-gray-600">
                            <CheckCircleIcon color="success" sx={{ fontSize: 16 }} className="mr-1" /> Đã tích hợp
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                            <SyncIcon color="warning" sx={{ fontSize: 16 }} className="mr-1" /> Đang phát triển
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                            <RadioButtonUncheckedIcon sx={{ color: 'text.disabled', fontSize: 16 }} className="mr-1" /> Chưa tích hợp
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <Box className="max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Cột 1: Guest + Student */}
                            <div className="space-y-6 md:border-r border-dotted border-gray-200 md:pr-4">
                                {PROJECT_FEATURES.filter(g => g.role === 'Khách' || g.role === 'Học viên').map(renderRoleFeatureGroup)}
                            </div>

                            {/* Cột 2: Admin + Collaborator */}
                            <div className="space-y-6 md:pl-2">
                                {PROJECT_FEATURES.filter(g => g.role === 'Quản trị viên' || g.role === 'Cộng tác viên').map(renderRoleFeatureGroup)}
                            </div>
                        </div>
                    </Box>
                </Box>

                {/* === 4. DEMO CREDENTIALS SECTION === */}
                <Box className="bg-slate-100 rounded-lg p-5 border border-slate-200">
                    <Typography variant="subtitle2" className="text-gray-700 font-bold !mb-3 uppercase text-center">
                        Tài Khoản Đăng Nhập
                    </Typography>

                    <div className="space-y-3">
                        {/* Row: Tài khoản */}
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-md shadow-sm">
                            <div className="flex items-center">
                                <Typography variant="body2" className="text-gray-500 mr-2 w-20">Tài khoản:</Typography>
                                <Typography variant="body2" className="font-semibold text-gray-800">thanha17</Typography>
                            </div>
                            <SmartCopyButton textToCopy="thanha17" tooltipText="Copy tài khoản" />
                        </div>

                        {/* Row: Mật khẩu */}
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-md shadow-sm">
                            <div className="flex items-center">
                                <Typography variant="body2" className="text-gray-500 mr-2 w-20">Mật khẩu:</Typography>
                                <Typography variant="body2" className="font-semibold text-gray-800">Thanha17@</Typography>
                            </div>
                            <SmartCopyButton textToCopy="Thanha17@" tooltipText="Copy mật khẩu" />
                        </div>
                    </div>
                </Box>
            </DialogContent>

            {/* === 5. FOOTER === */}
            <DialogActions className="p-4 sm:p-6 pt-0">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onClose}
                    fullWidth
                    disableElevation
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                >
                    TÔI ĐÃ HIỂU
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AnnouncementModal;
