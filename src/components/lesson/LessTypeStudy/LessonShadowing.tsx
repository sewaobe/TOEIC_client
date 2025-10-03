import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box, Button, Typography, LinearProgress, Chip } from "@mui/material";
import { SkipNext, SkipPrevious, Replay, CheckCircle, Hearing, Mic, RateReview } from "@mui/icons-material";

// Mock data (giữ nguyên)
const mockShadowingData = {
  transcript: [
    { id: 1, text: "Hello everyone. Welcome to the shadowing practice." },
    { id: 2, text: "In this lesson, you will listen and repeat." },
    { id: 3, text: "Try to follow the speaker closely." },
    { id: 4, text: "Don't worry if you make mistakes." },
    { id: 5, text: "The goal is to improve fluency and pronunciation." },
  ],
};

// Component ResultDisplay (giữ nguyên)
const ResultDisplay = ({ spoken, expected }: { spoken: string; expected: string; }) => {
    // ... code giữ nguyên ...
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, "");
    const expectedWords = clean(expected).split(" ").filter(Boolean);
    const spokenWords = clean(spoken).split(" ").filter(Boolean);
    const highlightedSpokenText = useMemo(() => {
        return spokenWords.map((word, index) => {
            const isCorrect = expectedWords.includes(word);
            return (
                <Typography component="span" key={index}
                    sx={{ color: isCorrect ? "green" : "red", textDecoration: isCorrect ? "none" : "line-through", fontWeight: "bold", mr: "4px" }}>
                    {word}
                </Typography>
            );
        });
    }, [spoken, expected]);
    return (
        <Box mt={2} p={2} border="1px dashed #aaa" borderRadius="8px">
            <Typography variant="subtitle2">🗣️ Bạn đọc:</Typography>
            <Typography variant="body1" gutterBottom>{highlightedSpokenText}</Typography>
            <Typography variant="subtitle2">🎯 Gốc:</Typography>
            <Typography variant="body1" fontStyle="italic" color="text.secondary">"{expected}"</Typography>
        </Box>
    );
};

// ✨ UI: Component sóng âm
const Waveform = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", height: "40px", my: 2 }}>
    {[...Array(5)].map((_, i) => (
      <Box key={i} sx={{ width: "6px", height: "100%", bgcolor: "primary.main", borderRadius: "3px", animation: "wave 1.2s infinite ease-in-out", animationDelay: `${i * 0.2}s` }} />
    ))}
    <style>
      {`@keyframes wave { 0% { transform: scaleY(0.1); } 50% { transform: scaleY(1); } 100% { transform: scaleY(0.1); } }`}
    </style>
  </Box>
);


