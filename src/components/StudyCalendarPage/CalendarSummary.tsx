import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

// MUI Components
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// MUI Icons
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box } from '@mui/material';
import { FC } from 'react';

interface CalendarSummaryProps {
    view: 'CALENDAR' | 'TIMELINE';
    onViewChange: (newView: 'CALENDAR' | 'TIMELINE') => void;
}
export const CalendarSummary: FC<CalendarSummaryProps> = ({ view, onViewChange }) => {
    const handleViewChange = (
        event: React.MouseEvent<HTMLElement>,
        newView: 'CALENDAR' | 'TIMELINE' | null,
    ) => {
        // Chỉ gọi hàm của cha nếu người dùng chọn một giá trị mới (không phải null)
        if (newView !== null) {
            onViewChange(newView);
        }
    };
    return (
        <>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
                spacing={{ xs: 2, sm: 1 }}
                mb={3}
            >
                {/* Phần tiêu đề */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <MapOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                    <Box>
                        <Typography variant="h5" component="h1" fontWeight="bold">
                            TOEIC – Program vs Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Lịch chương trình & nhật ký cá nhân • Unlock sớm/muộn • Gamification
                        </Typography>
                    </Box>
                </Stack>

                {/* Phần các nút điều khiển */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {/* Nút Hôm nay */}
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        sx={{ textTransform: 'none', borderRadius: 3, color: 'text.primary', borderColor: 'grey.300' }}
                    >
                        Hôm nay
                    </Button>

                    {/* Nút điều hướng tháng */}
                    <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', borderRadius: 3, borderColor: 'grey.300' }}>
                        <IconButton aria-label="Previous month">
                            <ChevronLeftIcon />
                        </IconButton>
                        <Typography variant="body2" fontWeight="medium" sx={{ px: 1, whiteSpace: 'nowrap' }}>
                            {1}
                        </Typography>
                        <IconButton aria-label="Next month">
                            <ChevronRightIcon />
                        </IconButton>
                    </Paper>

                    {/* Nút lọc L/R */}
                    {/* <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 3, borderColor: 'grey.300' }}>
                        <ToggleButtonGroup
                            value={12}
                            exclusive
                            aria-label="Filter by skill"
                            size="small"
                        >
                            <ToggleButton value="ALL" sx={{ textTransform: 'none', borderRadius: 2 }}>Tất cả</ToggleButton>
                            <ToggleButton value="L" sx={{ textTransform: 'none', borderRadius: 2 }}>L</ToggleButton>
                            <ToggleButton value="R" sx={{ textTransform: 'none', borderRadius: 2 }}>R</ToggleButton>
                        </ToggleButtonGroup>
                    </Paper> */}

                    {/* Nút chuyển đổi View */}
                    <ToggleButtonGroup
                        value={view}
                        exclusive
                        aria-label="View mode"
                        size="small"
                        onChange={handleViewChange} // <-- Sử dụng hàm xử lý onChange
                    >
                        <ToggleButton value="CALENDAR" sx={{ textTransform: 'none' }}>Lịch</ToggleButton>
                        <ToggleButton value="TIMELINE" sx={{ textTransform: 'none' }}>Dòng chảy</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Stack>
            <Grid container spacing={2} mb={3}>
                {/* Card 1: Tổng quan tháng */}
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 3, borderColor: 'grey.300', height: '100%' }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} mb={1} color="text.secondary">
                            <ShowChartIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2" fontWeight="medium">
                                Tổng quan tháng
                            </Typography>
                        </Stack>
                        <Typography variant="h4" fontWeight="bold">
                            {10}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {10}/{20} bài theo chương trình đã hoàn thành
                        </Typography>
                    </Paper>
                </Grid>

                {/* Card 2: Tiến độ so với lịch */}
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 3, borderColor: 'grey.300', height: '100%' }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} mb={1} color="text.secondary">
                            <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2" fontWeight="medium">
                                Tiến độ so với lịch
                            </Typography>
                        </Stack>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            color={'success.main'}
                        >
                            {0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {'Đi trước'} lịch ({1}/{3} bài đến hôm nay)
                        </Typography>
                    </Paper>
                </Grid>

                {/* Card 3: Minh họa nhiệm vụ */}
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 3, borderColor: 'grey.300', height: '100%' }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} mb={1} color="text.secondary">
                            <FactCheckOutlinedIcon sx={{ fontSize: 18 }} />
                            <Typography variant="body2" fontWeight="medium">
                                Minh họa nhiệm vụ
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} mt={2}>
                            <Chip label="Sớm" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 500 }} />
                            <Chip label="Đúng hạn" size="small" sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 500 }} />
                            <Chip label="Muộn" size="small" sx={{ bgcolor: 'warning.light', color: 'warning.dark', fontWeight: 500 }} />
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}