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
        </Box>
    )
}
