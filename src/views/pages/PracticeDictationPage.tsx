import { useState } from "react"
import PracticeLayout from "../layouts/PracticeLayout"
import { Box, Typography } from "@mui/material"
import SidebarPractice from "../../components/practices/SidebarPractice"
import DictationContent from "../../components/practices/DictationPractice"

const PracticeDictationPage = () => {
    const [selectedLesson, setSelectedLesson] = useState<any>(null)
    return (
        <PracticeLayout>
            <Box display="flex" flex={1} overflow="hidden">
                <SidebarPractice onSelectLesson={setSelectedLesson} />
                <Box flex={1} overflow="hidden">
                    {selectedLesson ? (
                        <DictationContent lesson={selectedLesson} />
                    ) : (
                        <Box
                            display="flex"
                            flex={1}
                            alignItems="center"
                            justifyContent="center"
                            textAlign="center"
                        >
                            <Typography variant="body1" color="text.secondary">
                                Chọn một bài học từ sidebar để bắt đầu luyện tập.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </PracticeLayout>
    )
}
export default PracticeDictationPage