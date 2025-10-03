import type React from "react"
import { Box, Typography, Paper } from "@mui/material"
import { motion } from "framer-motion"

// Một số icon mặc định từ MUI
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined"
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined"

interface EmptySectionProps {
  title: string
  description?: string
  icon?: React.ReactNode
  isCard?: boolean   
}

export const EmptySection = ({ title, description, icon, isCard = false }: EmptySectionProps) => {
  const content = (
    <Box className="flex flex-col items-center justify-center py-6 px-6">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <Box
          className="mb-6 rounded-full flex items-center justify-center"
          sx={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
            border: "2px solid #BFDBFE",
          }}
        >
          {icon || (
            <InboxOutlinedIcon sx={{ fontSize: 40, color: "#2563EB" }} />
          )}
        </Box>
      </motion.div>

      {/* Title */}
      <Typography
        variant="h6"
        className="font-semibold mb-2 text-center"
        sx={{ color: "#111827" }}
      >
        {title}
      </Typography>

      {/* Description */}
      {description && (
        <Typography
          variant="body2"
          className="text-center max-w-md"
          sx={{ color: "#6B7280", lineHeight: 1.6 }}
        >
          {description}
        </Typography>
      )}

      {/* Decorative dots */}
      <Box className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.3,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#BFDBFE",
              }}
            />
          </motion.div>
        ))}
      </Box>
    </Box>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {isCard ? (
        <Paper
          elevation={3}
          className="rounded-2xl"
          sx={{
            backgroundColor: "#fff",
            p: 4,
          }}
        >
          {content}
        </Paper>
      ) : (
        content
      )}
    </motion.div>
  )
}

// Export sẵn vài icon thường dùng cho empty state
export const EmptyIcons = {
  default: <InboxOutlinedIcon sx={{ fontSize: 40, color: "#2563EB" }} />,
  assignment: <AssignmentOutlinedIcon sx={{ fontSize: 40, color: "#2563EB" }} />,
  school: <SchoolOutlinedIcon sx={{ fontSize: 40, color: "#2563EB" }} />,
  quiz: <QuizOutlinedIcon sx={{ fontSize: 40, color: "#2563EB" }} />,
}
