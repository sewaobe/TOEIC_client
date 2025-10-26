"use client"

import { Card, CardContent, Typography, Box, Button } from "@mui/material"
import { ReactNode } from "react"

interface PracticeCardProps {
  title: string
  subtitle?: string
  description: string
  gradient: string
  icon: ReactNode
  onClick: () => void
}

export default function PracticeCard({
  title,
  subtitle,
  description,
  gradient,
  icon,
  onClick,
}: PracticeCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        transition: "all 0.3s ease",
        border: "1px solid rgba(0,0,0,0.08)",
        backgroundColor: "background.paper",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
        },
      }}
    >
      <CardContent>
        {/* Icon + Title */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {/* Nền icon nhẹ hơn icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: gradient.replace("to right", "to right").replace(
                /(\d*\.\d+|\d+)\)/,
                "0.15)"
              ), // nhạt hơn một chút
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* icon giữ nguyên màu từ ngoài truyền vào */}
            {icon}
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ minHeight: 40, mb: 2 }}
        >
          {description}
        </Typography>

        {/* CTA Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            background: gradient,
            "&:hover": {
              background: gradient,
              opacity: 0.9,
            },
          }}
        >
          Bắt đầu
        </Button>
      </CardContent>
    </Card>
  )
}
