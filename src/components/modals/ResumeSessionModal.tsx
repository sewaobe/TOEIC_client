import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";

interface ResumeSessionModalProps {
    open: boolean;
    progress: number; // completed_items / total_items * 100
    completedItems: number;
    totalItems: number;
    onResume: () => void;
    onCancel: () => void;
}

export default function ResumeSessionModal({
    open,
    progress,
    completedItems,
    totalItems,
    onResume,
    onCancel,
}: ResumeSessionModalProps) {
    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    pb: 1,
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#1e293b",
                }}
            >
                Tiếp tục phiên học trước?
            </DialogTitle>

            <DialogContent>
                <Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Bạn đang có một phiên học chưa hoàn thành. Bạn có muốn tiếp tục từ nơi đã dừng lại không?
                    </Typography>

                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                            Tiến độ hiện tại: {completedItems}/{totalItems} câu ({Math.round(progress)}%)
                        </Typography>
                        
                        <Box
                            sx={{
                                mt: 1.5,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "#e2e8f0",
                                overflow: "hidden",
                            }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                style={{
                                    height: "100%",
                                    backgroundColor: "#2563eb",
                                    borderRadius: 4,
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={onCancel}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#d1d5db",
                        color: "#6b7280",
                        "&:hover": {
                            borderColor: "#dc2626",
                            color: "#dc2626",
                            backgroundColor: "rgba(220,38,38,0.05)",
                        },
                    }}
                >
                    Bắt đầu lại
                </Button>
                <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={onResume}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        backgroundColor: "#2563eb",
                        boxShadow: "0 4px 10px rgba(37,99,235,0.3)",
                        "&:hover": {
                            backgroundColor: "#1e40af",
                        },
                    }}
                >
                    Tiếp tục học
                </Button>
            </DialogActions>
        </Dialog>
    );
}
