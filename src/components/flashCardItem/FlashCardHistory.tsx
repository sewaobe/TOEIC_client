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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
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

    // Fetch Data 
    useEffect(() => {
        const fetchHistoryFlashcardAttempt = async () => {
            const res = await flashCardService.getHistoryFlashCardAttemptByTopic(topicId);
            setAttempts(res)
        }

        fetchHistoryFlashcardAttempt();
    }, [topicId])

    // Gom nhóm theo ngày
    const grouped = useMemo(() => {
        const map: Record<string, Attempt[]> = {};
        attempts.forEach((a) => {
            const day = new Date(a.started_at).toLocaleDateString("vi-VN"); // group theo ngày
            if (!map[day]) map[day] = [];
            map[day].push(a);
        });
        return map;
    }, [attempts]);

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

                    {/* Accordion theo ngày */}
                    {Object.entries(grouped).map(([day, arr]) => (
                        <Accordion key={day}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={700}>
                                    📅 {day} ({arr.length} lần)
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List>
                                    {arr.map((a, i) => (
                                        <div key={a._id}>
                                            <ListItemButton onClick={() => setSelected(a)}>
                                                <ListItemText
                                                    primary={`Lần ${i + 1} · Accuracy ${a.accuracy}%`}
                                                    secondary={`⏱ TB ${a.avg_time}s · ${a.total} lượt`}
                                                />
                                            </ListItemButton>
                                            <Divider />
                                        </div>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    ))}
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
