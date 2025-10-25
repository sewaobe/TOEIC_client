import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    Skeleton,
} from '@mui/material';
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BatchFlashcardModal from '../../components/modals/BatchFlashcardModal';
import PaginationContainer from '../../components/common/PaginationContainer';
import CreateFlashcardItemModal, { FlashcardItem } from '../../components/modals/CreateFlashcardItemModal';
import CreateFlashcardModal from '../../components/modals/CreateFlashcardModal';
import MainLayout from '../layouts/MainLayout';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { topicService } from '../../services/topic.service';
import { uploadToCloudinaryFromString } from '../../services/cloudinary.service';
import { vocabularyService } from '../../services/vocabulary.service';

import {
    Collapse,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useSpeech } from '../../hooks/useSpeech';
import ContinueLearningFLModal from '../../components/modals/ContinueLearningFLModal';
import { flashCardProgressService } from '../../services/flashcard_progress.service';

export const FlashcardItemPaper = ({
    f,
    handleOpenItemModal,
    handleDelete,
    expandedId,
    setExpandedId,
}: {
    f: FlashcardItem;
    handleOpenItemModal: (item: FlashcardItem) => void;
    handleDelete: (id: string) => void;
    expandedId: string | null;
    setExpandedId: (id: string | null) => void;
}) => {
    const isExpanded = expandedId === f._id;

    const handleToggle = () => {
        setExpandedId(isExpanded ? null : f._id || null);
    };

    const { speak } = useSpeech();

    return (
        <Paper
            sx={{
                p: 2,
                width: "100%", // ✅ full width
                borderRadius: 2,
                boxShadow: isExpanded ? 4 : 1,
                transition: "all 0.25s ease",
            }}
        >
            {/* --- Header row --- */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Box>
                    <Typography
                        variant="subtitle1"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                        <strong>{f.word}</strong>
                        {f.phonetic && (
                            <Typography variant="body2" color="text.secondary">
                                [{f.phonetic}]
                            </Typography>
                        )}
                        <VolumeUpIcon
                            fontSize="small"
                            sx={{ cursor: "pointer", color: "primary.main" }}
                            onClick={() => speak(f.word)}
                        />
                        <IconButton size="small" onClick={() => handleOpenItemModal(f)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Định nghĩa: {f.definition}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton onClick={handleToggle}>
                        {isExpanded ? (
                            <ExpandLessIcon color="action" />
                        ) : (
                            <ExpandMoreIcon color="action" />
                        )}
                    </IconButton>
                    <IconButton
                        onClick={() => f._id && handleDelete(f._id)}
                        size="small"
                    >
                        <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* --- Expandable content --- */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Left content */}
                    <Box sx={{ flex: 1 }}>
                        {f.type && (
                            <Typography
                                variant="caption"
                                sx={{
                                    bgcolor: "primary.light",
                                    color: "white",
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: 1,
                                    fontWeight: 500,
                                    display: "inline-block",
                                    mb: 1,
                                }}
                            >
                                {f.type}
                            </Typography>
                        )}

                        {/* Ví dụ */}
                        {f.examples && f.examples.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Ví dụ:
                                </Typography>
                                {f.examples.slice(0, 2).map((ex, i) => (
                                    <Box key={i} sx={{ pl: 1, mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                                            “{ex.en}”
                                        </Typography>
                                        {ex.vi && (
                                            <Typography variant="body2" color="text.secondary">
                                                → {ex.vi}
                                            </Typography>
                                        )}
                                    </Box>
                                ))}
                                {f.examples.length > 2 && (
                                    <Typography
                                        variant="body2"
                                        color="text.disabled"
                                        sx={{ pl: 1 }}
                                    >
                                        +{f.examples.length - 2} ví dụ khác...
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {f.notes && (
                            <Typography
                                variant="body2"
                                sx={{
                                    fontStyle: "italic",
                                    color: "text.secondary",
                                    bgcolor: "rgba(0,0,0,0.03)",
                                    p: 1,
                                    borderRadius: 1,
                                }}
                            >
                                📝 {f.notes}
                            </Typography>
                        )}
                    </Box>

                    {f.image && (
                        <Box
                            sx={{
                                width: 90,
                                height: 90,
                                borderRadius: 1.5,
                                overflow: "hidden",
                                border: "1px solid #eee",
                                flexShrink: 0,
                            }}
                        >
                            <img
                                src={f.image}
                                alt={f.word}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
};

const FlashcardDetail: React.FC = () => {
    const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 5;
    const location = useLocation();
    const topicId = location.pathname.split("/").pop();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");
    const [flashcardInfo, setFlashcardInfo] = useState<{ title: string; tags: string[]; description: string } | null>(() => {
        const storedInfo = localStorage.getItem('flashcardInfo');
        return storedInfo ? JSON.parse(storedInfo) : null;
    });
    // Modal states
    const [openBatchModal, setOpenBatchModal] = useState(false);
    const [openItemModal, setOpenItemModal] = useState(false);
    const [editWord, setEditWord] = useState<FlashcardItem>();
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const startTime = Date.now();

            if (topicId) {
                const res = await topicService.getTopicVocabularyDetail(topicId, page, itemsPerPage);
                setFlashcards(res.items);
                setPageCount(res.pageCount);
                setTotalItems(res.total);
                toast.success('Lấy danh sách flashcards thành công!');
            } else {
                toast.error('Topic ID không hợp lệ.');
            }

            // 🕒 Giữ skeleton ít nhất 500ms
            const elapsed = Date.now() - startTime;
            const minDelay = 500; // có thể điều chỉnh 400–700 tùy cảm nhận
            if (elapsed < minDelay) {
                await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
            }
        } catch (err) {
            toast.error('Lấy danh sách flashcards thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page])

    const handleDelete = async (id: string) => {
        if (type === 'explore') {
            toast.error('Bạn không có quyền chỉnh sửa từ trong danh sách khám phá.');
            return;
        }
        try {
            if (topicId) {
                await vocabularyService.deleteVocabulary(id, topicId);
                setFlashcards(flashcards.filter((f) => f._id !== id));
                toast.success('Xóa flashcard thành công!');
            }
        } catch (error) {
            toast.error('Xóa flashcard thất bại. Vui lòng thử lại.');
        }
    };

    // Mở modal tạo mới / chỉnh sửa
    const handleOpenItemModal = (item?: FlashcardItem) => {
        if (type === 'explore') {
            toast.error('Bạn không có quyền chỉnh sửa từ trong danh sách khám phá.');
            return;
        }
        setEditWord(item);
        setOpenItemModal(true);
    };

    // Lưu từ mới hoặc chỉnh sửa
    const handleSaveItem = async (data: FlashcardItem) => {
        const finalImageUrl = await uploadToCloudinaryFromString(data.image || null);
        if (!data.word.trim()) {
            toast.error('Từ vựng không được để trống.');
            return;
        }
        if (editWord?._id) {
            await vocabularyService.updateVocabulary(editWord._id, {
                ...data,
                image: finalImageUrl,
            });
            toast.success('Cập nhật từ thành công!');
        } else {
            if (topicId) {
                await vocabularyService.createVocabulary({
                    ...data,
                    image: finalImageUrl,
                    topicId,
                    tags: flashcardInfo?.tags || [],
                });
                toast.success('Tạo từ mới thành công!');
            }
        }

        fetchData();
        setOpenItemModal(false);
    };

    const handleSaveBatch = async (data: any[]) => {
        try {
            setIsLoading(true);
            if (topicId) {
                const dataWithTopic = data.map(item => ({
                    ...item,
                    topicId: topicId,
                }));
                await vocabularyService.createVocabulary(dataWithTopic);
                toast.success('Tạo từ hàng loạt thành công!');
            }
        } catch (error) {
            toast.error('Tạo từ hàng loạt thất bại. Vui lòng thử lại.');
        } finally {
            setOpenBatchModal(false);
            setIsLoading(false);
            fetchData();
        }
    };
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const navigate = useNavigate();
    const [openContinueModal, setOpenContinueModal] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    useEffect(() => {
        const fetchSession = async () => {
            if (topicId) {
                const sessions = await flashCardProgressService.getAllActiveSessionsByUser();
                const currentSession = sessions.items.find((session: any) => session.topic._id === topicId);
                if (currentSession) {
                    setSessionId(currentSession.session_id);
                    setOpenContinueModal(true);
                }
            }
        }
        fetchSession();
    }, [topicId]);
    return (
        <MainLayout>
            <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 900, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }} className="cursor-pointer" onClick={() => {
                        navigate('/flash-cards');
                    }}>
                        Flashcards: Chủ đề {flashcardInfo ? flashcardInfo.title : 'đang bị lỗi'}
                    </Typography>
                    {type === 'myList' && (
                        <>
                            <Button variant="contained" size="small" onClick={() => setOpenCreateModal(true)} sx={{ ml: 'auto' }}>
                                Chỉnh sửa
                            </Button>
                            <Button variant="contained" size="small" onClick={() => handleOpenItemModal()}>
                                Thêm từ mới
                            </Button>
                            <Button variant="contained" size="small" onClick={() => setOpenBatchModal(true)}>
                                Tạo hàng loạt
                            </Button>
                        </>
                    )}
                </Box>

                {/* Info box */}
                <Paper sx={{ p: 2, bgcolor: '#DFFBF0', mb: 2 }}>
                    <Typography variant="body2">
                        Chú ý: Audio mặc định là tiếng Anh-Anh và Anh-Mỹ. Các ngôn ngữ khác chỉ hỗ trợ trên máy tính.
                    </Typography>
                </Paper>

                {/* Luyện tập button */}
                <Button
                    variant="contained"
                    fullWidth sx={{ mb: 1 }}
                    onClick={async () => {
                        navigate("practice");
                    }}
                >
                    Luyện tập flashcards
                </Button>

                <Typography variant="body2" sx={{ mb: 2, cursor: 'pointer', color: 'primary.main' }}>
                    Xem ngẫu nhiên
                </Typography>

                {/* Flashcard list + pagination */}
                {isLoading ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {/* Hiển thị 5 skeleton giả lập flashcards */}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Paper
                                key={i}
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                }}
                            >
                                <Box sx={{ width: "80%" }}>
                                    <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="60%" height={20} />
                                </Box>
                                <Skeleton variant="circular" width={32} height={32} />
                            </Paper>
                        ))}
                    </Box>
                ) : flashcards.length === 0 ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            mt: 6,
                            color: "text.secondary",
                            textAlign: "center",
                        }}
                    >
                        <LibraryBooksOutlinedIcon
                            sx={{ fontSize: 60, mb: 1, color: "grey.400" }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Chưa có từ nào trong list
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Vui lòng thêm từ mới để bắt đầu học nhé.
                        </Typography>

                        <Button
                            variant="outlined"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => handleOpenItemModal()}
                        >
                            Thêm từ mới
                        </Button>
                    </Box>
                ) : (
                    <PaginationContainer
                        items={flashcards}
                        pageCount={pageCount}
                        page={page}
                        onPageChange={setPage}
                        contentSx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                        renderItem={(f: FlashcardItem) => (
                            <FlashcardItemPaper
                                key={f._id}
                                f={f}
                                handleOpenItemModal={handleOpenItemModal}
                                handleDelete={handleDelete}
                                expandedId={expandedId}
                                setExpandedId={setExpandedId}
                            />
                        )}
                    />
                )}

                {/* Modals */}
                <CreateFlashcardModal
                    key={flashcardInfo ? flashcardInfo.title : 'create-item-modal'}
                    titleModal='Chỉnh sửa List từ'
                    open={openCreateModal}
                    onClose={() => setOpenCreateModal(false)}
                    onSave={async (data) => {
                        try {
                            if (topicId) {
                                const res = await toast.promise(topicService.updateTopicVocabulary(topicId, data), {
                                    loading: 'Đang cập nhật...',
                                    success: 'Cập nhật thành công!',
                                    error: 'Cập nhật thất bại. Vui lòng thử lại.',
                                })
                                setFlashcardInfo(data);
                                localStorage.setItem('flashcardInfo', JSON.stringify(data));
                            } else {
                                toast.error('Topic ID không hợp lệ.');
                            }
                        } catch (err) {
                            toast.error('Cập nhật thất bại. Vui lòng thử lại.');
                        }
                    }}
                    data={flashcardInfo || undefined}
                />

                <CreateFlashcardItemModal
                    key={editWord ? editWord._id : 'create-new-item'}
                    open={openItemModal}
                    listName={`Flashcard List Chủ đề ${flashcardInfo ? flashcardInfo.title : 'đang bị lỗi'}`}
                    onClose={() => setOpenItemModal(false)}
                    onSave={handleSaveItem}
                    editData={editWord}
                />

                <BatchFlashcardModal
                    open={openBatchModal}
                    onClose={() => setOpenBatchModal(false)}
                    onSave={handleSaveBatch}
                />

                {/* Continue modal */}
                <ContinueLearningFLModal
                    open={openContinueModal}
                    topicTitle={flashcardInfo ? flashcardInfo.title : 'bài học này'}
                    onClose={async () => {
                        if (sessionId) {
                            await flashCardProgressService.removeSession(sessionId);
                        }
                        setOpenContinueModal(false)
                    }}
                    onContinue={() => {
                        setOpenContinueModal(false);
                        if (sessionId) {
                            localStorage.setItem("flashcard_session_id", sessionId);
                            navigate(`/flash-cards/${topicId}/practice`);
                        }
                    }}
                />
            </Box>
        </MainLayout>
    );
};

export default FlashcardDetail;
