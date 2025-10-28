import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Button,
    Divider,
    Avatar,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Chip,
    Stack,
    Link,
} from "@mui/material";
import {
    Close as CloseIcon,
    CloudUploadOutlined,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { uploadDocumentToCloudinary } from "../../services/cloudinary.service";
import { requestCollaboratorService } from "../../services/request_collaborator.service";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";
import { uploadFileToFirebase } from "../../hooks/useFirebaseAuth";
import { uploadFileToServer } from "../../services/uploadFile.service";

// ---------- Constants ----------
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT_MIMES = new Set(["application/pdf"]);
const ACCEPT_EXTS = new Set([".pdf"]);
const EXPERTISE_OPTIONS = [
    "Ngữ pháp",
    "Listening",
    "Reading",
    "Writing",
    "Speaking",
    "Vocabulary",
];

function getFileExt(name: string) {
    const dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}
function validateFile(file: File) {
    const okMime = ACCEPT_MIMES.has(file.type);
    const okExt = ACCEPT_EXTS.has(getFileExt(file.name));
    const okSize = file.size <= MAX_SIZE;
    return okSize && (okMime || okExt);
}

function RegisterCollaboratorModal({
    open,
    onClose,
    requestData,
}: {
    open: boolean;
    onClose: () => void;
    requestData?: any;
}) {
    const [form, setForm] = useState({
        experience: "",
        motivation: "",
        availabilityType: "",
        expertise: [] as string[],
    });
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{
        experience?: string;
        motivation?: string;
        availabilityType?: string;
        expertise?: string;
        cv?: string;
    }>({});
    const user = useSelector((state: RootState) => state.user.user);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const isStudent = user?.role_name === "student";
    const isDenied = user?.role_name === "collaborator" || user?.role_name === "admin";

    // ✅ Khi có requestData, tự fill vào form để hiển thị lại
    useEffect(() => {
        if (requestData) {
            setForm({
                experience: requestData.experience || "",
                motivation: requestData.motivation || "",
                availabilityType: requestData.availability || "",
                expertise: requestData.expertise || [],
            });
        }
    }, [requestData]);

    // ======================
    // File Handling
    // ======================
    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!validateFile(file)) {
            setFieldErrors((s) => ({
                ...s,
                cv: "Chỉ chấp nhận PDF (≤ 5MB).",
            }));
            setCvFile(null);
            return;
        }
        setFieldErrors((s) => ({ ...s, cv: undefined }));
        setCvFile(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const toggleExpertise = (skill: string) => {
        setForm((prev) => ({
            ...prev,
            expertise: prev.expertise.includes(skill)
                ? prev.expertise.filter((s) => s !== skill)
                : [...prev.expertise, skill],
        }));
    };

    const validateAll = () => {
        const errs: typeof fieldErrors = {};
        if (!form.experience) errs.experience = "Vui lòng chọn kinh nghiệm.";
        if (!form.motivation.trim()) errs.motivation = "Vui lòng nhập lý do đăng ký.";
        if (!form.availabilityType)
            errs.availabilityType = "Vui lòng chọn thời gian có sẵn.";
        if (!form.expertise.length)
            errs.expertise = "Vui lòng chọn ít nhất một chuyên môn.";
        if (!cvFile) errs.cv = "Vui lòng đính kèm CV PDF (≤ 5MB).";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!validateAll()) return;
        setLoading(true);

        try {
            let cvUrl = "";
            if (cvFile) {
                const url = await uploadDocumentToCloudinary(cvFile);
                cvUrl = url.url;
            }

            const payload = {
                fullName: user?.profile?.fullname || "Người dùng",
                email: user?.email,
                experience: form.experience,
                expertise: form.expertise,
                motivation: form.motivation,
                availability: form.availabilityType,
                cv_url: cvUrl,
                user_id: user?._id,
            };

            await requestCollaboratorService.submitRequestCollaborator(payload);
            setSubmitted(true);
        } catch (err) {
            console.error("❌ Lỗi upload hoặc gửi form:", err);
            alert("Đã xảy ra lỗi khi gửi thông tin, vui lòng thử lại!");
        } finally {
            setLoading(false);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
            }, 2800);
        }
    };

    // ======================
    // Render UI
    // ======================
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: "92vw",
                    height: "88vh",
                    maxWidth: "92vw",
                    borderRadius: 3,
                },
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", pr: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                    {requestData
                        ? "Xem lại biểu mẫu đăng ký cộng tác viên"
                        : "Đăng ký trở thành Cộng tác viên"}
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, overflow: "hidden" }}>
                <Box
                    sx={{
                        px: { xs: 2, md: 3 },
                        pb: 2,
                        height: "calc(88vh - 64px)",
                        overflowY: "auto",
                    }}
                >
                    {/* ---------------------- XEM LẠI BIỂU MẪU ---------------------- */}
                    {requestData ? (
                        <Card elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
                            <Box className="flex items-center gap-3 mb-3">
                                <Avatar
                                    src={user?.profile?.avatar || ""}
                                    sx={{ width: 60, height: 60 }}
                                />
                                <Box>
                                    <Typography fontWeight={600}>
                                        {requestData.fullName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {requestData.email}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" fontWeight={600}>
                                Kinh nghiệm giảng dạy:
                            </Typography>
                            <Typography mb={2}>{requestData.experience} năm</Typography>

                            <Typography variant="subtitle2" fontWeight={600}>
                                Chuyên môn:
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
                                {requestData.expertise.map((skill: string) => (
                                    <Chip key={skill} label={skill} color="primary" />
                                ))}
                            </Stack>

                            <Typography variant="subtitle2" fontWeight={600}>
                                Lý do muốn trở thành cộng tác viên:
                            </Typography>
                            <Typography mb={2} color="text.secondary">
                                {requestData.motivation}
                            </Typography>

                            <Typography variant="subtitle2" fontWeight={600}>
                                Thời gian có sẵn:
                            </Typography>
                            <Typography mb={2}>{requestData.availability}</Typography>

                            <Typography variant="subtitle2" fontWeight={600}>
                                CV đính kèm:
                            </Typography>
                            <Link
                                href={requestData.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                color="primary"
                            >
                                Xem CV PDF
                            </Link>

                            <Alert
                                severity={
                                    requestData.status === "approved"
                                        ? "success"
                                        : requestData.status === "rejected"
                                        ? "error"
                                        : "info"
                                }
                                sx={{ mt: 3, borderRadius: 2 }}
                            >
                                Trạng thái hiện tại:{" "}
                                <b style={{ textTransform: "capitalize" }}>
                                    {requestData.status}
                                </b>
                            </Alert>
                        </Card>
                    ) : submitted ? (
                        /* ---------------------- SAU KHI GỬI ---------------------- */
                        <Box
                            sx={{
                                py: 8,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                textAlign: "center",
                            }}
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1.2 }}
                            >
                                <CheckCircleIcon sx={{ fontSize: 72, color: "success.main" }} />
                            </motion.div>
                            <Typography variant="h6" fontWeight={700}>
                                Biểu mẫu đã được gửi!
                            </Typography>
                            <Typography color="text.secondary">
                                Quản trị viên sẽ phản hồi qua email trong vòng 3–5 ngày làm việc.
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Cửa sổ sẽ tự động đóng sau 2.8 giây.
                            </Typography>
                        </Box>
                    ) : (
                        /* ---------------------- FORM MỚI ---------------------- */
                        <Card elevation={0} sx={{ p: { xs: 2, md: 3 } }}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                textAlign="center"
                                mb={2}
                            >
                                Vui lòng kiểm tra thông tin cá nhân và đính kèm CV PDF (≤ 5MB).
                            </Typography>

                            <CardContent sx={{ p: 0 }}>
                                <motion.form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-4"
                                >
                                    <Box className="flex items-center gap-3">
                                        <Avatar
                                            src={user?.profile?.avatar || ""}
                                            sx={{ width: 60, height: 60 }}
                                        />
                                        <Box>
                                            <Typography fontWeight={600}>
                                                {user?.profile?.fullname || "Người dùng"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {user?.email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 1.5 }} />

                                    {/* Kinh nghiệm */}
                                    <TextField
                                        select
                                        label="Kinh nghiệm giảng dạy"
                                        value={form.experience}
                                        onChange={(e) =>
                                            setForm({ ...form, experience: e.target.value })
                                        }
                                        error={!!fieldErrors.experience}
                                        helperText={fieldErrors.experience}
                                    >
                                        <MenuItem value="none">Chưa có</MenuItem>
                                        <MenuItem value="1-2">1–2 năm</MenuItem>
                                        <MenuItem value="3+">Trên 3 năm</MenuItem>
                                    </TextField>

                                    {/* Chuyên môn */}
                                    <Box>
                                        <Typography fontWeight={600} mb={1}>
                                            Chuyên môn <span style={{ color: "red" }}>*</span>
                                        </Typography>
                                        <Stack direction="row" flexWrap="wrap" gap={1}>
                                            {EXPERTISE_OPTIONS.map((skill) => (
                                                <Chip
                                                    key={skill}
                                                    label={skill}
                                                    clickable
                                                    color={
                                                        form.expertise.includes(skill)
                                                            ? "primary"
                                                            : "default"
                                                    }
                                                    onClick={() => toggleExpertise(skill)}
                                                />
                                            ))}
                                        </Stack>
                                        {fieldErrors.expertise && (
                                            <Typography variant="caption" color="error">
                                                {fieldErrors.expertise}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Lý do */}
                                    <TextField
                                        label="Lý do muốn trở thành cộng tác viên"
                                        multiline
                                        rows={3}
                                        value={form.motivation}
                                        onChange={(e) =>
                                            setForm({ ...form, motivation: e.target.value })
                                        }
                                        error={!!fieldErrors.motivation}
                                        helperText={fieldErrors.motivation}
                                    />

                                    {/* Thời gian */}
                                    <TextField
                                        select
                                        label="Thời gian có sẵn"
                                        value={form.availabilityType}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                availabilityType: e.target.value,
                                            })
                                        }
                                        error={!!fieldErrors.availabilityType}
                                        helperText={fieldErrors.availabilityType}
                                    >
                                        <MenuItem value="part-time">
                                            Bán thời gian (&lt;20h/tuần)
                                        </MenuItem>
                                        <MenuItem value="full-time">
                                            Toàn thời gian (&gt;20h/tuần)
                                        </MenuItem>
                                        <MenuItem value="flexible">Linh hoạt</MenuItem>
                                    </TextField>

                                    {/* Upload CV */}
                                    <Box
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        onDrop={onDrop}
                                        sx={{
                                            border: "2px dashed",
                                            borderColor: isDragOver ? "primary.main" : "divider",
                                            borderRadius: 2,
                                            p: 3,
                                            textAlign: "center",
                                            cursor: "pointer",
                                            bgcolor: isDragOver ? "action.hover" : "transparent",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            style={{ display: "none" }}
                                            onChange={(e) => handleFiles(e.target.files)}
                                        />
                                        <CloudUploadOutlined />
                                        <Typography variant="subtitle2" mt={1}>
                                            Kéo thả CV (PDF) vào đây hoặc bấm để chọn{" "}
                                            <Typography component="span" color="error">
                                                *
                                            </Typography>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Chỉ chấp nhận: PDF (≤ 5MB)
                                        </Typography>
                                        {fieldErrors.cv && (
                                            <Typography
                                                variant="caption"
                                                color="error"
                                                display="block"
                                            >
                                                {fieldErrors.cv}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* CV Info */}
                                    {cvFile && (
                                        <Box className="flex items-center gap-2">
                                            <Chip
                                                label={cvFile.name}
                                                onDelete={() => setCvFile(null)}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {(cvFile.size / 1024).toFixed(0)} KB
                                            </Typography>
                                        </Box>
                                    )}

                                    {error && <Alert severity="error">{error}</Alert>}

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading || !isStudent}
                                        sx={{
                                            borderRadius: 3,
                                            py: 1.3,
                                            background:
                                                "linear-gradient(to right, #2563eb, #06b6d4)",
                                        }}
                                    >
                                        {loading ? (
                                            <CircularProgress size={22} color="inherit" />
                                        ) : (
                                            "Gửi yêu cầu"
                                        )}
                                    </Button>
                                </motion.form>
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default RegisterCollaboratorModal;
