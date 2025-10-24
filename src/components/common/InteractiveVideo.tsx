import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Box, Typography, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  QuestionMarker,
  useInteractiveVideo,
} from "../../hooks/useInteractiveVideo";
import "video.js/dist/video-js.css";

interface InteractiveVideoProps {
  videoUrl: string;
  markers: QuestionMarker[];
  title?: string;
}

export const InteractiveVideo: React.FC<InteractiveVideoProps> = ({
  videoUrl,
  markers,
  title = "Bài học video",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { activeQuestion, resumeVideo, isFullscreen, player, warning, closeWarning } =
    useInteractiveVideo(videoRef, markers, videoUrl);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setAnswered(true);
  };

  /** ==================== MODAL CÂU HỎI ==================== */
  const questionOverlay = activeQuestion && (
    <AnimatePresence>
      <motion.div
        key="q-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={`absolute inset-0 flex items-center justify-center backdrop-blur-md bg-white/60 dark:bg-gray-900/60 ${
          isFullscreen ? "z-[9999]" : "z-30"
        }`}
        style={{ pointerEvents: "auto" }}
      >
        <motion.div
          key="q-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 160, damping: 16 }}
          className={`rounded-2xl shadow-2xl text-center p-8 w-[30rem] max-w-[90%]`}
          style={{
            background: "linear-gradient(145deg, #f9fafb, #eef2ff)",
            color: "#0f172a",
            border: "1px solid #e5e7eb",
          }}
        >
          <Typography variant="h6" className="mb-5 font-semibold flex justify-center items-center gap-2">
            💬 {activeQuestion.question}
          </Typography>

          <Box className="space-y-3">
            {activeQuestion.options.map((opt, i) => {
              const isCorrect = i === activeQuestion.correctAnswer;
              const isSelected = selectedAnswer === i;

              return (
                <motion.div key={i} whileHover={!answered ? { scale: 1.03, y: -2 } : {}}>
                  <Button
                    onClick={() => handleAnswer(i)}
                    variant="outlined"
                    fullWidth
                    className="!py-3 !text-base font-medium rounded-xl border transition-all"
                    style={{
                      background: answered
                        ? isCorrect
                          ? "linear-gradient(135deg, #22c55e, #4ade80)"
                          : isSelected
                          ? "linear-gradient(135deg, #ef4444, #f87171)"
                          : "#f3f4f6"
                        : "#fff",
                      color: answered
                        ? isCorrect || isSelected
                          ? "#fff"
                          : "#1f2937"
                        : "#1f2937",
                      borderColor: answered ? "transparent" : "#e5e7eb",
                      boxShadow: answered
                        ? isCorrect
                          ? "0 4px 16px rgba(34,197,94,0.3)"
                          : isSelected
                          ? "0 4px 16px rgba(239,68,68,0.3)"
                          : "0 2px 8px rgba(0,0,0,0.05)"
                        : "0 2px 10px rgba(0,0,0,0.06)",
                    }}
                    disabled={answered}
                  >
                    {opt}
                  </Button>
                </motion.div>
              );
            })}
          </Box>

          <AnimatePresence>
            {answered && (
              <motion.div
                key="answer-feedback"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className="mt-6 space-y-3"
              >
                {selectedAnswer === activeQuestion.correctAnswer ? (
                  <motion.p
                    className="font-semibold text-lg"
                    style={{ color: "#16a34a" }}
                    initial={{ scale: 0.92 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 12 }}
                  >
                    🎉 Chính xác!
                  </motion.p>
                ) : (
                  <motion.p
                    className="font-semibold text-lg"
                    style={{ color: "#dc2626" }}
                    animate={{ rotate: [0, -3, 3, -2, 2, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    😅 Sai rồi
                  </motion.p>
                )}

                {activeQuestion.explanation && (
                  <Typography className="text-sm" sx={{ color: "#475569" }}>
                    💡 {activeQuestion.explanation}
                  </Typography>
                )}

                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    onClick={() => {
                      setAnswered(false);
                      setSelectedAnswer(null);
                      resumeVideo();
                    }}
                    variant="contained"
                    size="large"
                    className="!text-white mt-2 !px-6 !py-2 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
                      boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                    }}
                  >
                    Tiếp tục học
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  /** ==================== MODAL CẢNH BÁO ==================== */
  const warningOverlay = warning.open && (
    <AnimatePresence>
      <motion.div
        key="warn-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={`absolute inset-0 flex items-center justify-center backdrop-blur-md bg-white/60 dark:bg-gray-900/60 ${
          isFullscreen ? "z-[9999]" : "z-30"
        }`}
        style={{ pointerEvents: "auto" }}
      >
        <motion.div
          key="warn-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="rounded-2xl shadow-2xl text-center p-8 w-[28rem] max-w-[90%]"
          style={{
            background: "linear-gradient(145deg, #fee2e2, #fecaca)",
            color: "#7f1d1d",
            border: "1px solid #fca5a5",
          }}
        >
          <Typography variant="h6" className="mb-3 font-bold flex justify-center items-center gap-2">
            ⚠️ Không được tua quá nhanh
          </Typography>
          <Typography className="text-sm opacity-90 mb-5">{warning.message}</Typography>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              onClick={closeWarning}
              variant="contained"
              className="!text-white !px-6 !py-2 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #ef4444, #f97316)",
                boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
              }}
            >
              Đã hiểu
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  const overlayNormal = (
    <>
      {questionOverlay}
      {warningOverlay}
    </>
  );

  return (
    <Box className="relative max-w-4xl mx-auto w-full">
      {title && (
        <Typography variant="h6" className="font-bold text-gray-800 mb-3">
          {title}
        </Typography>
      )}

      <div data-vjs-player className="relative rounded-xl overflow-hidden shadow-xl">
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered rounded-xl overflow-hidden shadow-lg"
        />
      </div>

      {!isFullscreen && overlayNormal}
      {isFullscreen && player && ReactDOM.createPortal(overlayNormal, player.el()!)}
    </Box>
  );
};
