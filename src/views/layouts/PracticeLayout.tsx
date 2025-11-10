import { Box, SxProps } from "@mui/material"
import { ReactNode } from "react"
import PracticeHeader from "../../components/practices/HeaderPractice"

interface PracticeLayoutProps {
    children: ReactNode
    sx?: SxProps
}

export default function PracticeLayout({
    children,
    sx,
}: PracticeLayoutProps) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            height="100vh"
            sx={{
                backgroundColor: "#f5f9ff",
                backgroundAttachment: "fixed",
                ...sx,
            }}
        >
            {/* Header gọi API nội bộ */}
            < PracticeHeader />

            {/* Nội dung trang */}
            <Box flex={1} className="custom-scrollbar overflow-x-hidden" >
                {children}
            </Box>
        </Box>
    )
}
