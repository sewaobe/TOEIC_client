import React, { useState } from "react";
import { Box, Button, Typography, LinearProgress } from "@mui/material";
import { PlayArrow, Pause, SkipNext, SkipPrevious, Mic } from "@mui/icons-material";

export const LessonShadowing = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userSpeech, setUserSpeech] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const data = mockShadowingData;

  // --- Text-to-Speech ---
  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Trình duyệt không hỗ trợ Speech Synthesis API");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const line = data.transcript[currentIndex];
      speak(line.text);
    }
  };

  const handleNext = () => {
    const next = Math.min(currentIndex + 1, data.transcript.length - 1);
    setCurrentIndex(next);
    speak(data.transcript[next].text);
  };

  const handlePrev = () => {
    const prev = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prev);
    speak(data.transcript[prev].text);
  };

  // --- Speech Recognition ---
  const startRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt không hỗ trợ Speech Recognition API");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserSpeech(transcript);
      gradeShadowing(transcript, data.transcript[currentIndex].text);
    };

    recognition.onerror = (err: any) => {
      console.error("❌ Speech recognition error:", err);
      setIsRecording(false);
    };

    recognition.start();
  };

  // --- Simple grading ---
  const gradeShadowing = (spoken: string, expected: string) => {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z ]/g, "");
    const spokenClean = clean(spoken);
    const expectedClean = clean(expected);

    const spokenWords = spokenClean.split(" ").filter(Boolean);
    const expectedWords = expectedClean.split(" ").filter(Boolean);

    const correct = spokenWords.filter((w) => expectedWords.includes(w)).length;
    const sc = Math.round((correct / expectedWords.length) * 100);
    setScore(sc);
  };

  return (
    <Box
      sx={{
        border: "1px solid #eee",
        borderRadius: "16px",
        p: 2,
        bgcolor: "#fafafa",
        width: "67%",
        margin: "30px auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        🎧 Shadowing Practice
      </Typography>

      {/* Controls */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Button
          variant="contained"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <SkipPrevious />
        </Button>
        <Button
          variant="contained"
          color={isPlaying ? "error" : "primary"}
          onClick={handlePlayPause}
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentIndex === data.transcript.length - 1}
        >
          <SkipNext />
        </Button>
        <Button variant="outlined" onClick={startRecognition}>
          <Mic sx={{ mr: 1 }} /> Speak
        </Button>
      </Box>

      {/* Waveform mock */}
      {isRecording && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            mb: 2,
          }}
        >
          {[1, 2, 3, 4, 5].map((bar) => (
            <Box
              key={bar}
              sx={{
                width: "6px",
                height: "20px",
                bgcolor: "primary.main",
                borderRadius: "3px",
                animation: "wave 1s infinite",
                animationDelay: `${bar * 0.1}s`,
              }}
            />
          ))}
          <style>
            {`
              @keyframes wave {
                0% { transform: scaleY(0.3); }
                50% { transform: scaleY(1); }
                100% { transform: scaleY(0.3); }
              }
            `}
          </style>
        </Box>
      )}

      {/* Transcript */}
      <Box
        sx={{
          maxHeight: 300,
          overflowY: "auto",
          p: 1,
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        {data.transcript.map((line, idx) => (
          <Typography
            key={line.id}
            onClick={() => {
              setCurrentIndex(idx);
              speak(line.text);
            }}
            sx={{
              cursor: "pointer",
              mb: 1,
              p: 1,
              borderRadius: "8px",
              bgcolor: idx === currentIndex ? "primary.light" : "transparent",
              color: idx === currentIndex ? "white" : "black",
            }}
          >
            {line.text}
          </Typography>
        ))}
      </Box>

      {/* Progress */}
      <Box mt={2}>
        <LinearProgress
          variant="determinate"
          value={((currentIndex + 1) / data.transcript.length) * 100}
        />
        <Typography variant="caption">
          Câu {currentIndex + 1} / {data.transcript.length}
        </Typography>
      </Box>

      {/* Result */}
      {userSpeech && (
        <Box mt={2} p={2} border="1px dashed #aaa" borderRadius="8px">
          <Typography variant="subtitle2">🗣 Bạn đọc:</Typography>
          <Typography variant="body2" gutterBottom>
            "{userSpeech}"
          </Typography>
          <Typography variant="subtitle2">🎯 Gốc:</Typography>
          <Typography variant="body2" gutterBottom>
            "{data.transcript[currentIndex].text}"
          </Typography>
          {score !== null && (
            <Typography variant="h6">Điểm: {score}%</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

// Mock data
const mockShadowingData = {
  transcript: [
    { id: 1, text: "Hello everyone. Welcome to the shadowing practice." },
    { id: 2, text: "In this lesson, you will listen and repeat." },
    { id: 3, text: "Try to follow the speaker closely." },
    { id: 4, text: "Don't worry if you make mistakes." },
    { id: 5, text: "The goal is to improve fluency." },
  ],
};
