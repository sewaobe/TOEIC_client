import { useEffect, useState, useMemo } from "react"
import PracticeLayout from "../layouts/PracticeLayout"
import { Box, CircularProgress, Typography } from "@mui/material"
import SidebarPractice, { Section } from "../../components/practices/SidebarPractice"
import DictationContent from "../../components/practices/DictationContent"
import { Dictation } from "../../types/Dictation"
import { dictationService } from "../../services/dictation.service"

import {
    Headphones as HeadphonesIcon,
    Chat as ChatIcon,
    RecordVoiceOver as RecordVoiceOverIcon,
    MenuBook as MenuBookIcon,
} from "@mui/icons-material"

// Icon mapping cho từng Part
const ICONS: Record<number, JSX.Element> = {
    1: <HeadphonesIcon fontSize="small" sx={{ color: "#2563eb" }} />,
    2: <ChatIcon fontSize="small" sx={{ color: "#10b981" }} />,
    3: <RecordVoiceOverIcon fontSize="small" sx={{ color: "#f59e0b" }} />,
    4: <MenuBookIcon fontSize="small" sx={{ color: "#ef4444" }} />,
}

// Map level sang độ khó
const mapLevelToDifficulty = (level?: string) => {
    if (!level) return "medium"
    const lvl = level.toUpperCase()
    if (lvl === "A1" || lvl === "A2") return "easy"
    if (lvl === "B1") return "medium"
    return "hard"
}

const PracticeDictationPage = () => {
    const [selectedLesson, setSelectedLesson] = useState<Dictation | null>(null)
    const [dictations, setDictations] = useState<Dictation[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const fetchDictations = async () => {
        setLoading(true)
        try {
            const data = await dictationService.getAllDictationData()
            setDictations(data)
        } catch (error) {
            console.error("Failed to fetch dictations:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDictations()
    }, [])

    /** Tạo 4 Part cố định, map dictations tương ứng */
    const sections: Section[] = useMemo(() => {
        const parts = [1, 2, 3, 4]
        return parts.map((partNumber) => {
            const partDictations = dictations.filter((d) => d.part_type === partNumber)

            return {
                id: `part${partNumber}`,
                title: `Part ${partNumber}: ${partNumber === 1
                    ? "Photographs"
                    : partNumber === 2
                        ? "Question - Response"
                        : partNumber === 3
                            ? "Short Conversations"
                            : "Short Talks"
                    }`,
                icon: ICONS[partNumber],
                lessons:
                    partDictations.length > 0
                        ? partDictations.map((d) => ({
                            id: d._id,
                            title: d.title,
                            difficulty: mapLevelToDifficulty(d.level),
                        }))
                        : [], // <- vẫn tạo mảng rỗng nếu chưa có bài
            }
        })
    }, [dictations])

    const handleSelectLesson = async (lessonId: string) => {
        try {
            setLoading(true)
            const lesson = await dictationService.getDictationById(lessonId)
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
                    skillType="dictation"
                    onSelectLesson={handleSelectLesson}
                />

                <Box flex={1} overflow="hidden">
                    {loading ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                        >
                            <CircularProgress />
                        </Box>
                    ) : selectedLesson ? (
                        <DictationContent dictation={selectedLesson} />
                    ) : (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                        >
                            <Typography color="text.secondary">
                                Chọn một bài luyện nghe chép chính tả từ sidebar để bắt đầu.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </PracticeLayout>
    )
}

export default PracticeDictationPage
