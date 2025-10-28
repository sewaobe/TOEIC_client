import { useState, useRef } from "react"
import {
  PlayArrow as PlayIcon,
  Replay as RotateCcwIcon,
  VolumeUp as Volume2Icon,
  CheckCircle as CheckCircleIcon,
  Cancel as XCircleIcon,
  Lightbulb as LightbulbIcon,
  FlashOn as ZapIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material"

import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Checkbox,
  Grid,
} from "@mui/material"

interface DictationContentProps {
  lesson: {
    sectionId: string
    lessonId: string
    title: string
  }
}

interface DictationWord {
  word: string
  isBlank: boolean
  index: number
}

interface DictationItem {
  id: number
  text: string
  words: DictationWord[]
  difficulty: "easy" | "medium" | "hard"
  hint?: string
}

const parseSentence = (text: string, blankIndices: number[]): DictationWord[] => {
  const words = text.split(/\s+/)
  return words.map((word, index) => ({
    word,
    isBlank: blankIndices.includes(index),
    index,
  }))
}

const DICTATION_ITEMS: DictationItem[] = [
  {
    id: 1,
    text: "I'm happy to say that someone is in an on your house",
    words: parseSentence("I'm happy to say that someone is in an on your house", [4, 6, 8, 10, 12]),
    difficulty: "easy",
    hint: "Liên quan đến cảm xúc và vị trí",
  },
  {
    id: 2,
    text: "She sells seashells by the seashore",
    words: parseSentence("She sells seashells by the seashore", [1, 3, 5]),
    difficulty: "easy",
    hint: "Một câu luyện phát âm với âm 's'",
  },
  {
    id: 3,
    text: "International business communication requires cultural awareness",
    words: parseSentence("International business communication requires cultural awareness", [1, 3]),
    difficulty: "medium",
    hint: "Liên quan đến giao tiếp kinh doanh quốc tế",
  },
]

