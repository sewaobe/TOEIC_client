import React, { useState, useRef, useEffect, useMemo, useCallback } from "react"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import {
  PlayArrow as PlayIcon,
  Replay as ReplayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore,
  ExpandLess,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  RestartAlt as RestartIcon,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Slider,
  IconButton,
  Collapse,
  Menu,
  MenuItem,
  LinearProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { Dictation, DictationAttemptLog } from "../../types/Dictation"
import { toast } from "sonner"
import { dictationAttemptService } from "../../services/dictation_attempt.service"
import { useNavigate } from "react-router-dom"
import PracticeCompletionCard from "../flashCard/PracticeCompletionCard"
import geminiService from "../../services/gemini.service"
import DictationAIAnalysis from "./DictationAIAnalysis"

type Difficulty = "easy" | "medium" | "hard"

interface DictationContentProps {
  dictation: Dictation
}

interface DictationWord {
  word: string
  isBlank: boolean
  index: number
}

/* ===== Helpers ===== */
const normalize = (text: string) =>
  text.toLowerCase().trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")

const getBlankRatio = (level: Difficulty) =>
  level === "easy" ? 0.2 : level === "hard" ? 0.55 : 0.35

const buildWords = (text: string, ratio: number): DictationWord[] => {
  const parts = text.split(/\s+/)
  const total = parts.length
  const blanks = new Set<number>()
  const blankCount = Math.max(1, Math.floor(total * ratio))
  while (blanks.size < blankCount) blanks.add(Math.floor(Math.random() * total))
  return parts.map((word, i) => ({
    word,
    index: i,
    isBlank: blanks.has(i),
  }))
}

/* ===== Component ===== */
export default function DictationContent({ dictation }: DictationContentProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [autoNext, setAutoNext] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [anchorSpeed, setAnchorSpeed] = useState<null | HTMLElement>(null)
  const [completed, setCompleted] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [progress, setProgress] = useState(0)
  const [startedAt, setStartedAt] = useState<number>(Date.now())
  const [attemptLogs, setAttemptLogs] = useState<DictationAttemptLog[]>([])
  const [openComplete, setOpenComplete] = useState(false)
  const [summary, setSummary] = useState({
    accuracy: 0,
    total: 0,
    avgTime: 0,
    logs: [] as DictationAttemptLog[],
  })
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [loadingAI, setLoadingAI] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  /* ===== Sentences ===== */
  const sentences = useMemo(() => {
    const ratio = getBlankRatio(difficulty)
    return (dictation.timings || []).map((seg, i) => ({
      id: i + 1,
      text: seg.text,
      words: buildWords(seg.text, ratio),
    }))
  }, [dictation, difficulty])

  const totalItems = sentences.length
  const currentItem = sentences[currentIndex]
  const currentSegment = dictation.timings?.[currentIndex]
  const blankIndices =
    currentItem?.words.filter((w) => w.isBlank).map((w) => w.index) || []

  /* ===== Audio Logic ===== */
  const handlePlay = useCallback(() => {
    if (!dictation.audio_url || !currentSegment) return
    const audio = audioRef.current ?? new Audio(dictation.audio_url)
    audioRef.current = audio

    const start = (currentSegment.startTime || 0) / 1000
    const end = (currentSegment.endTime || 0) / 1000
    const duration = end - start

    audio.currentTime = start
    audio.playbackRate = playbackRate
    setIsPlaying(true)
    setProgress(0)

    const onTime = () => {
      const current = audio.currentTime
      if (current >= end) {
        audio.pause()
        setIsPlaying(false)
        setProgress(100)
        audio.removeEventListener("timeupdate", onTime)
        return
      }
      const p = ((current - start) / duration) * 100
      setProgress(p)
    }

    audio.addEventListener("timeupdate", onTime)
    audio.play().catch(() => setIsPlaying(false))
  }, [dictation.audio_url, currentSegment, playbackRate])

  useEffect(() => {
    if (!dictation.audio_url || !currentSegment) return
    handlePlay()
    setStartedAt(Date.now())
  }, [currentIndex]) // eslint-disable-line

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  /* ===== Logic ===== */
  const handleWordChange = (index: number, value: string) =>
    setUserAnswers((prev) => ({ ...prev, [index]: value }))

  const calcAccuracy = useCallback(() => {
    if (!currentItem || blankIndices.length === 0) return 0
    let correct = 0
    blankIndices.forEach((i) => {
      const correctWord = normalize(currentItem.words[i].word)
      const userWord = normalize(userAnswers[i] || "")
      if (userWord === correctWord) correct++
    })
    return Math.round((correct / blankIndices.length) * 100)
  }, [currentItem, blankIndices, userAnswers])

  const handleCheck = () => {
    const acc = calcAccuracy()
    setShowAnswer(true)

    const finishedAt = Date.now()
    const duration = Math.round((finishedAt - startedAt) / 1000)
    const mistakes = blankIndices
      .filter((i) => normalize(userAnswers[i] || "") !== normalize(currentItem.words[i].word))
      .map((i) => currentItem.words[i].word)

    const newLog: DictationAttemptLog = {
      index: currentIndex,
      accuracy: acc,
      answers: { ...userAnswers },
      mistakes,
      duration,
      started_at: new Date(startedAt).toISOString(),
      finished_at: new Date(finishedAt).toISOString(),
    }
    setAttemptLogs((prev) => [...prev, newLog])

    if (acc === 100) {
      setCompleted((prev) => Math.min(prev + 1, totalItems))
      if (autoNext && currentIndex < totalItems - 1) {
        setTimeout(() => {
          setCurrentIndex((i) => i + 1)
          setShowAnswer(false)
          setUserAnswers({})
          setProgress(0)
        }, 1200)
      }
    }
  }

  const handleRetry = () => {
    setUserAnswers({})
    setShowAnswer(false)
    setProgress(0)
    setStartedAt(Date.now())
  }

  const handleNext = () => {
    if (calcAccuracy() === 100 && currentIndex < totalItems - 1) {
      setCurrentIndex((i) => i + 1)
      setShowAnswer(false)
      setUserAnswers({})
      setShowTranscript(false)
      setProgress(0)
      setStartedAt(Date.now())
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setShowAnswer(false)
      setUserAnswers({})
      setShowTranscript(false)
      setProgress(0)
      setStartedAt(Date.now())
    }
  }

  const allFilled = blankIndices.every((i) => (userAnswers[i] || "").trim())
  const overallProgress = Math.round((completed / totalItems) * 100)
  const accuracy = calcAccuracy()

  const handleSubmit = async () => {
    try {
      await toast.promise(dictationAttemptService.createDictationAttempts(attemptLogs, dictation._id), {
        loading: "Đang lưu kết quả luyện tập...",
        success: "Lưu kết quả luyện tập thành công!",
      })

      const total = attemptLogs.length
      const accuracy = Math.round(
        attemptLogs.reduce((sum, log) => sum + (log.accuracy || 0), 0) / total
      )
      const avgTime = Math.round(
        attemptLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / total
      )

      setSummary({ accuracy, total, avgTime, logs: attemptLogs })
      setOpenComplete(true)
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu kết quả luyện tập.")
    }
  }

  const handleAnalyzeWithAI = async () => {
    try {
      setLoadingAI(true)
      toast.loading("Đang phân tích bài luyện với AI...")

      const result = await geminiService.analyzeDictation(summary.logs, {
        _id: dictation._id,
        title: dictation.title,
        level: dictation.level,
      })

      toast.dismiss()
      toast.success("AI đã hoàn tất phân tích 🎉")
      setAiAnalysis(result)
    } catch (err) {
      console.error("AI analysis error:", err)
      toast.dismiss()
      toast.error("Không thể phân tích bằng AI, vui lòng thử lại.")
    } finally {
      setLoadingAI(false)
    }
  }

  /* ===== Nếu có phân tích AI -> render trang riêng ===== */
  if (aiAnalysis) {
    return (
      <DictationAIAnalysis
        loading={loadingAI}
        analysis={aiAnalysis}
        onConfirm={() => window.location.reload()}
      />
    )
  }

  /* ===== UI ===== */
  if (!totalItems)
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h5" color="text.secondary">
          Chưa có bài luyện tập nào
        </Typography>
      </Box>
    )

  return (
    <Box sx={{ p: 4, width: "min(980px, 95%)", mx: "auto", minHeight: "calc(100vh - 100px)" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="#2563eb">
            {dictation.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Luyện nghe chép chính tả · {dictation.level || "—"} · {totalItems} câu
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ minWidth: 160 }}>
            <Typography variant="caption" color="text.secondary">
              Tiến độ {completed}/{totalItems}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={overallProgress}
              sx={{ mt: 0.5, height: 8, borderRadius: 5 }}
            />
          </Box>

          <Button
            onClick={handleAnalyzeWithAI}
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 20 }} />}
            disabled={completed < totalItems || loadingAI}
            sx={{
              px: 2.5,
              py: 1,
              fontWeight: 600,
              borderRadius: "999px",
              textTransform: "none",
              fontSize: 14,
              color: "#fff",
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)",
              backgroundSize: "300% 300%",
              animation: completed >= totalItems ? "gradientShift 4s ease infinite" : "none",
              opacity: completed >= totalItems ? 1 : 0.5,
              cursor: completed >= totalItems ? "pointer" : "not-allowed",
              "&:hover": {
                transform: completed >= totalItems ? "scale(1.05)" : "none",
              },
            }}
          >
            Phân tích với AI
          </Button>
        </Box>
      </Box>

      {/* Audio bar */}
      <Box
        sx={{
          background: "linear-gradient(90deg,#2563eb,#06b6d4)",
          borderRadius: "999px",
          p: 1,
          px: 2,
          display: "flex",
          alignItems: "center",
          mb: 3,
          gap: 1.5,
        }}
      >
        <IconButton onClick={handlePlay} sx={{ color: "#fff" }}>
          {isPlaying ? <ReplayIcon /> : <PlayIcon />}
        </IconButton>

        <Slider
          min={0}
          max={100}
          value={progress}
          onChange={(_, newValue) => {
            if (!audioRef.current || !currentSegment) return
            const start = (currentSegment.startTime || 0) / 1000
            const end = (currentSegment.endTime || 0) / 1000
            const duration = end - start
            const newTime = start + ((newValue as number) / 100) * duration
            audioRef.current.currentTime = newTime
            setProgress(newValue as number)
          }}
          sx={{
            flex: 1,
            color: "#fff",
            "& .MuiSlider-thumb": { backgroundColor: "#fff" },
          }}
        />

        <Button
          onClick={(e) => setAnchorSpeed(e.currentTarget)}
          startIcon={<SpeedIcon />}
          sx={{ color: "#fff", textTransform: "none" }}
        >
          {playbackRate.toFixed(2)}x
        </Button>

        <Menu anchorEl={anchorSpeed} open={Boolean(anchorSpeed)} onClose={() => setAnchorSpeed(null)}>
          {[0.75, 1, 1.25, 1.5].map((r) => (
            <MenuItem
              key={r}
              selected={playbackRate === r}
              onClick={() => {
                setPlaybackRate(r)
                setAnchorSpeed(null)
              }}
            >
              {r}x
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Difficulty */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={difficulty}
          onChange={(_, val) => val && setDifficulty(val)}
        >
          <ToggleButton value="easy">Dễ</ToggleButton>
          <ToggleButton value="medium">TB</ToggleButton>
          <ToggleButton value="hard">Khó</ToggleButton>
        </ToggleButtonGroup>

        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox size="small" checked={autoNext} onChange={(e) => setAutoNext(e.target.checked)} />
          <Typography variant="body2">Tự động chuyển câu</Typography>
          <Chip
            label={dictation.level || "—"}
            size="small"
            sx={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb" }}
          />
        </Box>
      </Box>

      {/* Sentence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.25 }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Typography mb={2} fontWeight="bold" color="primary">
                Câu {currentIndex + 1}/{totalItems}
              </Typography>
              <Box
                textAlign="center"
                fontSize={18}
                sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1 }}
              >
                {currentItem?.words.map((w) =>
                  !w.isBlank ? (
                    <span key={w.index} style={{ fontWeight: 500, lineHeight: "34px" }}>
                      {w.word}
                    </span>
                  ) : (
                    <TextField
                      key={w.index}
                      variant="outlined"
                      size="small"
                      value={userAnswers[w.index] || ""}
                      onChange={(e) => handleWordChange(w.index, e.target.value)}
                      disabled={showAnswer}
                      placeholder="____"
                      sx={{
                        minWidth: 90,
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                          fontWeight: 600,
                          color: "#000",
                        },
                        ...(showAnswer && {
                          "& fieldset": {
                            borderColor:
                              normalize(userAnswers[w.index] || "") === normalize(w.word)
                                ? "#22c55e"
                                : "#ef4444",
                          },
                          "& .MuiInputBase-input": {
                            backgroundColor:
                              normalize(userAnswers[w.index] || "") === normalize(w.word)
                                ? "#dcfce7"
                                : "#fee2e2",
                            color:
                              normalize(userAnswers[w.index] || "") === normalize(w.word)
                                ? "#166534"
                                : "#991b1b",
                            fontWeight: 700,
                            borderRadius: 1,
                          },
                        }),
                      }}
                    />
                  )
                )}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Transcript */}
      <Box mb={2}>
        <Button
          startIcon={showTranscript ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setShowTranscript((p) => !p)}
          sx={{ textTransform: "none" }}
        >
          {showTranscript ? "Ẩn Transcript" : "Xem Transcript"}
        </Button>
        <Collapse in={showTranscript}>
          <Box
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              p: 2,
              mt: 1,
              backgroundColor: "#f8fafc",
            }}
          >
            <Typography variant="body2">{currentSegment?.text}</Typography>
          </Box>
        </Collapse>
      </Box>

      {/* Navigation */}
      <Box display="flex" justifyContent="center" gap={1} mb={2}>
        <Button variant="outlined" startIcon={<ChevronLeftIcon />} onClick={handlePrev} disabled={currentIndex === 0}>
          Trước
        </Button>

        {!showAnswer ? (
          <Button variant="contained" onClick={handleCheck} disabled={!allFilled}>
            Kiểm tra
          </Button>
        ) : accuracy === 100 ? (
          <Button
            variant="contained"
            color="success"
            endIcon={<ChevronRightIcon />}
            onClick={() => {
              if (currentIndex >= totalItems - 1) {
                handleSubmit()
              } else {
                handleNext()
              }
            }}
          >
            {currentIndex >= totalItems - 1 ? "Hoàn thành" : "Tiếp theo"}
          </Button>
        ) : (
          <Button variant="outlined" color="warning" startIcon={<RestartIcon />} onClick={handleRetry}>
            Làm lại câu này
          </Button>
        )}
      </Box>

      {/* Feedback */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {accuracy === 100 ? (
              <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mt: 1, borderRadius: 2 }}>
                Tuyệt vời! Bạn đã nghe chính xác toàn bộ câu này.
              </Alert>
            ) : (
              <Alert icon={<ErrorIcon />} severity="warning" sx={{ mt: 1, borderRadius: 2 }}>
                Bạn đúng khoảng {accuracy}% từ cần điền. Nghe lại đoạn này và sửa những ô đỏ nhé.
              </Alert>
            )}
          </motion.div>
        )}

        {openComplete && (
          <Box
            onClick={() => setOpenComplete(false)}
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
                accuracy={summary.accuracy}
                total={summary.total}
                avgTime={summary.avgTime}
                onRetry={() => window.location.reload()}
                onViewStats={() => setOpenComplete(false)}
                onGoHome={() => navigate("/practice-skill")}
              />
            </motion.div>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  )
}
