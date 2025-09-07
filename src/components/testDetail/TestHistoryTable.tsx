import {
    Box, Chip, Link, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, Button, CircularProgress
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import userTestService from '../../services/user_test.service';
import { IUserTestHistory } from '../../types/IUserTestHistory';

type Pagination = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

const defaultFormatDate = (d: Date) =>
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function TestHistoryTable() {
    const location = useLocation();
    const testId = location.pathname.split('/')[2];

    // cấu hình hiển thị
    const SERVER_LIMIT = 10; // mỗi lần gọi API lấy 10
    const STEP = 4;          // mỗi lần bấm "Xem thêm" hiện thêm 4

    const [items, setItems] = useState<IUserTestHistory[]>([]);
    const [visible, setVisible] = useState<number>(STEP);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // giữ page hiện tại (tham chiếu) để dùng trong handler mà không sợ stale
    const pageRef = useRef<number>(1);

    const fetchPage = async (page: number): Promise<number> => {
        setLoading(true);
        try {
            const res = await userTestService.getUserTestHistories(page, SERVER_LIMIT, testId);
            // res.data giống payload bạn đưa: { data: { data: IUserTestHistory[], pagination: Pagination } }
            const newItems: IUserTestHistory[] = res.data || [];
            setItems(prev => (page === 1 ? newItems : [...prev, ...newItems]));
            setPagination(res.pagination);
            pageRef.current = res.pagination.page;
            return newItems.length;
        } catch (e) {
            console.error(e);
            return 0;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // reset khi đổi testId
        setItems([]);
        setVisible(STEP);
        setPagination(null);
        pageRef.current = 1;
        fetchPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testId]);

    const handleViewMore = async () => {
        const need = visible + STEP - items.length; // cần thêm bao nhiêu để đủ hiển thị
        if (need <= 0) {
            // còn sẵn trong bộ đệm hiện tại
            setVisible(v => v + STEP);
            return;
        }
        // hết bộ đệm, nếu còn trang sau thì nạp thêm
        if (pagination?.hasNext) {
            const added = await fetchPage(pageRef.current + 1);
            // sau khi nạp, tăng visible nhưng không vượt quá tổng items hiện có
            setVisible(v => Math.min(v + STEP, items.length + added));
        } else {
            // không còn trang -> chỉ mở tối đa số hiện có
            setVisible(items.length);
        }
    };

    const hasBufferToShow = visible < items.length;
    const hasMoreServerPages = pagination?.hasNext ?? false;
    const atEnd = !loading && !hasBufferToShow && !hasMoreServerPages; // đã hiển thị hết
    const canCollapse = atEnd && visible > STEP;

    const handleButtonClick = () => {
        if (canCollapse) {
            // Thu gọn lại về số mặc định
            setVisible(STEP);
            return;
        }
        // Ngược lại vẫn là "Xem thêm"
        void handleViewMore();
    };

    // ---- label nút ----
    const buttonLabel = canCollapse ? 'Thu gọn lại' : (loading ? 'Đang tải...' : 'Xem thêm');
    const buttonDisabled = loading || (!canCollapse && !hasBufferToShow && !hasMoreServerPages);


    return (
        <Box>
            <Typography variant="subtitle1" className="!font-semibold !mb-2">
                Kết quả làm bài của bạn:
            </Typography>

            <TableContainer component={Paper} elevation={0} className="border border-gray-200">
                <Table
                    size="medium"
                    aria-label="test history table"
                    sx={{
                        borderCollapse: 'collapse',
                        '& td, & th': { borderBottom: '1px solid', borderColor: 'divider' },
                        '& th, & td': { borderRight: '1px solid', borderColor: 'divider' },
                        '& th:last-of-type, & td:last-of-type': { borderRight: 'none' },
                    }}
                >
                    <TableHead>
                        <TableRow sx={{ '& th': { fontWeight: 700, backgroundColor: 'action.hover', borderColor: 'divider' } }}>
                            <TableCell>Ngày làm</TableCell>
                            <TableCell>Kết quả</TableCell>
                            <TableCell>Thời gian làm bài</TableCell>
                            <TableCell width={140}></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {items.slice(0, visible).map((it, idx) => {
                            const date = new Date(it.submit_at);
                            const parts = it.completedPart.split(',');
                            return (
                                <TableRow
                                    key={`${it._id}-${idx}`}
                                    sx={{
                                        '& td': { borderColor: 'divider' },
                                        backgroundColor: idx % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, maxWidth: '250px' }}>
                                            <Typography variant='body2' sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                {defaultFormatDate(date)}
                                            </Typography>
                                            {parts.map((part, index) => (
                                                <Chip
                                                    key={index}
                                                    label={part}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: (t) => t.palette.primary.main,
                                                        color: (t) => t.palette.getContrastText(t.palette.primary.main),
                                                        height: 22, borderRadius: '8px',
                                                        '& .MuiChip-label': { px: 1 },
                                                        minWidth: 'unset', width: 'fit-content',
                                                        fontWeight: 600, fontSize: 12,
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        {it.correctCount}/{it.questionCount} (Điểm: {it.score})
                                    </TableCell>

                                    <TableCell>{formatDuration(it.duration)}</TableCell>

                                    <TableCell align="center">
                                        <Link
                                            href={`${location.pathname}/result/${it._id}`}
                                            underline="hover"
                                            color="primary"
                                            sx={{ fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {items.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    Chưa có kết quả nào.
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Hàng nút điều khiển */}
                        {(items.length > 0) && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleButtonClick}
                                        disabled={buttonDisabled}
                                        startIcon={loading ? <CircularProgress size={16} /> : undefined}
                                    >
                                        {buttonLabel}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