export default function DictationContent({ lesson }: DictationContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showAnswer, setShowAnswer] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [accuracy, setAccuracy] = useState(0)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentItem = DICTATION_ITEMS[currentIndex]
  const totalItems = DICTATION_ITEMS.length
  const blankIndices = currentItem.words.filter((w) => w.isBlank).map((w) => w.index)

  const calculateAccuracy = () => {
    let correctCount = 0
    blankIndices.forEach((idx) => {
      const correctWord = currentItem.words[idx].word.toLowerCase()
      const userWord = (userAnswers[idx] || "").toLowerCase().trim()
      if (userWord === correctWord) correctCount++
    })
    return Math.round((correctCount / blankIndices.length) * 100)
  }

  const generateAudio = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 440
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const handlePlayAudio = () => {
    generateAudio()
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 500)
  }

  const handleWordChange = (blankIndex: number, value: string) => {
    setUserAnswers({ ...userAnswers, [blankIndex]: value })
  }

  const checkAnswer = () => {
    const acc = calculateAccuracy()
    setAccuracy(acc)
    const isCorrect = acc === 100
    setFeedback(isCorrect ? "correct" : "incorrect")
    setShowAnswer(true)
    if (isCorrect) setCompletedCount(completedCount + 1)
  }

  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswers({})
      setShowAnswer(false)
      setFeedback(null)
      setShowHint(false)
      setShowTranscript(false)
      setAccuracy(0)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setUserAnswers({})
      setShowAnswer(false)
      setFeedback(null)
      setShowHint(false)
      setShowTranscript(false)
      setAccuracy(0)
    }
  }

  const handleReset = () => {
    setUserAnswers({})
    setShowAnswer(false)
    setFeedback(null)
    setCompletedCount(0)
    setCurrentIndex(0)
    setShowHint(false)
    setShowTranscript(false)
    setAccuracy(0)
  }

  const allAnswersFilled = blankIndices.every((idx) => userAnswers[idx]?.trim())

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: { xs: 2, md: 6 } }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: "linear-gradient(135deg, #2563eb, #06b6d4)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ZapIcon sx={{ color: "white", width: 28, height: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {lesson.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Luyện nghe chép chính tả
            </Typography>
          </Box>
        </Box>

        <Box textAlign="right">
          <Typography variant="h6" color="primary" fontWeight="bold">
            {completedCount}/{totalItems}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hoàn thành
          </Typography>
        </Box>
      </Box>

      {/* Main grid */}
      <Grid container spacing={3}>
        {/* Left controls */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Volume2Icon color="primary" fontSize="small" />
                <Typography fontWeight="bold">Điều khiển</Typography>
              </Box>

              <Button
                fullWidth
                onClick={handlePlayAudio}
                disabled={isPlaying}
                variant="contained"
                color="primary"
                startIcon={<PlayIcon />}
                sx={{ mb: 1 }}
              >
                Phát
              </Button>

              <Button
                fullWidth
                onClick={handlePlayAudio}
                variant="outlined"
                startIcon={<RotateCcwIcon />}
                sx={{ mb: 2 }}
              >
                Lặp lại
              </Button>

              {/* Auto-advance */}
              <Box display="flex" alignItems="center" gap={1} mt={2}>
                <Checkbox
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  size="small"
                />
                <Typography fontSize={14}>Tự động chuyển câu</Typography>
              </Box>

              {/* Difficulty */}
              <Box mt={3}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  Độ khó
                </Typography>
                <Box
                  mt={1}
                  px={2}
                  py={0.5}
                  borderRadius="16px"
                  display="inline-block"
                  bgcolor={
                    currentItem.difficulty === "easy"
                      ? "rgba(16,185,129,0.1)"
                      : currentItem.difficulty === "medium"
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(239,68,68,0.1)"
                  }
                  color={
                    currentItem.difficulty === "easy"
                      ? "success.main"
                      : currentItem.difficulty === "medium"
                      ? "warning.main"
                      : "error.main"
                  }
                  fontWeight="bold"
                  fontSize={12}
                >
                  {currentItem.difficulty === "easy"
                    ? "Dễ"
                    : currentItem.difficulty === "medium"
                    ? "Trung Bình"
                    : "Khó"}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Main content */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography fontWeight="bold">Điền từ còn thiếu</Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowTranscript(!showTranscript)}
                  startIcon={showTranscript ? <EyeOffIcon /> : <EyeIcon />}
                >
                  {showTranscript ? "Ẩn Transcript" : "Xem Transcript"}
                </Button>
              </Box>

              {/* sentence input */}
              <Box
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  p: 3,
                }}
              >
                <Box display="flex" flexWrap="wrap" gap={1.5} justifyContent="center">
                  {currentItem.words.map((wordObj) =>
                    wordObj.isBlank ? (
                      <input
                        key={wordObj.index}
                        type="text"
                        value={userAnswers[wordObj.index] || ""}
                        onChange={(e) => handleWordChange(wordObj.index, e.target.value)}
                        disabled={showAnswer}
                        placeholder="____"
                        className={`px-3 py-1 border-2 text-center font-semibold text-sm min-w-[70px] outline-none transition-all
                          ${
                            showAnswer
                              ? userAnswers[wordObj.index]?.toLowerCase() ===
                                wordObj.word.toLowerCase()
                                ? "border-green-500 bg-green-50 text-green-800"
                                : "border-red-500 bg-red-50 text-red-800"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                        style={{
                          borderRadius: 0, // không bo góc
                        }}
                      />
                    ) : (
                      <span key={wordObj.index} className="font-semibold">
                        {wordObj.word}
                      </span>
                    )
                  )}
                </Box>
              </Box>

              {showTranscript && (
                <Box mt={2} bgcolor="action.hover" p={2} borderRadius={1}>
                  <Typography variant="body2">
                    <strong>Transcript:</strong> {currentItem.text}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Hint */}
          {!showAnswer && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => setShowHint(!showHint)}
                  sx={{ cursor: "pointer" }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <LightbulbIcon color="primary" />
                    <Typography fontWeight="bold">Gợi ý</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {showHint ? "Ẩn" : "Hiển thị"}
                  </Typography>
                </Box>
                {showHint && (
                  <Typography variant="body2" mt={2} color="text.secondary">
                    {currentItem.hint}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<ChevronLeftIcon />}
              disabled={currentIndex === 0}
              onClick={handlePrevious}
              fullWidth
            >
              Câu Trước
            </Button>

            {!showAnswer ? (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={!allAnswersFilled}
                onClick={checkAnswer}
              >
                Kiểm Tra
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleNext}
                endIcon={<ChevronRightIcon />}
              >
                {currentIndex >= totalItems - 1 ? "Hoàn Thành" : "Tiếp Theo"}
              </Button>
            )}

            <Button variant="outlined" onClick={handleReset} fullWidth>
              Bắt đầu lại
            </Button>
          </Box>

          <Typography
            align="center"
            variant="body2"
            color="text.secondary"
            mt={2}
          >
            Bài tập {currentIndex + 1}/{totalItems}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  )
}
