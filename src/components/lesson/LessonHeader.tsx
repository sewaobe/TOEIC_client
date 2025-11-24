import { Box, Button, Stack, Typography, LinearProgress, Chip, Breadcrumbs, Link } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate } from "react-router-dom";
import { LessonItem } from "../../types/Lesson";

interface LessonHeaderProps {
    lesson: LessonItem | null;
    progress?: number;
    timer?: string;
}

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

export default function LessonHeader({ lesson, progress, timer }: LessonHeaderProps) {
    const navigate = useNavigate();
    
    return (
        <Box className="sticky top-0 z-10"
            sx={{ 
                border: "1px solid rgba(0,0,0,0.06)", 
                px: 3, 
                py: 2, 
                borderRadius: "24px", 
                mb: 3, 
                position: "relative",
                bgcolor: 'background.paper',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
            
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Button
                    startIcon={<ArrowBackIosNewIcon fontSize="small" />}
                    variant="text"
                    color="inherit"
                    onClick={() => navigate("/programs")}
                    sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 'fit-content' }}
                >
                    Thoát
                </Button>

                <Stack direction="column" alignItems="center" spacing={0.5} sx={{ flex: 1, px: 2 }}>
                    {/* Breadcrumbs */}
                    <Breadcrumbs aria-label="breadcrumb" sx={{ '& .MuiBreadcrumbs-ol': { justifyContent: 'center' } }}>
                        <Link 
                            underline="hover" 
                            color="inherit" 
                            onClick={() => navigate("/programs")}
                            sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                            Chương trình học
                        </Link>
                        {lesson && (
                            <Typography color="text.primary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                {getTypeLabel(lesson.type)}
                            </Typography>
                        )}
                    </Breadcrumbs>

                    <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                        <SchoolIcon color="primary" fontSize="small" />
                        <Typography variant="h6" fontWeight={800} noWrap sx={{ maxWidth: { xs: 200, md: 400 } }}>
                            {lesson ? `${lesson.title}` : "Bài học"}
                        </Typography>
                    </Stack>
                </Stack>

                <Box sx={{ minWidth: 'fit-content' }}>
                     {timer ? (
                        <Chip 
                            icon={<AccessTimeIcon />} 
                            label={timer} 
                            variant="outlined" 
                            color="primary" 
                            size="small"
                            sx={{ fontWeight: 700, minWidth: 80 }}
                        />
                     ) : (
                        <Box sx={{ width: 24 }} /> // Spacer to balance the back button roughly
                     )}
                </Box>
            </Stack>

            {/* Progress Bar */}
            {typeof progress === 'number' && (
                <Box sx={{ mt: 2, width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    background: 'linear-gradient(90deg, #2196F3 0%, #21CBF3 100%)',
                                    boxShadow: '0 0 8px rgba(33, 150, 243, 0.6)'
                                }
                            }} 
                        />
                    </Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                        {Math.round(progress)}%
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
