import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface Props {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

const ClaimResultModal = ({ open, onConfirm, onCancel, loading }: Props) => {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>Lưu kết quả bài làm</DialogTitle>
            <DialogContent>
                <Typography>
                    Chúng tôi tìm thấy kết quả bài thi bạn vừa thực hiện trước khi đăng nhập.
                    Bạn có muốn lưu kết quả này vào tài khoản cá nhân không?
                </Typography>
            </DialogContent>
            <DialogActions sx={{ pb: 2, px: 3 }}>
                <Button onClick={onCancel} color="inherit" disabled={loading}>
                    Để sau/Xóa
                </Button>
                <Button onClick={onConfirm} variant="contained" color="primary" autoFocus disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu vào tài khoản"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClaimResultModal;