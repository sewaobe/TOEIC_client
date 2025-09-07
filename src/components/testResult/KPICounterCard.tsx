// components/KpiCounterCard.tsx
import * as React from "react";
import { Card, CardContent, Stack, Typography, Box } from "@mui/material";

type Props = {
    title?: string;
    value: number | string;
    caption?: string;
    icon?: React.ReactNode;
    color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
};

export default function KPICounterCard({
    title,
    value,
    caption,
    icon,
    color = "primary",
}: Props) {
    return (
        <Card
            elevation={0}
            className="rounded-2xl"
            sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                height: "fit-content",
                width: "100%"
            }}
        >
            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    py: 2,
                }}
            >
                {/* Icon */}
                {icon && (
                    <Box
                        aria-hidden
                        className="flex items-center justify-center"
                        sx={{
                            width: 25,
                            height: 25,
                            borderRadius: "50%",
                            bgcolor: `${color}.main`,
                            color: "common.white",
                        }}
                    >
                        {icon}
                    </Box>
                )}

                {/* Title */}
                {title && (
                    <Typography
                        sx={{
                            color: `${color}.main`,
                            fontWeight: 700,
                            fontSize: "14px",
                            mt: 0.5,
                        }}
                    >
                        {title}
                    </Typography>
                )}

                {/* Value */}
                <Typography
                    sx={{ fontWeight: 800, lineHeight: 1, fontSize: "22px" }}
                >
                    {value}
                </Typography>

                {/* Caption */}
                {caption && (
                    <Typography sx={{ fontSize: "14px" }} color="text.primary">
                        {caption}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
