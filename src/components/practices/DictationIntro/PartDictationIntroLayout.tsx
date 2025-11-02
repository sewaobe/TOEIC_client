import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";

interface ModeOption {
    title: string;
    description: string;
    color?: "primary" | "secondary" | "success";
    onClick: () => void;
}

interface PartIntroLayoutProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    modes: ModeOption[];
}

export const PartIntroLayout = ({
    icon,
    title,
    description,
    modes,
}: PartIntroLayoutProps) => {
    return (
        <Box
            sx={{
                width: "min(900px, 95%)",
                mx: "auto",
                p: 4,
                textAlign: "center",
                minHeight: "70vh",
            }}
        >
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    {icon} {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={1}>
                    {description}
                </Typography>
            </Box>

            {/* Mode selection */}
            <Stack direction="column" spacing={2} alignItems="center" mt={4}>
                {modes.map((m, i) => (
                    <Button
                        key={i}
                        variant="contained"
                        color={m.color || "primary"}
                        size="large"
                        onClick={m.onClick}
                        sx={{
                            width: "min(500px, 90%)",
                            py: 2,
                            borderRadius: "12px",
                            textTransform: "none",
                            fontSize: "16px",
                            boxShadow: "0 4px 10px rgba(37,99,235,0.15)",
                        }}
                    >
                        {m.title}
                    </Button>
                ))}
            </Stack>
        </Box>
    );
};
