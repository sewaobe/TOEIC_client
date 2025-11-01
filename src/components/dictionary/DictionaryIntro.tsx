import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TranslateIcon from "@mui/icons-material/Translate";
import { motion } from "framer-motion";

const typingPhrases = [
    "Xin chào, mình là Trợ lý Từ điển AI",
    "Giúp bạn hiểu từ vựng nhanh – dễ – sâu",
    "Tra cứu nghĩa, ví dụ và hình minh họa ngay nhé",
];

interface DictionaryIntroProps {
    onStartLookup: () => void;
}

export default function DictionaryIntro({ onStartLookup }: DictionaryIntroProps) {
    const [displayText, setDisplayText] = useState("");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);

    /* ---------------- HIỆU ỨNG GÕ CHỮ ---------------- */
    useEffect(() => {
        const current = typingPhrases[phraseIndex];
        if (charIndex < current.length) {
            const timeout = setTimeout(() => {
                setDisplayText((prev) => prev + current[charIndex]);
                setCharIndex((prev) => prev + 1);
            }, 55);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setDisplayText("");
                setCharIndex(0);
                setPhraseIndex((prev) => (prev + 1) % typingPhrases.length);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [charIndex, phraseIndex]);

    return (
        <Box className="relative flex flex-col items-center justify-center h-full text-center gap-10 ">
            {/* 🔵 Background gradient nhẹ nhàng */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-indigo-100 to-purple-100 blur-3xl opacity-50"
                animate={{ scale: [1, 1.02, 1], opacity: [0.4, 0.5, 0.4] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* 📘 Icon trung tâm — không xoay, chỉ nhịp nhẹ */}
            <Box className="relative z-10 flex items-center justify-center pt-4">
                {/* Sao trái */}
                <motion.div
                    className="absolute -top-3 -left-4 text-yellow-400"
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 0.6] }}
                    transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                >
                    <AutoAwesomeIcon sx={{ fontSize: 22 }} />
                </motion.div>

                {/* Sao phải */}
                <motion.div
                    className="absolute -top-4 -right-4 text-yellow-400"
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                    <AutoAwesomeIcon sx={{ fontSize: 28 }} />
                </motion.div>

                {/* Sách chính với nhịp lên xuống nhẹ */}
                <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <MenuBookIcon
                        sx={{
                            fontSize: 90,
                            color: "#2563eb",
                            filter: "drop-shadow(0 4px 10px rgba(37,99,235,0.25))",
                        }}
                    />
                </motion.div>
            </Box>

            {/* ✨ Typing intro text */}
            <Box className="z-10 max-w-xs px-3">
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                        mb: 1.5,
                        lineHeight: 1.5,
                        minHeight: "3.5rem",
                        textShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                >
                    {displayText}
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="ml-0.5"
                    >
                        |
                    </motion.span>
                </Typography>
            </Box>

            {/* ⚡ CTA buttons */}
            <Box className="flex flex-col gap-3 w-full max-w-xs z-10">
                <Button
                    variant="contained"
                    startIcon={<MenuBookIcon />}
                    onClick={onStartLookup}
                    className="!rounded-xl !py-2.5 !bg-blue-600 hover:!bg-blue-700 normal-case !font-semibold shadow-md hover:shadow-lg transition-all"
                >
                    Tra cứu từ vựng
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<TranslateIcon />}
                    disabled
                    className="!rounded-xl !py-2.5 normal-case !font-semibold"
                >
                    Dịch đoạn văn bản (sắp ra mắt)
                </Button>
            </Box>
        </Box>
    );
}
