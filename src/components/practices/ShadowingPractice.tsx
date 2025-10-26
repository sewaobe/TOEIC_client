import { useState, useRef } from "react"
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  VolumeUp as VolumeIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  Mic as MicIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Slider,
  Typography,
  Card,
  CardContent,
  Container,
  IconButton,
} from "@mui/material"

interface ShadowingContentProps {
  lesson: {
    sectionId: string
    lessonId: string
    title: string
  }
}

interface ShadowingItem {
  id: string
  text: string
  audioUrl: string
}

const SHADOWING_DATA: Record<string, ShadowingItem[]> = {
  "p1-1": [
    {
      id: "s1",
      text: "The man is standing in front of a large building. He appears to be wearing a business suit and holding a briefcase. The weather looks clear and sunny.",
      audioUrl: "/audio/shadowing-1.mp3",
    },
    {
      id: "s2",
      text: "Several people are sitting around a conference table. They seem to be having a business meeting. There are laptops and documents on the table.",
      audioUrl: "/audio/shadowing-2.mp3",
    },
  ],
  "p1-2": [
    {
      id: "s1",
      text: "The office environment shows modern furniture and large windows. Employees are working at their desks with computers. The lighting is bright and professional.",
      audioUrl: "/audio/shadowing-3.mp3",
    },
  ],
}

export default function ShadowingContent({ lesson }: ShadowingContentProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const items = SHADOWING_DATA[lesson.lessonId] || SHADOWING_DATA["p1-1"]
  const currentItem = items[currentItemIndex]

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }

  const handleNext = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1)
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1)
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }

  const handleStartRecording = () => {
    setIsRecording(!isRecording)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bgcolor="background.default">
      {/* Header */}
      <Box
        borderBottom="1px solid"
        borderColor="divider"
        bgcolor="background.paper"
        sx={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(6px)" }}
      >
        <Container sx={{ py: 3 }}>
          <Typography variant="h5" fontWeight="bold" mb={0.5}>
            {lesson.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Luyện tập Shadowing - Lặp lại những gì bạn nghe
          </Typography>
        </Container>
      </Box>

      {/* Main */}
      <Container sx={{ flex: 1, py: 4 }}>
        {/* Progress */}
        <Box display="flex" alignItems="center" mb={3}>
          <Typography variant="body2" color="text.secondary">
            Bài {currentItemIndex + 1}/{items.length}
          </Typography>
          <Box
            flex={1}
            mx={2}
            height={6}
            borderRadius={3}
            bgcolor="divider"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              height="100%"
              sx={{
                width: `${((currentItemIndex + 1) / items.length) * 100}%`,
                background: "linear-gradient(to right, #2563eb, #06b6d4)",
                transition: "width 0.4s ease",
              }}
            />
          </Box>
        </Box>

        {/* Audio Player */}
        <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <audio
              ref={audioRef}
              src={currentItem.audioUrl}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Controls */}
            <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
              <IconButton
                onClick={handlePrevious}
                disabled={currentItemIndex === 0}
                color="default"
                sx={{ width: 48, height: 48 }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Button
                onClick={handlePlayPause}
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  color: "white",
                  background: "linear-gradient(to right, #2563eb, #06b6d4)",
                  boxShadow: 3,
                  "&:hover": {
                    background: "linear-gradient(to right, #1d4ed8, #0891b2)",
                  },
                }}
              >
                {isPlaying ? <PauseIcon fontSize="large" /> : <PlayIcon fontSize="large" />}
              </Button>

              <IconButton onClick={handleReplay} color="default" sx={{ width: 48, height: 48 }}>
                <ReplayIcon />
              </IconButton>

              <IconButton
                onClick={handleNext}
                disabled={currentItemIndex === items.length - 1}
                color="default"
                sx={{ width: 48, height: 48 }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>

            {/* Slider */}
            <Slider
              value={currentTime}
              min={0}
              max={duration || 100}
              step={0.1}
              onChange={(_, val) => {
                if (audioRef.current && typeof val === "number") {
                  audioRef.current.currentTime = val
                }
              }}
              sx={{
                color: "primary.main",
              }}
            />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(duration)}
              </Typography>
            </Box>

            {/* Speed */}
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
              <VolumeIcon fontSize="small" color="disabled" />
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <Button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  size="small"
                  variant={playbackSpeed === speed ? "contained" : "outlined"}
                  sx={{
                    minWidth: 50,
                    textTransform: "none",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {speed}x
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <VolumeIcon color="primary" />
                <Typography fontWeight="bold">Transcript</Typography>
              </Box>
              <Button
                onClick={() => setShowTranscript(!showTranscript)}
                variant="text"
                size="small"
                startIcon={showTranscript ? <EyeOffIcon /> : <EyeIcon />}
              >
                {showTranscript ? "Ẩn" : "Hiện"}
              </Button>
            </Box>

            {showTranscript ? (
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {currentItem.text}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                Nhấn "Hiện" để xem transcript
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Recording */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "primary.light",
            bgcolor: "primary.main",
            background:
              "linear-gradient(to right, rgba(59,130,246,0.05), rgba(6,182,212,0.05))",
            mb: 4,
          }}
        >
          <CardContent
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Box>
              <Typography fontWeight="bold">Bắt đầu ghi âm</Typography>
              <Typography variant="body2" color="text.secondary">
                Lặp lại những gì bạn nghe để cải thiện kỹ năng phát âm
              </Typography>
            </Box>
            <Button
              onClick={handleStartRecording}
              startIcon={<MicIcon />}
              sx={{
                borderRadius: "999px",
                px: 3,
                py: 1,
                fontWeight: "bold",
                color: "white",
                background: isRecording
                  ? "linear-gradient(to right, #dc2626, #b91c1c)"
                  : "linear-gradient(to right, #2563eb, #06b6d4)",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
            >
              {isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "warning.light",
            bgcolor: "rgba(251,191,36,0.1)",
          }}
        >
          <CardContent>
            <Typography fontWeight="bold" mb={1.5}>
              💡 Mẹo luyện tập Shadowing
            </Typography>
            <ul style={{ marginLeft: "1em", color: "rgba(0,0,0,0.8)" }}>
              <li>Nghe toàn bộ câu trước khi bắt đầu lặp lại</li>
              <li>Cố gắng lặp lại cùng lúc với audio</li>
              <li>Chú ý phát âm, ngữ điệu và tốc độ</li>
              <li>Lặp lại nhiều lần cho đến khi tự tin</li>
              <li>Sử dụng tốc độ chậm nếu cần thiết</li>
            </ul>
          </CardContent>
        </Card>
      </Container>

      {/* Footer */}
      <Box
        borderTop="1px solid"
        borderColor="divider"
        bgcolor="background.paper"
        sx={{ py: 2, backdropFilter: "blur(6px)" }}
      >
        <Container sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handlePrevious}
            disabled={currentItemIndex === 0}
          >
            Bài trước
          </Button>

          <Typography variant="body2" color="text.secondary">
            Bài {currentItemIndex + 1}/{items.length}
          </Typography>

          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleNext}
            disabled={currentItemIndex === items.length - 1}
            sx={{
              background: "linear-gradient(to right, #2563eb, #06b6d4)",
              "&:hover": {
                background: "linear-gradient(to right, #1d4ed8, #0891b2)",
              },
            }}
          >
            Bài tiếp
          </Button>
        </Container>
      </Box>
    </Box>
  )
}
