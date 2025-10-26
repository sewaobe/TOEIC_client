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
                background: `linear-gradient(
            135deg,
            rgba(240, 249, 255, 1) 0%,
            rgba(255, 255, 255, 1) 50%,
            rgba(240, 253, 250, 1) 100%
            )`,
                backgroundAttachment: "fixed",
                bgcolor: "background.default",
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
