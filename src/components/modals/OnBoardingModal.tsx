
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    IconButton,
    useMediaQuery,
    useTheme,
    Chip,
    Paper
} from '@mui/material';
import {
    Close,
    Headset,
    MenuBook,
    RocketLaunch,
    CheckCircleRounded,
    AutoAwesome,
    TrendingUp,
    EventNote,
    Bolt,
    Radar,
    Adjust,
    Psychology,
    InfoOutlined
} from '@mui/icons-material';
import {
    ResponsiveContainer,
    Radar as RechartsRadar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingModalProps {
    open: boolean;
    onClose: () => void;
    onNavigate?: () => void;
}

const sampleRadarData = [
    { subject: 'Part 1', A: 85 },
    { subject: 'Part 2', A: 70 },
    { subject: 'Part 3', A: 45 },
    { subject: 'Part 4', A: 55 },
    { subject: 'Part 5', A: 90 },
    { subject: 'Part 6', A: 80 },
    { subject: 'Part 7', A: 35 },
];

const StageVisual = ({ step }: { step: number }) => {
    const containerClass = "relative w-full max-w-[320px] h-[350px] flex items-center justify-center mx-auto";

    if (step === 0) {
        return (
            <div className={containerClass}>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="bg-white p-6 rounded-[16px] shadow-2xl border border-slate-100 w-full h-[340px] relative flex flex-col gap-4 overflow-hidden"
                >
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3 z-10">
                        <Typography className="text-[10px] font-black text-blue-500 tracking-widest">TOEIC ANALYZER</Typography>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex-grow space-y-6 relative z-10 pt-2">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-100">
                                        <Headset className="text-white" sx={{ fontSize: 14 }} />
                                    </div>
                                    <Typography className="text-[11px] font-black text-slate-700">LISTENING</Typography>
                                </div>
                                <Typography className="text-[10px] font-bold text-blue-500">PART 1-4</Typography>
                            </div>
                            <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
                                <div className="flex flex-col gap-1.5">
                                    <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                            className="w-1/2 h-full bg-blue-500/30"
                                        />
                                    </div>
                                    <div className="h-1.5 w-3/4 bg-blue-200/40 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-100">
                                        <MenuBook className="text-white" sx={{ fontSize: 14 }} />
                                    </div>
                                    <Typography className="text-[11px] font-black text-slate-700">READING</Typography>
                                </div>
                                <Typography className="text-[10px] font-bold text-indigo-500">PART 5-7</Typography>
                            </div>
                            <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50">
                                <div className="flex flex-col gap-1.5">
                                    <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                                            className="w-1/3 h-full bg-indigo-500/30"
                                        />
                                    </div>
                                    <div className="h-1.5 w-2/3 bg-indigo-200/40 rounded-full" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1.5 pt-2">
                            {[...Array(14)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                                    className={`h-4 rounded-md ${i < 8 ? 'bg-blue-500/20' : 'bg-indigo-500/20'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent z-20 shadow-[0_0_15px_blue]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-blue-50/10 to-white/0 pointer-events-none" />
                </motion.div>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className={containerClass}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="bg-white p-6 rounded-[16px] shadow-2xl border border-indigo-50 w-full h-[320px] flex flex-col justify-between"
                >
                    <div className="text-center space-y-2">
                        <Typography className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">Target Setting</Typography>
                        <Typography variant="h4" className="font-black text-indigo-600">850+</Typography>
                        <div className="w-12 h-1 bg-indigo-100 mx-auto rounded-full" />
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                            <div className="flex items-center gap-3">
                                <EventNote className="text-indigo-500" />
                                <Typography className="text-xs font-bold text-slate-600">Thời gian học</Typography>
                            </div>
                            <Typography className="text-xs font-black text-indigo-600">60p/Ngày</Typography>
                        </div>

                        <div className="flex gap-2">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
                                <div key={day} className={`flex-grow h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${i < 5 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-2xl flex items-center gap-3">
                        <TrendingUp className="text-indigo-600 text-sm" />
                        <Typography className="text-[10px] font-bold text-indigo-700">Lộ trình 12 tuần được tối ưu hóa</Typography>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={containerClass}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full"
            >
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -inset-10 bg-gradient-to-tr from-fuchsia-500 to-blue-500 blur-[80px] rounded-full"
                />

                <Paper className="relative bg-white/90 backdrop-blur-2xl p-5 rounded-[16px] shadow-2xl border border-white/60 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="bg-slate-900 p-1.5 rounded-lg">
                                <Bolt className="text-white text-[10px]" />
                            </div>
                            <Typography variant="caption" className="font-black text-slate-900 tracking-tighter uppercase text-[9px]">Phân tích mẫu</Typography>
                        </div>
                        <Chip
                            label="KẾT QUẢ MINH HỌA"
                            variant="outlined"
                            size="small"
                            sx={{
                                height: 18,
                                fontSize: '7px',
                                fontWeight: 900,
                                color: '#6366f1',
                                borderColor: '#6366f1',
                                backgroundColor: 'rgba(99, 102, 241, 0.05)'
                            }}
                        />
                    </div>

                    <div className="h-40 w-full mb-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={sampleRadarData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 800 }} />
                                <RechartsRadar
                                    name="Score"
                                    dataKey="A"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.4}
                                    animationDuration={1500}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-[12px] relative mb-3">
                        <div className="flex items-center gap-2 mb-1.5">
                            <AutoAwesome className="text-blue-400 text-[10px]" />
                            <Typography className="text-blue-400 font-black tracking-widest uppercase text-[7px]">AI Roadmap Engine</Typography>
                        </div>
                        <Typography className="text-slate-300 text-[9px] leading-relaxed font-bold">
                            "Lộ trình sẽ tự động bù đắp kỹ năng thiếu hụt (ví dụ Part 7) để tối ưu hóa điểm số nhanh nhất."
                        </Typography>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-grow bg-blue-50/50 p-2 rounded-xl border border-blue-100 flex flex-col items-center">
                            <Typography className="text-[7px] text-blue-400 font-black uppercase">Đầu vào</Typography>
                            <Typography className="font-black text-blue-700 text-sm leading-none">425</Typography>
                        </div>
                        <div className="flex-grow bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 flex flex-col items-center">
                            <Typography className="text-[7px] text-indigo-400 font-black uppercase">Mục tiêu</Typography>
                            <Typography className="font-black text-indigo-700 text-sm leading-none">850</Typography>
                        </div>
                    </div>
                </Paper>
            </motion.div>
        </div>
    );
};

const steps = [
    {
        title: "Đánh giá Năng lực Toàn diện",
        subtitle: "Bài thi mô phỏng chuẩn khung năng lực IIG",
        description: "Thực hiện bài kiểm tra đầu vào đầy đủ 200 câu hỏi để xác lập trình độ thực tế. Hệ thống sẽ phân tích chi tiết kỹ năng Nghe & Đọc để xác định các lỗ hổng kiến thức cốt lỗi.",
        accent: "#3b82f6",
        icon: <Radar sx={{ fontSize: 14 }} />,
        bullets: [
            "Phân tích chuyên sâu 7 phần kỹ năng bài thi",
            "Định vị các chủ điểm ngữ pháp trọng tâm",
            "Đánh giá tốc độ và thói quen xử lý câu hỏi"
        ]
    },
    {
        title: "Thiết lập Mục tiêu Cá nhân",
        subtitle: "Tối ưu hóa dựa trên quỹ thời gian thực tế",
        description: "Cung cấp thông tin về điểm số kỳ vọng và thời gian ôn luyện mỗi ngày. Hệ thống sẽ tính toán khối lượng kiến thức một cách khoa học, đảm bảo lộ trình đạt tính khả thi cao nhất.",
        accent: "#6366f1",
        icon: <Adjust sx={{ fontSize: 14 }} />,
        bullets: [
            "Xác lập lộ trình theo mục tiêu điểm số riêng biệt",
            "Linh hoạt sắp xếp thời gian biểu học tập cá nhân",
            "Cân bằng trọng tâm giữa kỹ năng Listening và Reading"
        ]
    },
    {
        title: "Khởi tạo Lộ trình Chuyên sâu",
        subtitle: "Chiến lược học tập thông minh dựa trên dữ liệu",
        description: "AI sẽ tự động thiết kế một hành trình học tập dành riêng cho bạn. Tập trung tối đa vào việc khắc phục điểm yếu và củng cố các mảng kiến thức tiềm năng để bứt phá điểm số.",
        accent: "#d946ef",
        icon: <Psychology sx={{ fontSize: 14 }} />,
        bullets: [
            "Ưu tiên cải thiện các phần kỹ năng còn hạn chế",
            "Dự báo điểm số thực tế dựa trên tiến độ học tập",
            "Tự động điều chỉnh lộ trình theo kết quả định kỳ"
        ]
    }
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onClose, onNavigate }) => {
    const [activeStep, setActiveStep] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleNext = () => {
        if (activeStep < steps.length - 1) setActiveStep(prev => prev + 1);
        else {
            onClose();
            if (typeof onNavigate === 'function') onNavigate();
        }
    };

    const handleBack = () => {
        if (activeStep > 0) setActiveStep(prev => prev - 1);
    };

    useEffect(() => {
        if (open) setActiveStep(0);
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile}
            maxWidth={false}
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : '16px',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    boxShadow: `
                        0 0 0 1px rgba(0, 0, 0, 0.05),
                        0 20px 50px -12px rgba(0, 0, 0, 0.15)
                    `,
                    width: isMobile ? '100%' : '1000px',
                    maxWidth: '100vw',
                    margin: isMobile ? 0 : '32px',
                    height: isMobile ? '100%' : 'auto',
                    maxHeight: isMobile ? '100%' : 'calc(100% - 64px)',
                }
            }}
            sx={{
                '& .MuiDialog-container': {
                    alignItems: 'center',
                    justifyContent: 'center',
                }
            }}
        >
            <DialogContent className="p-0 no-scrollbar h-full">
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'white',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        position: 'relative',
                    }}
                >
                    {/* Top Progress Line */}
                    <div className="absolute top-0 left-0 w-full z-40 h-1 flex gap-1 px-4 pt-2">
                        {steps.map((_, i) => (
                            <div key={i} className="flex-grow h-1 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: i <= activeStep ? '100%' : '0%' }}
                                    className="h-full"
                                    style={{ backgroundColor: steps[activeStep].accent }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Left Visual Area */}
                    <Box
                        className={`w-full md:w-[42%] flex flex-col items-center justify-center relative overflow-hidden bg-slate-50/80 ${isMobile ? 'py-12 shrink-0' : 'p-12'}`}
                        sx={{ height: isMobile ? '300px' : 'auto' }}
                    >
                        <motion.div
                            animate={{
                                opacity: [0.1, 0.15, 0.1],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="absolute w-[150%] h-[150%] rounded-full blur-[100px]"
                            style={{ background: `radial-gradient(circle, ${steps[activeStep].accent}30 0%, transparent 70%)` }}
                        />

                        <div className="z-10 w-full relative h-full flex items-center justify-center scale-90 md:scale-100">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <StageVisual step={activeStep} />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </Box>

                    {/* Right Content Area */}
                    <Box className={`w-full md:w-[58%] flex flex-col bg-white relative overflow-hidden h-full`}>
                        {/* Fixed Header */}
                        <div className="flex items-center justify-between p-6 md:p-10 pb-4 w-full shrink-0">
                            <motion.div
                                key={`badge-${activeStep}`}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="relative inline-flex items-center p-[1px] rounded-lg overflow-hidden group shadow-sm"
                                style={{ backgroundColor: `${steps[activeStep].accent}20` }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-[-100%] z-0"
                                    style={{ background: `conic-gradient(from 0deg, transparent, ${steps[activeStep].accent}, transparent 40%)` }}
                                />

                                <div className="relative z-10 flex items-center gap-2 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-[7px]">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="flex items-center justify-center"
                                        style={{ color: steps[activeStep].accent }}
                                    >
                                        {steps[activeStep].icon}
                                    </motion.div>
                                    <div className="w-[1px] h-3 bg-slate-200" />
                                    <Typography className="font-black text-[9px] tracking-[0.1em] uppercase" style={{ color: steps[activeStep].accent }}>
                                        Master AI <span className="text-slate-400 mx-1">•</span> BƯỚC 0{activeStep + 1}
                                    </Typography>
                                </div>
                            </motion.div>

                            <IconButton
                                onClick={onClose}
                                className="bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100"
                                size="small"
                                sx={{ width: 32, height: 32 }}
                            >
                                <Close fontSize="small" className="text-slate-400" />
                            </IconButton>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-grow px-6 md:px-10 pb-4">
                            <div className="flex flex-col w-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`content-${activeStep}`}
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4 w-full"
                                    >
                                        <Typography variant={isMobile ? "h5" : "h4"} className="font-black text-slate-900 tracking-tight leading-tight">
                                            {steps[activeStep].title}
                                        </Typography>
                                        <Typography variant="body2" className="text-slate-400 font-bold leading-tight flex items-center gap-2">
                                            <Bolt sx={{ fontSize: 14, color: steps[activeStep].accent }} />
                                            {steps[activeStep].subtitle}
                                        </Typography>
                                        <Typography className="text-slate-500 text-sm leading-relaxed font-medium">
                                            {steps[activeStep].description}
                                        </Typography>

                                        <div className="pt-2 grid grid-cols-1 gap-2">
                                            {steps[activeStep].bullets.map((bullet, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ x: -10, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.1 + (i * 0.05) }}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors group"
                                                >
                                                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 transition-colors shrink-0">
                                                        <CheckCircleRounded className="text-emerald-500 transition-colors" sx={{ fontSize: 12 }} />
                                                    </div>
                                                    <Typography className="text-slate-700 font-bold text-xs">{bullet}</Typography>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <Box className="p-6 md:p-10 pt-4 w-full bg-white border-t border-slate-50 shrink-0">
                            <div className="flex gap-3 items-center">
                                {activeStep > 0 && (
                                    <Button
                                        onClick={handleBack}
                                        className="text-slate-400 font-bold hover:text-slate-800 transition-colors px-4 h-12"
                                    >
                                        Quay lại
                                    </Button>
                                )}

                                <motion.div className="flex-grow" whileTap={{ scale: 0.98 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleNext}
                                        className="h-12 text-sm font-black shadow-lg transition-all"
                                        style={{
                                            backgroundColor: steps[activeStep].accent,
                                            boxShadow: `0 8px 20px -5px ${steps[activeStep].accent}30`,
                                            borderRadius: '8px'
                                        }}
                                        endIcon={activeStep === steps.length - 1 ? <RocketLaunch sx={{ fontSize: 18 }} /> : null}
                                    >
                                        {activeStep === steps.length - 1 ? "Bắt đầu ngay" : "Tôi đã hiểu, tiếp tục"}
                                    </Button>
                                </motion.div>
                            </div>

                            <div className="mt-4 flex justify-center gap-1.5">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-500 ${i === activeStep ? 'w-4' : 'w-1'}`}
                                        style={{ backgroundColor: i <= activeStep ? steps[activeStep].accent : '#f1f5f9' }}
                                    />
                                ))}
                            </div>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default OnboardingModal;
