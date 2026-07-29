import { Box, SxProps } from "@mui/material"
import { ReactNode, useState } from "react"
import { useSelector } from "react-redux"
import { ChatbotDrawer } from "../../components/chatbot/ChatbotDrawer"
import RightMenuDrawer from "../../components/common/RightMenu"
import DictionaryDrawer from "../../components/dictionary/DictionaryDrawer"
import { LearningProgressModal } from "../../components/modals/LearningProgressModal"
import ReportIssueModal from "../../components/modals/ReportIssueModal"
import PracticeHeader from "../../components/practices/HeaderPractice"
import { RootState } from "../../stores/store"
import StudyNotebookFlip3D from "../pages/NotebookPage"

interface PracticeLayoutProps {
    children: ReactNode
    sx?: SxProps
}

export default function PracticeLayout({
    children,
    sx,
}: PracticeLayoutProps) {
    const isAuthenticated = useSelector(
        (state: RootState) => state.user.isAuthenticated
    )

    const [showNotebook, setShowNotebook] = useState(false)
    const [showDictionary, setShowDictionary] = useState(false)
    const [showLearningProgress, setShowLearningProgress] = useState(false)
    const [showChatbot, setShowChatbot] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)

    return (
        <Box
            display="flex"
            flexDirection="column"
            height="100dvh"
            sx={{
                backgroundColor: "#f5f9ff",
                backgroundAttachment: "fixed",
                overflow: "hidden",
                ...sx,
            }}
        >
            {/* Header gọi API nội bộ */}
            < PracticeHeader />

            {/* Nội dung trang */}
            <Box
                flex={1}
                minHeight={0}
                className="custom-scrollbar overflow-x-hidden"
                sx={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    position: "relative",
                }}
            >
                {children}
            </Box>
            {isAuthenticated && (
                <>
                    <RightMenuDrawer
                        onShowNotebook={setShowNotebook}
                        onShowProgress={setShowLearningProgress}
                        onShowChatbot={setShowChatbot}
                        onShowReport={setShowReportModal}
                        onShowDictionary={setShowDictionary}
                    />
                    <StudyNotebookFlip3D
                        isOpen={showNotebook}
                        onClose={() => setShowNotebook(false)}
                    />
                    <LearningProgressModal
                        isFirstVisitToday={showLearningProgress}
                        setIsFirstVisitToday={setShowLearningProgress}
                    />
                    <ChatbotDrawer
                        isOpen={showChatbot}
                        onClose={() => setShowChatbot(false)}
                    />
                    <ReportIssueModal
                        open={showReportModal}
                        onClose={() => setShowReportModal(false)}
                    />
                    <DictionaryDrawer
                        open={showDictionary}
                        onClose={() => setShowDictionary(false)}
                    />
                </>
            )}
        </Box>
    )
}
