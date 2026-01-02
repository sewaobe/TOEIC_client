import { useEffect, useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import PracticeLayout from "../layouts/PracticeLayout"
import { Box, CircularProgress, Typography } from "@mui/material"
import SidebarPractice, { Section } from "../../components/practices/SidebarPractice"
import ShadowingContent from "../../components/practices/ShadowingPractice"
import { Dictation } from "../../types/Dictation" // schema shadowing tương tự dictation

import {
    RecordVoiceOver as RecordVoiceOverIcon,
    Chat as ChatIcon,
    Mic as MicIcon,
    Headphones as HeadphonesIcon,
} from "@mui/icons-material"
import { shadowingService } from "../../services/shadowing.service"

/** ICON mapping cho từng Part (tùy bạn chỉnh theme khác Dictation nếu muốn) */
const ICONS: Record<number, JSX.Element> = {
    1: <MicIcon fontSize="small" sx={{ color: "#22c55e" }} />,         // Basic shadowing
    2: <RecordVoiceOverIcon fontSize="small" sx={{ color: "#f59e0b" }} />, // Conversations
    3: <ChatIcon fontSize="small" sx={{ color: "#3b82f6" }} />,         // Dialog shadowing
    4: <HeadphonesIcon fontSize="small" sx={{ color: "#ef4444" }} />,   // Advanced imitation
}

/** Map level sang độ khó (có thể reuse từ dictation logic) */
const mapLevelToDifficulty = (level?: string) => {
    if (!level) return "medium"
    const lvl = level.toUpperCase()
    if (lvl === "A1" || lvl === "A2") return "easy"
    if (lvl === "B1") return "medium"
    return "hard"
}

const PracticeShadowingPage = () => {
    const { id: urlId } = useParams<{ id?: string }>()
    const [selectedLesson, setSelectedLesson] = useState<Dictation | null>(null)
    const [shadowings, setShadowings] = useState<Dictation[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    // Auto-load shadowing if URL has :id param
    useEffect(() => {
        if (urlId) {
            handleSelectLesson(urlId)
        }
    }, [urlId])

    /** Fetch danh sách shadowing từ service */
    const fetchShadowings = async () => {
        setLoading(true)
        try {
            const data = await shadowingService.getAllShadowingData()
            setShadowings(data)
        } catch (error) {
            console.error("Failed to fetch shadowing lessons:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchShadowings()
    }, [])

    /** Map các bài shadowing vào 4 Part (hoặc tùy bạn chia logic riêng) */
    const sections: Section[] = useMemo(() => {
        const parts = [1, 2, 3, 4]
        return parts.map((partNumber) => {
            const partLessons = shadowings.filter((s) => s.part_type === partNumber)

            return {
                id: `part${partNumber}`,
                title: `Part ${partNumber}: ${partNumber === 1
                    ? "Sentence Shadowing"
                    : partNumber === 2
                        ? "Conversation Shadowing"
                        : partNumber === 3
                            ? "Story Shadowing"
                            : "Advanced Practice"
                    }`,
                icon: ICONS[partNumber],
                lessons:
                    partLessons.length > 0
                        ? partLessons.map((s) => ({
                            id: s._id,
                            title: s.title,
                            difficulty: mapLevelToDifficulty(s.level),
                        }))
                        : [],
            }
        })
    }, [shadowings])

    /** Khi user chọn 1 bài */
    const handleSelectLesson = async (lessonId: string) => {
        try {
            setLoading(true)
            const lesson = await shadowingService.getShadowingById(lessonId)
            setSelectedLesson(lesson)
        } catch (error) {
            console.error("Failed to select lesson:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <PracticeLayout>
            <Box display="flex" flex={1} overflow="hidden">
                <SidebarPractice
                    sections={sections}
                    skillType="shadowing"
                    onSelectLesson={handleSelectLesson}
                />

                <Box flex={1} overflow="hidden">
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <CircularProgress />
                        </Box>
                    ) : selectedLesson ? (
                        <ShadowingContent lesson={selectedLesson} />
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="text.secondary">
                                Chọn một bài luyện nói theo (shadowing) từ sidebar để bắt đầu.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </PracticeLayout>
    )
}

export default PracticeShadowingPage
