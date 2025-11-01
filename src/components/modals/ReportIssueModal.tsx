import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import ImageIcon from "@mui/icons-material/Image";
import HistoryIcon from "@mui/icons-material/History";
import { uploadToCloudinary } from "../../services/cloudinary.service";
import { reportService } from "../../services/report.service";
import { ReportItem, ReportStatus, ReportType } from "../../types/Report";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../stores/store";
import { showSnackbar } from "../../stores/snackbarSlice";

interface ReportIssueModalProps {
  open: boolean;
  onClose: () => void;
}

const reportTypeOptions: { value: ReportType; label: string }[] = [
  { value: "system", label: "Lỗi hệ thống" },
  { value: "lesson", label: "Lỗi bài học" },
  { value: "flashcard", label: "Lỗi flashcard" },
  { value: "chatbot", label: "Lỗi chatbot" },
  { value: "other", label: "Khác" },
];

const statusLabelMap: Record<ReportStatus, string> = {
  pending: "Chờ xử lý",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  rejected: "Từ chối",
};

const statusColorMap: Record<
  ReportStatus,
  "default" | "success" | "warning" | "error" | "info"
> = {
  pending: "warning",
  in_progress: "info",
  resolved: "success",
  rejected: "error",
};

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const ReportIssueModal: FC<ReportIssueModalProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportType, setReportType] = useState<ReportType>("system");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setActiveTab(0);
    void loadReports();
  }, [open]);

  useEffect(
    () => () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    },
    [imagePreview]
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setReportType("system");
    setImageUrl(undefined);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  const loadReports = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await reportService.getMyReports({ page: 1, limit: 6 });
      setReports(data.items);
    } catch (error) {
      console.error("loadReports error", error);
      dispatch(
        showSnackbar({
          message: "Không thể tải lịch sử báo lỗi",
          severity: "error",
        })
      );
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      dispatch(
        showSnackbar({
          message: "Ảnh vượt quá 5MB",
          severity: "warning",
        })
      );
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setIsUploading(true);

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setImageUrl(uploadedUrl);
      dispatch(
        showSnackbar({
          message: "Upload ảnh thành công",
          severity: "success",
        })
      );
    } catch (error) {
      console.error("upload error", error);
      setImagePreview(null);
      dispatch(
        showSnackbar({
          message: "Upload thất bại, thử lại sau",
          severity: "error",
        })
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isSubmitDisabled = useMemo(
    () =>
      !title.trim() ||
      !description.trim() ||
      !reportType ||
      isSubmitting ||
      isUploading,
    [title, description, reportType, isSubmitting, isUploading]
  );

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.createReport({
        type: reportType,
        title: title.trim(),
        description: description.trim(),
        imageUrl,
      });
      dispatch(
        showSnackbar({
          message: "Đã gửi báo lỗi",
          severity: "success",
        })
      );
      resetForm();
      await loadReports();
      setActiveTab(1);
    } catch (error) {
      console.error("submit report error", error);
      dispatch(
        showSnackbar({
          message: "Không thể gửi báo lỗi",
          severity: "error",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isUploading) {
      return;
    }
    resetForm();
    onClose();
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ReportProblemIcon color="error" />
        Báo lỗi ứng dụng
        <IconButton
          onClick={handleClose}
          sx={{ ml: "auto" }}
          disabled={isSubmitting || isUploading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ mb: 2 }}
        >
          <Tab
            icon={<ReportProblemIcon fontSize="small" />}
            iconPosition="start"
            label="Gửi báo lỗi"
          />
          <Tab
            icon={<HistoryIcon fontSize="small" />}
            iconPosition="start"
            label="Lịch sử"
          />
        </Tabs>

        {activeTab === 0 && (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Loại báo lỗi"
                value={reportType}
                onChange={(event) =>
                  setReportType(event.target.value as ReportType)
                }
              >
                {reportTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Tiêu đề"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Không phát audio phần nghe"
              />
            </Stack>

            <TextField
              multiline
              minRows={4}
              label="Mô tả chi tiết"
              placeholder="Mô tả vấn đề, bước tái hiện, thiết bị sử dụng..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Ảnh minh họa (tùy chọn)
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Đang upload" : "Chọn ảnh"}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleUpload}
                />
                {imagePreview && (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Ảnh báo lỗi"
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: 2,
                      objectFit: "cover",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                )}
                {isUploading && <CircularProgress size={24} />}
              </Stack>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={resetForm}
                disabled={isSubmitting || isUploading}
              >
                Xóa nội dung
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Gửi báo lỗi"
                )}
              </Button>
            </Stack>
          </Stack>
        )}

        {activeTab === 1 && (
          <Box>
            {isLoadingHistory ? (
              <Stack alignItems="center" py={6}>
                <CircularProgress />
              </Stack>
            ) : reports.length === 0 ? (
              <Stack alignItems="center" py={6} spacing={1}>
                <Typography color="text.secondary">
                  Bạn chưa gửi báo lỗi nào
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={2}>
                {reports.map((report) => (
                  <Box
                    key={report.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Stack flex={1} spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1" fontWeight={600}>
                            {report.title}
                          </Typography>
                          <Chip
                            label={statusLabelMap[report.status]}
                            color={statusColorMap[report.status]}
                            size="small"
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {reportTypeOptions.find(
                            (item) => item.value === report.type
                          )?.label ?? report.type}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ whiteSpace: "pre-line" }}
                        >
                          {report.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Gửi lúc: {formatDate(report.createdAt)}
                        </Typography>
                        {report.adminNote && (
                          <Typography variant="caption" color="text.secondary">
                            Phản hồi: {report.adminNote}
                          </Typography>
                        )}
                      </Stack>
                      {report.imageUrl && (
                        <Box
                          component="img"
                          src={report.imageUrl}
                          alt={report.title}
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: 2,
                            objectFit: "cover",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      )}
                    </Stack>
                    <Divider sx={{ mt: 2, mb: 1 }} />
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Cập nhật: {formatDate(report.updatedAt)}
                      </Typography>
                      {report.handler?.fullname && (
                        <Typography variant="caption" color="text.secondary">
                          Người xử lý: {report.handler.fullname}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportIssueModal;
