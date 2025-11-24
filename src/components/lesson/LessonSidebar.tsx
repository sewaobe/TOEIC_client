import { Box, Chip, Paper, Typography, IconButton, Stack, List, ListItem, ListItemButton, ListItemIcon, ListItemText, alpha, useTheme } from "@mui/material";
import { LessonItem } from "../../types/Lesson";
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

interface LessonQueueProps {
    lessons: LessonItem[];
    currentLesson: LessonItem | null;
    onSelect: (t: LessonItem) => void;
    variant?: 'horizontal' | 'vertical';
    onToggleSidebar?: () => void;
}

const getStatusIcon = (status: string, isActive: boolean) => {
    if (status === 'lock') return <LockIcon fontSize="small" color="disabled" />;
    if (status === 'completed') return <CheckCircleIcon fontSize="small" color="success" />;
    if (isActive) return <PlayCircleIcon fontSize="small" color="primary" />;
    return <RadioButtonUncheckedIcon fontSize="small" color="action" />;
};

const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
        'flash_card': 'Từ vựng',
        'quiz': 'Kiểm tra',
        'shadowing': 'Nói đuổi',
        'dictation': 'Nghe chép',
        'lesson': 'Bài giảng'
    };
    return map[type] || type;
};

export default function LessonQueue({
    lessons,
    currentLesson,
    onSelect,
    variant = 'horizontal',
    onToggleSidebar
}: LessonQueueProps) {
    const theme = useTheme();

    if (variant === 'vertical') {
        return (
            <Paper 
                elevation={0}
                sx={{ 
                    height: 'fit-content', 
                    maxHeight: 'calc(100vh - 40px)',
                    overflowY: 'auto', 
                    p: 2,
                    bgcolor: (t) => t.palette.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} spacing={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: '800', color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                        Danh sách bài học
                    </Typography>
                    {onToggleSidebar && (
                        <IconButton onClick={onToggleSidebar} size="small" sx={{ color: 'text.secondary' }}>
                            <KeyboardDoubleArrowRightIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {lessons.map((ls, index) => {
                        const isActive = currentLesson?.id === ls.id;
                        const isLocked = ls.status === 'lock';
                        
                        return (
                            <ListItem key={index} disablePadding>
                                <ListItemButton
                                    onClick={() => onSelect(ls)}
                                    disabled={isLocked}
                                    sx={{
                                        borderRadius: 2,
                                        borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                        '&:hover': {
                                            bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.05),
                                        },
                                        py: 1,
                                        px: 1.5,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        {getStatusIcon(ls.status, isActive)}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={
                                            <Typography variant="body2" fontWeight={isActive ? 700 : 500} color={isActive ? 'primary.main' : 'text.primary'}>
                                                {ls.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                {getTypeLabel(ls.type)}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
        );
    }

    return (
        <Box>
            {/* Lesson Queue */}
            <Box
                sx={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 5,
                    mt: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: (t) =>
                        t.palette.mode === "light"
                            ? "rgba(255,255,255,0.92)"
                            : "rgba(20,24,33,0.86)",
                    backdropFilter: "blur(10px)",
                    px: 1.5,
                    py: 1,
                    borderRadius: "0 0 28px 28px",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        overflowX: "auto",
                        pb: 0.5,
                        "&::-webkit-scrollbar": { height: 8 },
                        "&::-webkit-scrollbar-thumb": {
                            bgcolor: "action.selected",
                            borderRadius: 999,
                        },
                    }}
                >
                    {lessons.map((ls, index) => {
                        const isActive = currentLesson?.id === ls.id;
                        const color =
                            ls.status === "completed"
                                ? "success"
                                : ls.status === "in_progress"
                                ? "default"
                                : "warning";
                        return (
                            <Chip
                                key={index}
                                label={ls.title}
                                color={color}
                                variant={isActive ? "filled" : "outlined"}
                                onClick={() => onSelect(ls)}
                                sx={{
                                    cursor: ls.status === "lock" ? "not-allowed" : "pointer",
                                    opacity: ls.status === "lock" ? 0.5 : 1,
                                    borderRadius: 2,
                                    fontWeight: isActive ? 700 : 500,
                                    "&.MuiChip-filled": {
                                        bgcolor:
                                            color === "success"
                                                ? "success.main"
                                                : "primary.main",
                                        color: "primary.contrastText",
                                    },
                                    "& .MuiChip-label": { px: 1.25 },
                                }}
                            />
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}
