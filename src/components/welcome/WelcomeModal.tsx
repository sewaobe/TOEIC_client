import {
    Dialog,
    DialogContent,
    Box,
    Stack,
    Typography,
    IconButton,
    LinearProgress,
    Button,
} from "@mui/material";
import { ButtonCard } from "./ButtonCard";
import {
    AutoAwesome,
    School,
    Close,
    RocketLaunch,
    ArrowBack,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface WelcomeModalProps {
    open: boolean;
    onClose: () => void;
}

export const WelcomeModal = ({ open, onClose }: WelcomeModalProps) => {
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState<"free" | "ai" | null>(null);

    const handleNext = (selectedMode: "free" | "ai") => {
        setMode(selectedMode);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: { xs: "90vw" },
                    height: { xs: "85vh" },
                    maxWidth: 1000,
                    maxHeight: 700,
                    borderRadius: 4,
                    background: "linear-gradient(180deg, #E8F0FF 0%, #FFFFFF 100%)",
                    boxShadow:
                        "0px 4px 12px rgba(0, 0, 0, 0.1), 0px -2px 8px rgba(0, 0, 0, 0.05)",
                    overflow: "hidden",
                },
            }}
        >
            <DialogContent
                sx={{
                    p: { xs: 3, md: 6 },
                    height: "100%",
                    overflowY: "auto",
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    scrollBehavior: "smooth",
                }}
            >
                {/* Nút đóng */}
                <Box display="flex" justifyContent="flex-end">
                    <IconButton onClick={onClose} color="primary">
                        <Close />
                    </IconButton>
                </Box>

                {/* Thanh tiến trình */}
                <LinearProgress
                    variant="determinate"
                    value={(step - 1) * 50}
                    sx={{ mb: 3, height: 10, borderRadius: 4 }}
                />

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Stack spacing={3} alignItems="center">
                                <Stack spacing={1} alignItems="center" textAlign="center">
                                    <RocketLaunch
                                        sx={{
                                            fontSize: 50,
                                            color: "#7F00FF",
                                            mb: 1,
                                            animation: "pulse 1.5s infinite ease-in-out",
                                        }}
                                    />
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontWeight: 600,
                                            fontSize: { xs: "1rem", md: "1.25rem" },
                                            color: "#1E1B4B",
                                        }}
                                    >
                                        Chào mừng bạn đến với
                                    </Typography>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontWeight: 800,
                                            fontSize: { xs: "1.9rem", md: "2.4rem" },
                                            background:
                                                "linear-gradient(90deg, #4C8BF5 0%, #78D8FF 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        TOEIC Smart
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontWeight: 400,
                                            fontSize: { xs: "0.95rem", md: "1.05rem" },
                                            color: "#3B3B58",
                                            lineHeight: 1.7,
                                            maxWidth: 620,
                                        }}
                                    >
                                        Người bạn đồng hành giúp bạn chinh phục TOEIC{" "}
                                        <b>theo cách của riêng mình.</b> <br />
                                        Hãy chọn phong cách học phù hợp để bắt đầu hành trình nhé.
                                    </Typography>
                                </Stack>

                                <Stack
                                    spacing={2}
                                    sx={{
                                        width: { xs: "95%", md: "40%" },
                                    }}
                                >
                                    <ButtonCard
                                        icon={<AutoAwesome sx={{ color: "#9F7AEA" }} />}
                                        text="Tự do khám phá"
                                        onClick={() => handleNext("free")}
                                    />
                                    <ButtonCard
                                        icon={<School sx={{ color: "#805AD5" }} />}
                                        text="Lộ trình thông minh"
                                        onClick={() => handleNext("ai")}
                                    />
                                </Stack>
                            </Stack>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Stack spacing={4} alignItems="center" textAlign="center">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    {/* Nút quay lại */}
                                    <Box>
                                        <IconButton onClick={handleBack}>
                                            <ArrowBack />
                                        </IconButton>
                                    </Box>

                                    {/* Tiêu đề */}
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#1E1B4B",
                                            fontFamily: "'Poppins', sans-serif",
                                        }}
                                    >
                                        {mode === "free"
                                            ? "Hướng dẫn luyện tập tự do"
                                            : "Hướng dẫn lộ trình thông minh"}
                                    </Typography>
                                </Stack>

                                {/* Danh sách hướng dẫn */}
                                <Stack
                                    spacing={2}
                                    sx={{
                                        width: { xs: "95%", md: "60%" },
                                        mt: 2,
                                    }}
                                >
                                    {mode === "free" ? (
                                        <>
                                            <ButtonCard
                                                icon={<AutoAwesome sx={{ color: "#805AD5" }} />}
                                                text="Luyện đề thi tại mục Đề thi Online"
                                            />
                                            <ButtonCard
                                                icon={<School sx={{ color: "#9F7AEA" }} />}
                                                text="Học từ vựng qua Flashcard thông minh"
                                            />
                                            <ButtonCard
                                                icon={<RocketLaunch sx={{ color: "#4C51BF" }} />}
                                                text="Rèn kỹ năng Listening & Reading"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <ButtonCard
                                                icon={<AutoAwesome sx={{ color: "#7F00FF" }} />}
                                                text="Bước 1: Làm bài kiểm tra đầu vào để đánh giá năng lực"
                                            />
                                            <ButtonCard
                                                icon={<School sx={{ color: "#805AD5" }} />}
                                                text="Bước 2: Chọn điểm mục tiêu và thời gian học"
                                            />
                                            <ButtonCard
                                                icon={<RocketLaunch sx={{ color: "#4C51BF" }} />}
                                                text="Bước 3: AI sẽ phân tích và tạo lộ trình cá nhân hóa"
                                            />
                                        </>
                                    )}
                                </Stack>

                                {/* CTA cuối */}
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        setStep(3);
                                        setTimeout(() => {
                                            onClose();
                                        }, 300);
                                    }}
                                    sx={{
                                        mt: 3,
                                        background: "linear-gradient(90deg, #4C8BF5 0%, #78D8FF 100%)",
                                        color: "#fff",
                                        px: 5,
                                        py: 1.5,
                                        borderRadius: 3,
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                        "&:hover": { opacity: 0.9 },
                                    }}
                                >
                                    Bắt đầu ngay
                                </Button>
                            </Stack>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};
