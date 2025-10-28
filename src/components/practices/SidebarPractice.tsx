import { useState, useEffect } from "react"
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Chip,
    Box,
    Tooltip,
    Button,
} from "@mui/material"
import {
    ExpandMore as ExpandMoreIcon,
    Headphones as HeadphonesIcon,
    Chat as ChatIcon,
    RecordVoiceOver as RecordVoiceOverIcon,
    MenuBook as MenuBookIcon,
    ArrowBack as ArrowBackIcon,
    MenuOpen as MenuOpenIcon,
    Menu as MenuIcon,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

interface Lesson {
    id: string
    title: string
    difficulty: "easy" | "medium" | "hard"
}

interface Section {
    id: string
    title: string
    lessons: Lesson[]
}

const SECTIONS: Section[] = [
    {
        id: "part1",
        title: "Part 1: Photographs",
        lessons: [
            { id: "p1-1", title: "Bài 1: Mô tả ảnh cơ bản", difficulty: "easy" },
            { id: "p1-2", title: "Bài 2: Mô tả ảnh nâng cao", difficulty: "medium" },
            { id: "p1-3", title: "Bài 3: Mô tả ảnh khó", difficulty: "hard" },
        ],
    },
    {
        id: "part2",
        title: "Part 2: Question-Response",
        lessons: [
            { id: "p2-1", title: "Bài 1: Câu hỏi đơn giản", difficulty: "easy" },
            { id: "p2-2", title: "Bài 2: Câu hỏi phức tạp", difficulty: "medium" },
            { id: "p2-3", title: "Bài 3: Câu hỏi khó", difficulty: "hard" },
        ],
    },
    {
        id: "part3",
        title: "Part 3: Short Conversations",
        lessons: [
            { id: "p3-1", title: "Bài 1: Hội thoại cơ bản", difficulty: "easy" },
            { id: "p3-2", title: "Bài 2: Hội thoại kinh doanh", difficulty: "medium" },
            { id: "p3-3", title: "Bài 3: Hội thoại chuyên sâu", difficulty: "hard" },
        ],
    },
    {
        id: "part4",
        title: "Part 4: Short Talks",
        lessons: [
            { id: "p4-1", title: "Bài 1: Bài nói cơ bản", difficulty: "easy" },
            { id: "p4-2", title: "Bài 2: Bài nói chuyên môn", difficulty: "medium" },
            { id: "p4-3", title: "Bài 3: Bài nói phức tạp", difficulty: "hard" },
        ],
    },
]

const ICONS: Record<string, JSX.Element> = {
    part1: <HeadphonesIcon fontSize="small" sx={{ color: "#2563eb" }} />,
    part2: <ChatIcon fontSize="small" sx={{ color: "#10b981" }} />,
    part3: <RecordVoiceOverIcon fontSize="small" sx={{ color: "#f59e0b" }} />,
    part4: <MenuBookIcon fontSize="small" sx={{ color: "#ef4444" }} />,
}

interface SidebarProps {
    onSelectLesson: (lesson: { sectionId: string; lessonId: string; title: string }) => void
}

export default function SidebarPractice({ onSelectLesson }: SidebarProps) {
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem("sidebarCollapsed")
        if (saved) setIsCollapsed(JSON.parse(saved))
    }, [])

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed))
    }, [isCollapsed])

    const getChipColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy":
                return "success"
            case "medium":
                return "warning"
            case "hard":
                return "error"
            default:
                return "default"
        }
    }

    return (
        <motion.aside
            className="h-[calc(100vh-70px)] bg-sidebar border-r border-sidebar-border flex flex-col overflow-x-hidden"
            animate={{ width: isCollapsed ? 72 : 260 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
            {/* ====== Header collapse button ====== */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent={isCollapsed ? "center" : "flex-end"}
                p={1}
            >
                <Tooltip title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}>
                    <Button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        variant="text"
                        sx={{
                            minWidth: 0,
                            color: "#2563eb",
                            borderRadius: "8px",
                            "&:hover": { backgroundColor: "rgba(37,99,235,0.08)" },
                        }}
                    >
                        {isCollapsed ? <MenuOpenIcon /> : <MenuIcon />}
                    </Button>
                </Tooltip>
            </Box>

            {/* ====== Accordion Sections ====== */}
            <Box className="flex-1 overflow-y-auto px-2  overflow-x-hidden">
                {SECTIONS.map((section) => (
                    <Accordion
                        key={section.id}
                        disableGutters
                        sx={{
                            background: "transparent",
                            boxShadow: "none",
                            "&:before": { display: "none" },
                        }}
                    >
                        <AccordionSummary
                            expandIcon={
                                !isCollapsed && <ExpandMoreIcon sx={{ color: "#777", fontSize: 18 }} />
                            }
                            sx={{
                                borderRadius: "8px",
                                px: 1.2,
                                py: 1,
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                                justifyContent: isCollapsed ? "center" : "flex-start",
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                {ICONS[section.id]}
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            key="title"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
                                                {section.title}
                                            </Typography>
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Box>
                        </AccordionSummary>

                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <AccordionDetails sx={{ pb: 0 }}>
                                        <div className="space-y-0.5">
                                            {section.lessons.map((lesson) => (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => {
                                                        setSelectedLessonId(lesson.id)
                                                        onSelectLesson({
                                                            sectionId: section.id,
                                                            lessonId: lesson.id,
                                                            title: lesson.title,
                                                        })
                                                    }}
                                                    className={`w-full text-left py-2 px-2 rounded-md flex items-center justify-between transition-all duration-200 text-sm ${selectedLessonId === lesson.id
                                                            ? "bg-blue-50 border-l-4 border-blue-500 font-semibold text-blue-700"
                                                            : "hover:bg-gray-50 text-gray-700"
                                                        }`}
                                                >
                                                    <span className="truncate">{lesson.title}</span>
                                                    <Chip
                                                        label={
                                                            lesson.difficulty === "easy"
                                                                ? "Dễ"
                                                                : lesson.difficulty === "medium"
                                                                    ? "TB"
                                                                    : "Khó"
                                                        }
                                                        size="small"
                                                        color={getChipColor(lesson.difficulty)}
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: 11 }}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </AccordionDetails>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Accordion>
                ))}
            </Box>

            {/* ====== Footer ====== */}
            <Box
                p={1.5}
                borderTop="1px solid rgba(0,0,0,0.1)"
                display="flex"
                alignItems="center"
                justifyContent={isCollapsed ? "center" : "flex-start"}
            >
                <Tooltip title="Quay về chọn kỹ năng" placement="right">
                    <Button
                        onClick={() => navigate("/practice-skill")}
                        startIcon={!isCollapsed && <ArrowBackIcon />}
                        sx={{
                            justifyContent: "center",
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#2563eb",
                            borderRadius: "8px",
                            px: isCollapsed ? 1 : 2,
                            py: 0.8,
                            width: "100%",
                            "&:hover": { backgroundColor: "rgba(37,99,235,0.05)" },
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {!isCollapsed ? (
                                <motion.span
                                    key="text"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    Quay về chọn kỹ năng
                                </motion.span>
                            ) : (
                                <ArrowBackIcon fontSize="small" />
                            )}
                        </AnimatePresence>
                    </Button>
                </Tooltip>
            </Box>
        </motion.aside>
    )
}
