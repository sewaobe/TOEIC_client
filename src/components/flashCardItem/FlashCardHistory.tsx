import { FC, useState, useMemo, useEffect } from "react";
import {
    Modal,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    Divider,
    IconButton,
    CircularProgress, // Thêm vào
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu'; // Thêm icon để UI đẹp hơn
import { StatisticsModal, Log } from "./StatisticsModal";
import { flashCardService } from "../../services/flashCard.service";

export interface Attempt {
    _id: string;
    started_at: string; // ISO string
    finished_at: string;
    accuracy: number;
    avg_time: number;
    total: number;
    logs: Log[];
}

interface FlashcardHistoryModalProps {
    open: boolean;
    onClose: () => void;
    topicId: string;
}

const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 800,
    maxHeight: "90vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    p: 3,
};

export const FlashcardHistoryModal: FC<FlashcardHistoryModalProps> = ({
    open,
    onClose,
    topicId
}) => {
    const [selected, setSelected] = useState<Attempt | null>(null);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true); // Thêm state loading

    // Fetch Data
    useEffect(() => {
        if (open) { // Chỉ fetch khi modal được mở
            const fetchHistoryFlashcardAttempt = async () => {
                try {
                    setLoading(true);
                    const res = await flashCardService.getHistoryFlashCardAttemptByTopic(topicId);
                    setAttempts(res);
                } catch (error) {
                    console.error("Failed to fetch flashcard history:", error);
                    setAttempts([]); // Đảm bảo attempts là mảng rỗng nếu có lỗi
                } finally {
                    setLoading(false);
                }
            };

            fetchHistoryFlashcardAttempt();
        }
    }, [topicId, open]); // Thêm `open` vào dependency array

    // Gom nhóm theo ngày
    const grouped = useMemo(() => {
        const map: Record<string, Attempt[]> = {};
        // Sắp xếp các lần thử từ mới nhất đến cũ nhất trước khi gom nhóm
        const sortedAttempts = [...attempts].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
        
        sortedAttempts.forEach((a) => {
            const day = new Date(a.started_at).toLocaleDateString("vi-VN", {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            if (!map[day]) map[day] = [];
            map[day].push(a);
        });
        return map;
    }, [attempts]);

    const renderContent = () => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" py={10}>
                    <CircularProgress />
                </Box>
            );
        }

        if (attempts.length === 0) {
            return (
                <Box
                    textAlign="center"
                    py={6}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2} // Tạo khoảng cách giữa các phần tử
                    color="text.secondary"
                >
                    <HistoryEduIcon sx={{ fontSize: '4.5rem', color: 'grey.400' }} />
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                        Bạn chưa có lịch sử luyện tập
                    </Typography>
                    <Typography variant="body2">
                        Hãy bắt đầu một phiên học ngay để theo dõi tiến độ của bạn nhé!
                    </Typography>
                </Box>
            );
        }

        return (
            <>
                {Object.entries(grouped).map(([day, arr]) => (
                    <Accordion key={day} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>
                                📅 {day} ({arr.length} lần)
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <List sx={{ py: 0 }}>
                                {arr.map((a, i) => (
                                    <div key={a._id}>
                                        <ListItemButton onClick={() => setSelected(a)}>
                                            <ListItemText
                                                primary={`Lần ${arr.length - i} · Chính xác ${a.accuracy}%`}
                                                secondary={`⏱ Thời gian TB: ${a.avg_time.toFixed(2)}s · Tổng: ${a.total} thẻ`}
                                            />
                                        </ListItemButton>
                                        {i < arr.length - 1 && <Divider component="li" />}
                                    </div>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </>
        );
    };

    return (
        <>
            <Modal open={open} onClose={onClose} disableScrollLock>
                <Box sx={style}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={800}>
                            📖 Lịch sử luyện tập Flashcard
                        </Typography>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Content Area */}
                    {renderContent()}
                </Box>
            </Modal>

            {/* Khi chọn 1 attempt thì show chi tiết */}
            {selected && (
                <StatisticsModal
                    open={!!selected}
                    onClose={() => setSelected(null)}
                    logs={selected.logs}
                />
            )}
        </>
    );
};