export const LessonShadowing = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSpeech, setUserSpeech] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [practiceStep, setPracticeStep] = useState<"idle" | "listening_normal" | "listening_slow" | "speaking" | "feedback">("idle");
  
  const data = mockShadowingData;
  const currentLine = data.transcript[currentIndex];
  const MASTERY_SCORE = 75;

  // ✨ FIX: Bọc gradeShadowing trong useCallback
  const gradeShadowing = useCallback((spoken: string, expected: string) => {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, "");
    const spokenWords = clean(spoken).split(" ").filter(Boolean);
    const expectedWords = clean(expected).split(" ").filter(Boolean);
    if (expectedWords.length === 0) { setScore(0); return; }
    let correctCount = 0;
    expectedWords.forEach(word => {
        const index = spokenWords.indexOf(word);
        if (index > -1) {
            correctCount++;
            spokenWords.splice(index, 1);
        }
    });
    const sc = Math.round((correctCount / expectedWords.length) * 100);
    setScore(sc);
  }, []);

  const startRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Trình duyệt không hỗ trợ Speech Recognition API");
    
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserSpeech(transcript);
      gradeShadowing(transcript, currentLine.text);
      setPracticeStep("feedback");
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
  // ✨ FIX: Thêm `gradeShadowing` vào dependency array
  }, [currentLine, gradeShadowing]);

  const speak = useCallback((text: string, rate: number, onEndCallback?: () => void) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.onend = onEndCallback ? () => onEndCallback() : null;
    window.speechSynthesis.speak(utterance);
  }, []);

  const startPracticeLoop = useCallback(() => {
    setUserSpeech("");
    setScore(null);
    setPracticeStep("listening_normal");
  }, []);

  useEffect(() => {
    switch (practiceStep) {
      case "listening_normal":
        speak(currentLine.text, 1, () => setPracticeStep("listening_slow"));
        break;
      case "listening_slow":
        speak(currentLine.text, 0.75, () => setPracticeStep("speaking"));
        break;
      case "speaking":
        startRecognition();
        break;
      default:
        break;
    }
  }, [practiceStep, currentLine, speak, startRecognition]);

  const handleNext = () => {
    const next = Math.min(currentIndex + 1, data.transcript.length - 1);
    setCurrentIndex(next);
    setPracticeStep("idle");
    setUserSpeech("");
    setScore(null);
  };
  const handlePrev = () => {
    const prev = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prev);
    setPracticeStep("idle");
    setUserSpeech("");
    setScore(null);
  };
  
  // ✨ UI: Component hiển thị trạng thái nổi bật
  const StatusDisplay = () => {
      const statusMap = {
          idle: { text: "Sẵn sàng để bắt đầu!", icon: <Replay />, color: "secondary.main" },
          listening_normal: { text: "Bước 1: Nghe với tốc độ thường...", icon: <Hearing />, color: "info.main" },
          listening_slow: { text: "Bước 1: Nghe chậm để thấm...", icon: <Hearing />, color: "info.main" },
          speaking: { text: "Bước 2: Mời bạn nói!", icon: <Mic />, color: "error.main" },
          feedback: { text: "Bước 3: Xem kết quả của bạn!", icon: <RateReview />, color: "success.main" },
      };
      const currentStatus = statusMap[practiceStep];
      return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: 'primary.contrastText', borderRadius: 2, mb: 2, border: '1px solid', borderColor: currentStatus.color }}>
              {React.cloneElement(currentStatus.icon, { style: { color: currentStatus.color } })}
              <Typography variant="h6" sx={{ color: currentStatus.color, fontWeight: 'medium' }}>{currentStatus.text}</Typography>
          </Box>
      );
  }

  const renderActionButton = () => {
    if (practiceStep === "feedback") {
      const isMastered = score !== null && score >= MASTERY_SCORE;
      return (
        <Box display="flex" gap={1} mt={2}>
          <Button variant="outlined" onClick={startPracticeLoop}> <Replay sx={{ mr: 1 }} /> Luyện lại </Button>
          <Button variant="contained" color="success" onClick={handleNext} disabled={!isMastered}> <CheckCircle sx={{ mr: 1 }} /> Tiếp tục </Button>
        </Box>
      );
    }
    const isPracticing = practiceStep !== "idle";
    return (
      <Box mt={2}>
        <Button variant="contained" onClick={startPracticeLoop} disabled={isPracticing} size="large"> Bắt đầu Luyện </Button>
      </Box>
    );
  };
  
  return (
    <Box sx={{ border: "1px solid #eee", borderRadius: "16px", p: 3, bgcolor: "#fafafa", width: "90%", maxWidth: "800px", margin: "30px auto" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom> 🚀 Lộ trình Shadowing Thông minh </Typography>
      
      {/* ✨ UI: Hiển thị trạng thái mới */}
      <StatusDisplay />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button onClick={handlePrev} disabled={currentIndex === 0}><SkipPrevious /> Câu trước</Button>
        <Typography variant="caption">Câu {currentIndex + 1} / {data.transcript.length}</Typography>
        <Button onClick={handleNext} disabled={currentIndex === data.transcript.length - 1}>Câu sau <SkipNext /></Button>
      </Box>
      
      <Box sx={{ p: 2, border: "1px solid #ddd", borderRadius: "8px", mb: 2, bgcolor: 'white' }}>
          <Typography variant="h6" textAlign="center">"{currentLine.text}"</Typography>
      </Box>

      {/* ✨ UI: Hiển thị sóng âm khi đang ghi */}
      {isRecording && <Waveform />}

      <LinearProgress variant="determinate" value={((currentIndex + 1) / data.transcript.length) * 100} />

      <Box display="flex" justifyContent="center">
          {renderActionButton()}
      </Box>
      
      {userSpeech && <ResultDisplay spoken={userSpeech} expected={currentLine.text} />}
      {score !== null && <Typography variant="h5" fontWeight="bold" color="primary.main" mt={2}>Điểm tương đồng: {score}%</Typography>}
    </Box>
  );
};