import { Card, CardContent, Typography, Box, Button, Tooltip } from "@mui/material"
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
              <Tooltip title={subtitle} arrow>
                <Typography variant="body2" color="text.secondary" sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {subtitle}
                </Typography>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Description */}
        <Tooltip title={description} arrow>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minHeight: 40, mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {description}
          </Typography>
        </Tooltip>

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
