import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  useTheme,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { FlashcardList } from '../../views/pages/FlashCardPage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FlashcardCardProps {
  item: FlashcardList;
  onCreateCard?: () => void; // callback mở modal tạo mới
  onDelete?: (id: string) => void; // callback xóa
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({ item, onCreateCard, onDelete }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleClick = () => {
    if ('isCreateCard' in item && item.isCreateCard) return; // tránh navigate khi là card tạo mới
    navigate(`/flash-cards/${item._id}`);
    localStorage.setItem('flashcardInfo', JSON.stringify(item));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // tránh trigger navigate
    setOpenConfirm(true);
  };

  const confirmDelete = () => {
    setOpenConfirm(false);
    if (onDelete) {
      onDelete(item._id);
    }
  };

  // Nếu là card tạo mới
  if ('isCreateCard' in item && item.isCreateCard) {
    return (
      <Paper
        sx={{
          p: 4,
          border: `2px dashed ${theme.palette.primary.light}`,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 180,
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': { bgcolor: 'primary.lighter', boxShadow: 4 },
        }}
        onClick={onCreateCard}
      >
        <AddCircleOutlineIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography sx={{ fontWeight: 600, fontSize: '1.125rem', color: 'primary.main' }}>
          Tạo list từ
        </Typography>
      </Paper>
    );
  }

  const data = item as FlashcardList;

  return (
    <>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 2,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 180,
          position: 'relative',
          transition: 'all 0.3s',
          '&:hover': { boxShadow: 6 },
          '&:hover .delete-btn': { opacity: 1 },
        }}
        onClick={handleClick}
      >
        {/* Icon Xóa (ẩn cho đến khi hover) */}
        <Tooltip title="Xóa danh sách" arrow placement="top">
          <IconButton
            className="delete-btn"
            size="small"
            onClick={handleDelete}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              opacity: 0,
              transition: 'opacity 0.2s ease',
              bgcolor: 'rgba(255,0,0,0.05)',
              '&:hover': { bgcolor: 'rgba(255,0,0,0.15)' },
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
            fontSize: '1rem',
            color: 'text.primary',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {data.title}
        </Typography>

        {/* Thông tin */}
        <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', fontSize: 14, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalOfferIcon sx={{ fontSize: 16 }} /> <span>{data.vocabularies_id.length || 0} từ</span>
          </Box>
        </Box>

        {/* Tags */}
        {data.tags && data.tags.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 1,
              overflow: 'hidden',
              mb: 1.5,
              alignItems: 'center',
              mt: 'auto',
            }}
          >
            {data.tags.slice(0, 2).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                  color: 'primary.main',
                  fontSize: 12,
                  height: 24,
                  borderRadius: '8px',
                  border: '1px solid rgba(25, 118, 210, 0.2)',
                  fontWeight: 500,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            ))}
            {data.tags.length > 2 && (
              <Tooltip title={data.tags.join(', ')} arrow placement="top">
                <Chip
                  label={`+${data.tags.length - 2}`}
                  size="small"
                  sx={{
                    color: '#ffffff',
                    bgcolor: 'primary.light',
                    fontSize: 12,
                    height: 24,
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white',
                    },
                  }}
                />
              </Tooltip>
            )}
          </Box>
        )}
      </Paper>

      {/* Modal xác nhận xóa */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} disableScrollLock>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa danh sách <strong>{data.title}</strong> không? Hành động này
            không thể hoàn tác.
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

export default FlashcardCard;
