import {
    Box,
    Typography,
    LinearProgress,
    IconButton,
    CircularProgress,
} from "@mui/material"
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment"
import StarIcon from "@mui/icons-material/Star"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome" // biểu tượng sparkle
import HomeIcon from "@mui/icons-material/Home"
import { Tooltip } from "@mui/material"
import { useNavigate } from "react-router-dom"

interface UserProgress {
    streakDays: number
    xpPoints: number
    dailyGoal: number
}

export default function PracticeHeader() {
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState<UserProgress>({
        streakDays: 0,
        xpPoints: 0,
        dailyGoal: 0,
    })

    useEffect(() => {
        // 👉 Giả lập API call (sau này thay bằng fetch hoặc axios)
        const timer = setTimeout(() => {
            setProgress({
                streakDays: 7,
                xpPoints: 245,
                dailyGoal: 60,
            })
            setLoading(false)
        }, 600)

        return () => clearTimeout(timer)
    }, [])

    const navigate =  useNavigate();

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={3}
            py={1.5}
            borderBottom="1px solid"
            borderColor="divider"
            bgcolor="background.paper"
            sx={{ backdropFilter: "blur(6px)", zIndex: 20 }}
        >
            {/* Left: Title */}
            <Box display="flex" alignItems="center" gap={1.2}>
                {/* 🎧 Icon động */}
                <motion.div
                    initial={{ opacity: 0.8, scale: 0.95, y: 0 }}
                    animate={{
                        opacity: [0.8, 1, 0.8],
                        scale: [0.95, 1.05, 0.95],
                        y: [0, -4, 0],
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                    whileHover={{ scale: 1.15 }}
                    style={{
                        filter: "drop-shadow(0 0 8px rgba(37,99,235,0.4))",
                    }}
                >
                    <AutoAwesomeIcon sx={{ fontSize: 32, color: "#2563EB" }} />
                </motion.div>

                {/* 🧠 Text title + caption */}
                <Box>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 700,
                            background: "linear-gradient(90deg, #2563EB, #06B6D4, #F97316)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: 0.4,
                        }}
                    >
                        TOEIC Skills
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", lineHeight: 1.4 }}
                    >
                        Rèn luyện mọi kỹ năng – Làm chủ điểm số TOEIC của bạn
                    </Typography>
                </Box>
            </Box>

            {/* Right: Stats */}
            {loading ? (
                <CircularProgress size={20} />
            ) : (
                <Box display="flex" alignItems="center" gap={3}>
                    {/* 🔥 Streak */}
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <LocalFireDepartmentIcon sx={{ color: "#f97316", fontSize: 22 }} />
                        <Typography fontWeight={600}>
                            {progress.streakDays}-day streak
                        </Typography>
                    </Box>

                    {/* 🎯 Daily Goal */}
                    <Box width={120}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                        >
                            Daily Goal
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={progress.dailyGoal}
                            sx={{
                                height: 6,
                                borderRadius: 4,
                                backgroundColor: "divider",
                                "& .MuiLinearProgress-bar": {
                                    background:
                                        "linear-gradient(to right, #2563eb, #06b6d4)",
                                },
                            }}
                        />
                    </Box>

                    {/* ⭐ XP */}
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <StarIcon sx={{ color: "#facc15", fontSize: 22 }} />
                        <Typography fontWeight={600}>{progress.xpPoints} XP</Typography>
                    </Box>

                    {/* 🕒 Timer */}
                    <IconButton size="small">
                        <AccessTimeIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                    </IconButton>

                    {/* 🏠 Home icon */}
                    <Tooltip title="Quay lại trang chủ" arrow>
                        <IconButton
                            size="small"
                            onClick={() => navigate("/home")}
                            sx={{
                                color: "text.secondary",
                                transition: "all 0.25s ease",
                                "&:hover": {
                                    color: "#2563EB",
                                    transform: "translateY(-2px)",
                                },
                            }}
                        >
                            <HomeIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Box>
    )
}
