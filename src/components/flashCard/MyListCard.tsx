import React, { useState } from "react";
import {
    Paper,
    Typography,
    Box,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useNavigate } from "react-router-dom";
import { FlashcardList } from "../../views/pages/FlashCardPage";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";

interface MyListCardProps {
    item: FlashcardList;
    onCreateCard?: () => void;
    onDelete?: (id: string) => void;
}

export const MyListCard: React.FC<MyListCardProps> = ({ item, onCreateCard, onDelete }) => {
    const navigate = useNavigate();
    const [openConfirm, setOpenConfirm] = useState(false);

    // 👉 “Tạo list từ mới”
    if ("isCreateCard" in item && item.isCreateCard) {
        return (
            <Paper
                sx={{
                    p: 4,
                    border: (theme) => `2px dashed ${theme.palette.primary.light}`,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 180,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": { bgcolor: "primary.lighter", boxShadow: 4 },
                }}
                onClick={onCreateCard}
            >
                <AddCircleOutlineIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                <Typography sx={{ fontWeight: 600, fontSize: "1.125rem", color: "primary.main" }}>
                    Tạo list từ
                </Typography>
            </Paper>
        );
    }
    const handleClick = () => {
        navigate(`/flash-cards/${item._id}?type=myList`);
        localStorage.setItem("flashcardInfo", JSON.stringify(item));
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenConfirm(true);
    };

    const confirmDelete = () => {
        setOpenConfirm(false);
        onDelete?.(item._id);
    };

    return (
        <>
            <Paper
                sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 2,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 180,
                    position: "relative",
                    transition: "all 0.3s",
                    "&:hover": { boxShadow: 6 },
                    "&:hover .delete-btn": { opacity: 1 },
                }}
                onClick={handleClick}
            >
                {/* Nút xóa */}
                <Tooltip title="Xóa danh sách" arrow placement="top">
                    <IconButton
                        className="delete-btn"
                        size="small"
                        onClick={handleDelete}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            opacity: 0,
                            transition: "opacity 0.2s ease",
                            bgcolor: "rgba(255,0,0,0.05)",
                            "&:hover": { bgcolor: "rgba(255,0,0,0.15)" },
                        }}
                    >
                        <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                </Tooltip>

                {/* Tiêu đề */}
                <Typography
                    sx={{
                        mb: 1,
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "text.primary",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                    }}
                >
                    {item.title}
                </Typography>

                {/* Thông tin */}
                <Box sx={{ display: "flex", gap: 2, color: "text.secondary", fontSize: 14, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocalOfferIcon sx={{ fontSize: 16 }} /> <span>{item?.wordCount || 0} từ</span>
                    </Box>
                </Box>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "nowrap",
                            gap: 1,
                            overflow: "hidden",
                            mb: 1.5,
                            alignItems: "center",
                            mt: "auto",
                        }}
                    >
                        {item.tags.slice(0, 2).map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{
                                    bgcolor: "rgba(25, 118, 210, 0.08)",
                                    color: "primary.main",
                                    fontSize: 12,
                                    height: 24,
                                    borderRadius: "8px",
                                    border: "1px solid rgba(25, 118, 210, 0.2)",
                                    fontWeight: 500,
                                    "& .MuiChip-label": { px: 1 },
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* Hiển thị trạng thái công khai / riêng tư */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                    }}
                >
                    <Tooltip
                        title={item.isPublic ? "Danh sách công khai" : "Danh sách riêng tư"}
                        arrow
                        placement="top"
                    >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {item.isPublic ? (
                                <PublicIcon sx={{ fontSize: 18, color: "primary.main" }} />
                            ) : (
                                <LockIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                            )}
                        </Box>
                    </Tooltip>
                </Box>
            </Paper>

            {/* Modal xác nhận xóa */}
            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} disableScrollLock>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa danh sách <strong>{item.title}</strong> không?
                        Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>Hủy</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete}>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
