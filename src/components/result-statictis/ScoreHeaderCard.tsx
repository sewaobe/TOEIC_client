import { useEffect, useState } from "react";
import {
    Card,
    Box,
    Typography,
    Chip,
    CircularProgress,
} from "@mui/material";
import { motion, animate } from "framer-motion";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export default function ScoreHeaderCard({ overview }: { overview: any }) {
    const [progressValue, setProgressValue] = useState(0);

    // Hiệu ứng tăng dần % khi load
    useEffect(() => {
        const controls = animate(0, overview.progress, {
            duration: 1.8,
            ease: "easeOut",
            onUpdate: (v) => setProgressValue(parseFloat(v.toFixed(1))),
        });
        return () => controls.stop();
    }, [overview.progress]);

    return (
        <Card
            sx={{
                borderRadius: 4,
                mb: 4,
                p: 4,
                color: "#F4F4FF",
                background: `
                linear-gradient(135deg,
                    #5B21B6 0%,
                    #7C3AED 35%,
                    #4F46E5 70%,
                    #2563EB 100%)
                `,
                boxShadow: "0 5px 20px rgba(59,130,246,0.45)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            {/* LEFT SECTION */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* Header title */}
                <Typography
                    variant="subtitle1"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        opacity: 0.95,
                        fontWeight: 600,
                        fontSize: "1.05rem",
                        color: "#E8E8FF",
                    }}
                >
                    <TrendingUpIcon fontSize="small" sx={{ color: "#B9B5FF" }} />
                    Tổng quan điểm TOEIC
                </Typography>

                {/* Main score với gradient chữ */}
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            lineHeight: 1,
                            letterSpacing: "-1px",
                            background: "linear-gradient(90deg, #FFD5E5, #FFB8A3, #B9F3FC)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 0 14px rgba(255,255,255,0.5)",
                        }}
                    >
                        {overview.overall}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 0.6 }}>
                        / 990
                    </Typography>
                </Box>

                {/* Sub info */}
                <Typography
                    sx={{
                        fontSize: "1rem",
                        opacity: 0.95,
                        color: "#EAE9FF",
                    }}
                >
                    Tăng{" "}
                    <Box component="span" sx={{ fontWeight: 700, color: "#C4B5FD" }}>
                        {overview.delta}
                    </Box>{" "}
                    điểm so với tháng 1 • Tiến độ{" "}
                    <Box component="span" sx={{ fontWeight: 700, color: "#C4B5FD" }}>
                        {overview.progress}%
                    </Box>
                </Typography>

                {/* Chips */}
                <Box sx={{ display: "flex", gap: 1.2, mt: 1 }}>
                    <Chip
                        icon={<HeadphonesIcon sx={{ color: "#E8F0FF" }} />}
                        label={`Listening: ${overview.listening}`}
                        sx={{
                            background: "linear-gradient(90deg, #60A5FA, #818CF8)",
                            color: "#FDFDFF",
                            fontWeight: 600,
                            px: 1.5,
                            "& .MuiChip-icon": { color: "#E8F0FF" },
                            boxShadow: "0 3px 10px rgba(129,140,248,0.35)",
                        }}
                    />
                    <Chip
                        icon={<MenuBookIcon sx={{ color: "#FAE8FF" }} />}
                        label={`Reading: ${overview.reading}`}
                        sx={{
                            background: "linear-gradient(90deg, #C084FC, #E879F9)",
                            color: "#FFF8FF",
                            fontWeight: 600,
                            px: 1.5,
                            "& .MuiChip-icon": { color: "#FAE8FF" },
                            boxShadow: "0 3px 10px rgba(192,132,252,0.35)",
                        }}
                    />
                </Box>
            </Box>

            {/* RIGHT SECTION */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                    {/* Gradient định nghĩa cho stroke */}
                    <svg width="0" height="0">
                        <defs>
                            <linearGradient id="progressGradient" x1="1" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F472B6" />
                                <stop offset="100%" stopColor="#C084FC" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Circular progress có animation xoay nhẹ */}
                    <motion.div
                        initial={{ rotate: -90 }}
                        animate={{ rotate: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ display: "inline-flex" }}
                    >
                        <CircularProgress
                            variant="determinate"
                            value={progressValue}
                            size={88}
                            thickness={4.5}
                            sx={{
                                filter: "drop-shadow(0 0 8px rgba(244,114,182,0.35))",
                                [`& .MuiCircularProgress-circle`]: {
                                    stroke: "url(#progressGradient)",
                                },
                            }}
                        />
                    </motion.div>

                    {/* Hiển thị % */}
                    <Box
                        sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: "absolute",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: "#FDFDFF",
                                textShadow: "0 0 6px rgba(255,255,255,0.4)",
                            }}
                        >
                            {progressValue}%
                        </Typography>
                    </Box>
                </Box>

                <Typography
                    sx={{
                        opacity: 0.9,
                        fontSize: "0.9rem",
                        color: "#F5F3FF",
                    }}
                >
                    Hoàn thành
                </Typography>
            </Box>
        </Card>
    );
}
