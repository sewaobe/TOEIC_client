import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Chip,
    Box,
    Tooltip,
    Button,
    Divider,
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    ArrowBack as ArrowBackIcon,
    MenuOpen as MenuOpenIcon,
    Menu as MenuIcon,
    Headphones as HeadphonesIcon,
    Chat as ChatIcon,
    RecordVoiceOver as RecordVoiceOverIcon,
    MenuBook as MenuBookIcon,
    Description as DescriptionIcon,
    LibraryBooks as LibraryBooksIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toeicPartsArray } from "../../constants/toeicPart";

interface SidebarProps {
    onSelectTag?: (tagName: string) => void;
    skillType?: "dictation" | "shadowing" | "flashcard" | "listening" | "reading";
}

export default function SidebarPractice({ onSelectTag, skillType = "listening" }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const navigate = useNavigate();

    // Lưu trạng thái collapse
    useEffect(() => {
        const saved = localStorage.getItem("sidebarCollapsed");
        if (saved) setIsCollapsed(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Lọc Part theo kỹ năng
    const filteredParts =
        skillType === "dictation" || skillType === "shadowing"
            ? toeicPartsArray.slice(0, 4) // Listening: Part 1–4
            : toeicPartsArray; // Tất cả Part 1–7

    // Icon minh họa từng Part
    const partIcons = [
        <HeadphonesIcon fontSize="small" sx={{ color: "#2563eb" }} />,
        <ChatIcon fontSize="small" sx={{ color: "#22c55e" }} />,
        <RecordVoiceOverIcon fontSize="small" sx={{ color: "#f59e0b" }} />,
        <MenuBookIcon fontSize="small" sx={{ color: "#8b5cf6" }} />,
        <DescriptionIcon fontSize="small" sx={{ color: "#06b6d4" }} />,
        <LibraryBooksIcon fontSize="small" sx={{ color: "#e11d48" }} />,
        <LibraryBooksIcon fontSize="small" sx={{ color: "#0ea5e9" }} />,
    ];

    return (
        <motion.aside
            className="h-[calc(100vh-70px)] bg-white border-r border-gray-200 flex flex-col overflow-x-hidden"
            animate={{ width: isCollapsed ? 72 : 260 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
            {/* ===== Header collapse button ===== */}
            <Box display="flex" alignItems="center" justifyContent={isCollapsed ? "center" : "flex-end"} p={1}>
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

            {/* ===== Accordion Parts ===== */}
            <Box className="flex-1 overflow-y-auto px-2 overflow-x-hidden">
                {filteredParts.slice(0, 4).map((part, index) => (
                    <Accordion
                        key={part.label}
                        disableGutters
                        sx={{ background: "transparent", boxShadow: "none", "&:before": { display: "none" } }}
                    >
                        <AccordionSummary
                            expandIcon={!isCollapsed && <ExpandMoreIcon sx={{ color: "#777", fontSize: 18 }} />}
                            sx={{
                                borderRadius: "8px",
                                px: 1.2,
                                py: 1,
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                                justifyContent: isCollapsed ? "center" : "flex-start",
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                {partIcons[index]}
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
                                                {part.label}
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
                                        <div className="flex flex-wrap gap-1.5 pb-2">
                                            {part.tags.length > 0 ? (
                                                part.tags.map((tag, i) => (
                                                    <Chip
                                                        key={i}
                                                        label={tag}
                                                        className={`!text-xs !rounded-md cursor-pointer transition-all ${
                                                            selectedTag === tag
                                                                ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedTag(tag);
                                                            onSelectTag?.(tag);
                                                        }}
                                                    />
                                                ))
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontStyle: "italic", px: 1, py: 1 }}
                                                >
                                                    Chưa có tag nào
                                                </Typography>
                                            )}
                                        </div>
                                    </AccordionDetails>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Accordion>
                ))}
                {filteredParts.slice(4).map((part, index) => (
                    <Accordion
                        key={part.label}
                        disableGutters
                        sx={{ background: "transparent", boxShadow: "none", "&:before": { display: "none" } }}
                    >
                        <AccordionSummary
                            expandIcon={!isCollapsed && <ExpandMoreIcon sx={{ color: "#777", fontSize: 18 }} />}
                            sx={{
                                borderRadius: "8px",
                                px: 1.2,
                                py: 1,
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                                justifyContent: isCollapsed ? "center" : "flex-start",
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                {partIcons[index + 4]}
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
                                                {part.label}
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
                                        <div className="flex flex-wrap gap-1.5 pb-2">
                                            {part.tags.length > 0 ? (
                                                part.tags.map((tag, i) => (
                                                    <Chip
                                                        key={i}
                                                        label={tag}
                                                        className={`!text-xs !rounded-md cursor-pointer transition-all ${
                                                            selectedTag === tag
                                                                ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedTag(tag);
                                                            onSelectTag?.(tag);
                                                        }}
                                                    />
                                                ))
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontStyle: "italic", px: 1, py: 1 }}
                                                >
                                                    Chưa có tag nào
                                                </Typography>
                                            )}
                                        </div>
                                    </AccordionDetails>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Accordion>
                ))}
            </Box>

            {/* ===== Footer ===== */}
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
    );
}
