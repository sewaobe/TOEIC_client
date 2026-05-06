import { Box } from "@mui/material";
import { motion } from "framer-motion";
import PracticeCompletionCard from "../../flashCard/PracticeCompletionCard";

interface DictationCompletionOverlayProps {
  open: boolean;
  accuracy: number;
  total: number;
  avgTime: number;
  onRetry: () => void;
  onViewStats: () => void;
  onGoHome: () => void;
}

export default function DictationCompletionOverlay({
  open,
  accuracy,
  total,
  avgTime,
  onRetry,
  onViewStats,
  onGoHome,
}: DictationCompletionOverlayProps) {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
        flexDirection: "column",
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <PracticeCompletionCard
          type="dictation"
          accuracy={accuracy}
          total={total}
          avgTime={avgTime}
          onRetry={onRetry}
          onViewStats={onViewStats}
          onGoHome={onGoHome}
        />
      </motion.div>
    </Box>
  );
}
