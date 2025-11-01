import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Fade,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TranslateIcon from "@mui/icons-material/Translate";
import { motion } from "framer-motion";
import { translationService } from "../../services/translation.service";

interface TranslateViewProps {
    onBack: () => void;
    onSwitchToLookup: () => void;
}

export default function TranslationView({ onBack, onSwitchToLookup }: TranslateViewProps) {
    const [sourceLang, setSourceLang] = useState("en");
    const [targetLang, setTargetLang] = useState("vi");
    const [textToTranslate, setTextToTranslate] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationResult, setTranslationResult] = useState<{
        originalText: string;
        translatedText: string;
        translationNotes?: string;
    } | null>(null);

    const handleTranslate = async () => {
        const txt = textToTranslate.trim();
        if (!txt) return;
        setIsTranslating(true);
        setTranslationResult(null);
        try {
            const res = await translationService.translateText(sourceLang, targetLang, txt);
            setTranslationResult(res);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleTranslate();
    };

    return (
        <motion.div
            key="translate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
        >
            {/* --- Header --- */}
            <Box className="flex items-center justify-between mb-2">
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    Dịch đoạn văn
                </Typography>
                <Box className="flex gap-1">
                    <Button
                        size="small"
                        onClick={onSwitchToLookup}
                        startIcon={<SearchIcon fontSize="small" />}
                        className="!text-slate-500 !text-xs hover:!text-slate-700"
                    >
                        Tra từ
                    </Button>
                    <Button
                        size="small"
                        onClick={onBack}
                        className="!text-slate-500 !text-xs hover:!text-slate-700"
                    >
                        ← Quay lại
                    </Button>
                </Box>
            </Box>

            {/* --- Language Selectors --- */}
            <TextField
                select
                label="Từ"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                size="small"
                sx={{ minWidth: 110 }}
                SelectProps={{
                    MenuProps: {
                        disablePortal: true,  // ✅ hiển thị đúng vị trí, không bị trôi
                        sx: {
                            "&& .MuiPaper-root": {
                                zIndex: 20000, // vẫn nổi trên Drawer
                            },
                        },
                    },
                }}
            >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="vi">Vietnamese</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="ja">Japanese</MenuItem>
            </TextField>

            <TextField
                select
                label="Sang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                size="small"
                sx={{ minWidth: 110 }}
                SelectProps={{
                    MenuProps: {
                        disablePortal: true, // ✅ giữ vị trí chuẩn
                        sx: {
                            "&& .MuiPaper-root": {
                                zIndex: 20000,
                            },
                        },
                    },
                }}
            >
                <MenuItem value="vi">Vietnamese</MenuItem>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ko">Korean</MenuItem>
                <MenuItem value="de">German</MenuItem>
            </TextField>

            {/* --- Text input --- */}
            <TextField
                multiline
                minRows={4}
                placeholder="Nhập đoạn văn cần dịch..."
                fullWidth
                value={textToTranslate}
                onChange={(e) => setTextToTranslate(e.target.value)}
                onKeyDown={handleEnter}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "white",
                        fontSize: "0.9rem",
                    },
                }}
            />

            {/* --- Button --- */}
            <Button
                variant="contained"
                startIcon={<TranslateIcon />}
                onClick={handleTranslate}
                disabled={isTranslating}
                className="!bg-blue-600 hover:!bg-blue-700 !rounded-xl !py-2.5 normal-case !font-semibold shadow-md"
            >
                Dịch ngay
            </Button>

            {/* --- Loading --- */}
            {isTranslating ? (
                <Box className="flex flex-col items-center justify-center mt-4 text-slate-500">
                    <CircularProgress size={26} thickness={4} />
                    <Typography variant="body2" className="mt-2 text-sm">
                        Đang dịch đoạn văn...
                    </Typography>
                </Box>
            ) : (
                translationResult && (
                    <Fade in timeout={400}>
                        <Box className="mt-2 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                {translationResult.originalText}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, color: "#0f172a" }}>
                                {translationResult.translatedText}
                            </Typography>
                            {translationResult.translationNotes && (
                                <Box className="p-2 bg-slate-50 border border-slate-200 rounded-md text-sm whitespace-pre-wrap text-slate-700">
                                    {translationResult.translationNotes}
                                </Box>
                            )}
                        </Box>
                    </Fade>
                )
            )}
        </motion.div>
    );
}
