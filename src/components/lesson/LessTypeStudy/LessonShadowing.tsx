import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic as MicIcon,
  VolumeUp as VolumeIcon,
  Hearing as HearingIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ReplayIcon,
  RecordVoiceOver as RecordIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Stop as StopIcon,
  Send as SendIcon,
  GraphicEq as WaveIcon,
  FastForward as FastForwardIcon,
} from "@mui/icons-material";
import confetti from "canvas-confetti";
import {
  Box,
  Button,
  Typography,
  Card,
  Container,
  IconButton,
  Stack,
  LinearProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Shadowing } from "../../../types/Shadowing";
import { uploadAuto } from "../../../services/cloudinary.service";
import geminiService from "../../../services/gemini.service";
import { learningPathActivityService } from "../../../services/learningPathActivity.service";
import { toast } from "sonner";

interface ShadowingContentProps {
  lesson: Shadowing;
  dayStudyId?: string;
  onSubmitted?: () => void;
}
type Stage = "preview" | "listening" | "speaking" | "feedback" | "finished";

const TestMicStep = ({ onMicReady }: { onMicReady: (ok: boolean) => void }) => {
  const visualizerRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isMicReady, setIsMicReady] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMicTest = async () => {
    setIsTesting(true);
    setMicError(null);
    setRecordedBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = visualizerRef.current;
      const ctx = canvas?.getContext("2d");
      const WIDTH = canvas!.width;
      const HEIGHT = canvas!.height;
      let rings: { radius: number; alpha: number }[] = [];

      const draw = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / bufferLength;
        const intensity = avg / 255;
        if (intensity > 0.05)
          rings.push({ radius: 10 + intensity * 40, alpha: 0.7 });
        rings.forEach((r) => {
          r.radius += 2 + intensity * 6;
          r.alpha -= 0.015;
          const g = ctx.createRadialGradient(
            WIDTH / 2,
            HEIGHT / 2,
            0,
            WIDTH / 2,
            HEIGHT / 2,
            r.radius
          );
          g.addColorStop(0, `rgba(99,102,241,${r.alpha})`);
          g.addColorStop(1, `rgba(14,165,233,0)`);
          ctx.beginPath();
          ctx.arc(WIDTH / 2, HEIGHT / 2, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = g;
          ctx.lineWidth = 3;
          ctx.stroke();
        });
        rings = rings.filter((r) => r.alpha > 0);
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setRecordedBlob(blob);
        setIsMicReady(true);
        setIsTesting(false);
        cancelAnimationFrame(animationRef.current!);
        audioContext.close();
        onMicReady(true);
      };
      recorder.start();
      setTimeout(() => recorder.stop(), 3000);
    } catch {
      setMicError(
        "⚠️ Không thể truy cập micro. Hãy cấp quyền cho trình duyệt."
      );
      setIsTesting(false);
      onMicReady(false);
    }
  };

  const handlePlayRecorded = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const audio = new Audio(url);
    setIsPlaying(true);
    audio.play();
    audio.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        sx={{
          p: 4,
          borderRadius: 4,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.8)",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" mb={2} fontWeight="bold">
          🎤 Kiểm tra micro của bạn
        </Typography>
        {isTesting ? (
          <>
            <canvas
              ref={visualizerRef}
              width={280}
              height={280}
              style={{
                background:
                  "radial-gradient(circle at center, #f0f9ff, #e0f2fe)",
                borderRadius: "50%",
                margin: "auto",
                marginBottom: "16px",
              }}
            />
            <Typography color="text.secondary">
              Đang ghi âm... hãy nói vài từ 🎧
            </Typography>
          </>
        ) : (
          <Button
            onClick={handleMicTest}
            startIcon={<MicIcon />}
            variant="contained"
            sx={{
              mt: 1,
              background: "linear-gradient(90deg,#6366f1,#3b82f6)",
              fontWeight: 600,
              borderRadius: 3,
            }}
          >
            Kiểm tra micro
          </Button>
        )}

        {isMicReady && (
          <Box mt={3}>
            <Typography color="success.main" mb={1}>
              ✅ Micro hoạt động tốt!
            </Typography>
            <Button
              onClick={handlePlayRecorded}
              startIcon={<HearingIcon />}
              disabled={!recordedBlob || isPlaying}
              variant="outlined"
            >
              {isPlaying ? "Đang phát lại..." : "Nghe lại giọng tôi"}
            </Button>
          </Box>
        )}
        {micError && (
          <Typography color="error.main" mt={2}>
            {micError}
          </Typography>
        )}
      </Card>
    </motion.div>
  );
};

const ListeningStep = ({
  segText,
  segment,
  audioRef,
  onFinished,
}: {
  segText: string;
  segment: { start: number; end: number };
  audioRef: React.RefObject<HTMLAudioElement>;
  onFinished: () => void;
}) => {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const words = segText.split(" ");
  const duration = segment.end - segment.start;

  const playSegment = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = segment.start;
    audio.play();
    setIsPlaying(true);
    setIsEnded(false);
  };
  const pauseAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let rafId: number;
    const update = () => {
      const current = audio.currentTime - segment.start;
      if (current >= duration || audio.currentTime >= segment.end) {
        setIsEnded(true);
        setIsPlaying(false);
        setProgress(duration);
        audio.pause();
      } else {
        setProgress(current);
        rafId = requestAnimationFrame(update);
      }
    };
    if (isPlaying) rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const currentWord = Math.floor((progress / duration) * words.length);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
        <Typography
          color="primary"
          fontWeight="bold"
          mb={2}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <WaveIcon /> Nghe người bản ngữ
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1.5,
            mb: 2,
          }}
        >
          {words.map((w, i) => (
            <motion.span
              key={i}
              animate={{
                color: i === currentWord ? "#2563eb" : "#475569",
                scale: i === currentWord ? 1.2 : 1,
              }}
              transition={{ type: "spring", stiffness: 200 }}
              style={{
                fontWeight: i === currentWord ? 700 : 400,
                fontSize: i === currentWord ? 20 : 18,
              }}
            >
              {w}
            </motion.span>
          ))}
        </Box>
        {!isPlaying ? (
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={playSegment}
            sx={{
              px: 3,
              py: 1,
              background: "linear-gradient(90deg,#6366f1,#3b82f6)",
            }}
          >
            {isEnded ? "Nghe lại" : "Phát"}
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<PauseIcon />}
            onClick={pauseAudio}
          >
            Tạm dừng
          </Button>
        )}

        {isEnded && (
          <Button
            variant="contained"
            color="success"
            sx={{ ml: 2 }}
            endIcon={<ArrowForwardIcon />}
            onClick={onFinished}
          >
            Tiếp tục luyện nói
          </Button>
        )}
      </Card>
    </motion.div>
  );
};

const SpeakingStep = ({
  onSubmit,
  onAnalyze,
}: {
  onSubmit: (b: Blob) => void;
  onAnalyze: (b: Blob) => Promise<void>;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const animationRef = useRef<number | null>(null);

  const handleToggleRecording = async () => {
    if (isRecording) {
      recorderRef.current?.stop();
      setIsRecording(false);
      setHasRecorded(true);
      cancelAnimationFrame(animationRef.current!);
      audioContextRef.current?.close();
      return;
    }
    setRecordedBlob(null);
    setHasRecorded(false);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () =>
      setRecordedBlob(new Blob(chunks, { type: "audio/webm" }));
    recorder.start();
    setIsRecording(true);

    const audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioContextRef.current = audioCtx;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const W = canvas!.width;
    const H = canvas!.height;
    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);
      ctx!.clearRect(0, 0, W, H);
      const grad = ctx!.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#eef2ff");
      grad.addColorStop(1, "#e0f2fe");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);
      ctx!.beginPath();
      ctx!.lineWidth = 2;
      ctx!.strokeStyle = "#3b82f6";
      const sliceWidth = W / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
        x += sliceWidth;
      }
      ctx!.lineTo(W, H / 2);
      ctx!.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const handlePlay = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const audio = new Audio(url);
    setIsPlaying(true);
    audio.play();
    audio.onended = () => {
      setIsPlaying(false);
      URL.revokeObjectURL(url);
    };
  };

  const handleRetry = () => {
    setRecordedBlob(null);
    setHasRecorded(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <motion.div
            animate={
              isRecording
                ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
          >
            <IconButton
              onClick={handleToggleRecording}
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                color: "white",
                background: isRecording
                  ? "linear-gradient(145deg,#ef4444,#dc2626)"
                  : "linear-gradient(145deg,#6366f1,#3b82f6)",
                boxShadow: isRecording
                  ? "0 0 30px rgba(239,68,68,0.5)"
                  : "0 0 20px rgba(99,102,241,0.4)",
              }}
            >
              {isRecording ? (
                <StopIcon fontSize="large" />
              ) : (
                <MicIcon fontSize="large" />
              )}
            </IconButton>
          </motion.div>
        </Box>

        <canvas
          ref={canvasRef}
          width={340}
          height={120}
          style={{
            display: "block",
            margin: "auto",
            borderRadius: 12,
            background: "linear-gradient(180deg,#f8fafc,#e0f2fe)",
            boxShadow: "0 0 12px rgba(37,99,235,0.15)",
          }}
        />

        {!hasRecorded && (
          <Typography mt={2} color="text.secondary">
            {isRecording
              ? "Đang thu âm... Ấn dừng khi bạn nói xong 🎙️"
              : "Ấn mic để bắt đầu nói!"}
          </Typography>
        )}

        {hasRecorded && (
          <Stack direction="row" justifyContent="center" spacing={2} mt={3}>
            <Button
              variant="outlined"
              startIcon={<ReplayIcon />}
              onClick={handleRetry}
            >
              Làm lại
            </Button>
            <Button
              variant="contained"
              startIcon={<HearingIcon />}
              disabled={isPlaying}
              onClick={handlePlay}
            >
              {isPlaying ? "Đang phát..." : "Nghe lại"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              endIcon={<SendIcon />}
              onClick={() => recordedBlob && onSubmit(recordedBlob)}
            >
              Nộp nhanh
            </Button>
            <Button
              variant="contained"
              color="success"
              endIcon={<SendIcon />}
              onClick={() => recordedBlob && onAnalyze(recordedBlob)}
            >
              Nộp & Phân tích AI
            </Button>
          </Stack>
        )}
      </Card>
    </motion.div>
  );
};

const FeedbackStep = ({
  feedback,
  onNext,
}: {
  feedback: any;
  onNext: () => void;
}) => {
  if (!feedback) return null;
  const {
    similarity_score,
    accuracy_score,
    fluency_score,
    intonation_score,
    pronunciation_feedback,
    sentence_alignment,
    highlight_mistakes,
    comments,
    suggestions,
  } = feedback;
  const fmt = (v?: number) =>
    v !== undefined ? `${Math.round(v * 100)}%` : "—";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card
        sx={{
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(180deg,#eef2ff,#dbeafe)",
          boxShadow: "0 0 15px rgba(37,99,235,0.25)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
          💬 Kết quả phân tích từ AI
        </Typography>
        <Stack
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          spacing={2}
          flexWrap="wrap"
          sx={{ mb: 3 }}
        >
          {[
            {
              label: "Similarity",
              value: fmt(similarity_score),
              color: "#2563eb",
            },
            { label: "Accuracy", value: fmt(accuracy_score), color: "#9333ea" },
            { label: "Fluency", value: fmt(fluency_score), color: "#10b981" },
            {
              label: "Intonation",
              value: fmt(intonation_score),
              color: "#f59e0b",
            },
          ].map((item) => (
            <Box key={item.label} textAlign="center" mx={1}>
              <Typography fontWeight="bold" color={item.color}>
                {item.value}
              </Typography>
              <Typography variant="body2">{item.label}</Typography>
            </Box>
          ))}
        </Stack>
        {sentence_alignment && sentence_alignment.length > 0 && (
          <Box
            sx={{
              mt: 3,
              background: "#f9fafb",
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography fontWeight="bold" mb={1} color="primary.dark">
              📘 So sánh câu nói
            </Typography>
            {sentence_alignment.map((s: any, i: number) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: "#1e3a8a" }}>
                  <b>Native:</b> {s.native_sentence}
                </Typography>
                <Typography variant="body2" sx={{ color: "#0f766e" }}>
                  <b>User:</b> {s.user_sentence}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", ml: 2, mt: 0.5 }}
                >
                  🎯 Similarity: {fmt(s.sentence_similarity)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        {pronunciation_feedback && (
          <Box
            sx={{
              mt: 3,
              background: "#fff7ed",
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #fed7aa",
            }}
          >
            <Typography fontWeight="bold" mb={1} color="#b45309">
              🔤 Các lỗi phát âm
            </Typography>
            {pronunciation_feedback.mispronounced?.length > 0 && (
              <Typography>
                ❌ <b>Từ phát âm sai:</b>{" "}
                {pronunciation_feedback.mispronounced.join(", ")}
              </Typography>
            )}
            {pronunciation_feedback.missing_words?.length > 0 && (
              <Typography>
                ⚠️ <b>Từ bị bỏ sót:</b>{" "}
                {pronunciation_feedback.missing_words.join(", ")}
              </Typography>
            )}
            {pronunciation_feedback.extra_words?.length > 0 && (
              <Typography>
                💬 <b>Từ nói thừa:</b>{" "}
                {pronunciation_feedback.extra_words.join(", ")}
              </Typography>
            )}
          </Box>
        )}
        {highlight_mistakes && highlight_mistakes.length > 0 && (
          <Box
            sx={{
              mt: 3,
              background: "#faf5ff",
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #e9d5ff",
            }}
          >
            <Typography fontWeight="bold" mb={1} color="#7e22ce">
              💡 Cụm từ cần chú ý
            </Typography>
            {highlight_mistakes.map((h: any, i: number) => (
              <Box key={i} mb={1.2}>
                <Typography variant="body2">
                  <b>Native:</b> <i>{h.native_part}</i>
                </Typography>
                <Typography variant="body2" sx={{ color: "#1d4ed8" }}>
                  <b>User:</b> {h.user_part || "(bỏ qua)"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", ml: 2 }}
                >
                  📍 {h.reason}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        <Box mt={3}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="primary.dark"
          >
            🧠 Nhận xét tổng quan
          </Typography>
          <Typography color="text.secondary" mt={0.5}>
            {comments}
          </Typography>
        </Box>
        {suggestions && suggestions.length > 0 && (
          <Box mt={2}>
            <Typography fontWeight="bold" mb={1} color="success.main">
              ✅ Gợi ý cải thiện:
            </Typography>
            <ul style={{ textAlign: "left", display: "inline-block" }}>
              {suggestions.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Box>
        )}
        <Button
          variant="contained"
          sx={{ mt: 3, background: "linear-gradient(90deg,#10b981,#059669)" }}
          onClick={onNext}
        >
          Câu tiếp theo ➜
        </Button>
      </Card>
    </motion.div>
  );
};

const AnalyzingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    style={{
      position: "fixed",
      inset: 0,
      background:
        "linear-gradient(90deg, rgba(99,102,241,0.08) 0%, rgba(59,130,246,0.15) 50%, rgba(99,102,241,0.08) 100%)",
      backgroundSize: "200% 100%",
      animation: "slideBg 3s linear infinite",
      backdropFilter: "blur(8px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2500,
    }}
  >
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          color: "#1e3a8a",
          textShadow: "0 0 10px rgba(59,130,246,0.4)",
          mb: 3,
        }}
      >
        🤖 AI đang phân tích giọng nói của bạn...
      </Typography>
    </motion.div>
    <Box sx={{ width: "60%", maxWidth: 420 }}>
      <LinearProgress
        variant="indeterminate"
        sx={{
          height: 10,
          borderRadius: 5,
          background: "rgba(203,213,225,0.5)",
          "& .MuiLinearProgress-bar": {
            background:
              "linear-gradient(90deg,#6366f1,#3b82f6,#2563eb,#6366f1)",
            animation: "progressFlow 1.6s ease-in-out infinite",
          },
        }}
      />
    </Box>
    <motion.div
      animate={{ rotate: [0, 360] }}
      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      style={{ marginTop: 30 }}
    >
      <WaveIcon sx={{ fontSize: 48, color: "#3b82f6" }} />
    </motion.div>
    <style>{`@keyframes slideBg {0% { background-position: 200% 0; }100% { background-position: -200% 0; }} @keyframes progressFlow {0% { transform: translateX(-50%);}50% { transform: translateX(0%);}100% { transform: translateX(50%);} }`}</style>
  </motion.div>
);

const FinishedCelebration = ({ totalSegments }: { totalSegments: number }) => {
  useEffect(() => {
    const audio = new Audio("/audio/fireworks-07-419025.mp3");
    audio.volume = 0.3;
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    (function frame() {
      confetti({
        particleCount: 6,
        startVelocity: 35,
        spread: 70,
        ticks: 60,
        origin: { x: Math.random(), y: randomInRange(0.4, 0.8) },
        colors: ["#34d399", "#3b82f6", "#a855f7", "#f59e0b"],
      });
      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    })();
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);
  return (
    <motion.div
      key="finished"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 4,
          background: "linear-gradient(180deg,#ecfdf5,#d1fae5)",
          boxShadow: "0 0 15px rgba(16,185,129,0.25)",
          position: "relative",
        }}
      >
        <Typography
          color="success.main"
          fontWeight="bold"
          variant="h6"
          mb={1}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            fontSize: 22,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 32 }} /> Hoàn thành bài luyện tập!
        </Typography>
        <Typography color="text.secondary" fontSize={18}>
          Bạn đã luyện tập <b>{totalSegments}</b> câu trong bài này 🎯
        </Typography>
        <Typography color="success.main" mt={2} fontWeight="600">
          Tuyệt vời! Hãy tiếp tục duy trì phong độ nhé 💪
        </Typography>
      </Card>
    </motion.div>
  );
};

export default function LessonShadowing({
  lesson,
  dayStudyId,
  onSubmitted,
}: ShadowingContentProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [stage, setStage] = useState<Stage>("preview");
  const [feedback, setFeedback] = useState<any>(null);
  const [isMicReady, setIsMicReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const segments =
    lesson.timings.length > 0
      ? lesson.timings.map((s, i) => ({
          id: i,
          text: s.text,
          start: s.startTime / 1000,
          end: s.endTime / 1000,
        }))
      : [
          {
            id: 0,
            text: lesson.transcript,
            start: 0,
            end: (lesson.duration || 0) / 1000,
          },
        ];

  const totalSegments = segments.length;
  const currentSeg = segments[currentIndex];

  const handleNextSegment = () => {
    setFeedback(null);
    if (currentIndex < totalSegments - 1) {
      setCurrentIndex((i) => i + 1);
      setStage("listening");
    } else {
      setStage("finished");
    }
  };

  const handleAnalyze = async (blob: Blob) => {
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const userUrl = await uploadAuto(blob);
      const result = await geminiService.analyzeShadowing(
        userUrl,
        lesson.audio_url!,
        {
          level: lesson.level,
          segmentIndex: currentIndex,
          nativeStart: currentSeg.start,
          nativeEnd: currentSeg.end,
          shadowing: {
            _id: lesson._id,
            title: lesson.title,
            level: lesson.level,
          },
        }
      );
      setFeedback(result);
      setStage("feedback");
    } catch (err) {
      console.error(err);
      setFeedback({ error: "Lỗi khi phân tích bài nói. Vui lòng thử lại." });
      setStage("feedback");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitFast = (blob: Blob) => {
    uploadAuto(blob).then((url) => {
      console.log("Saved user audio:", url);
      handleNextSegment();
    });
  };

  useEffect(() => {
    if (stage === "finished" && !hasSubmitted && dayStudyId) {
      const payload = [
        {
          accuracy: 100,
          recorded_audio: "https://example.com/auto-submit-audio.mp3",
          duration: Math.round((lesson.duration || 0) / 1000),
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
        },
      ];
      learningPathActivityService
        .submitShadowing(lesson._id, payload, dayStudyId)
        .then(() => {
          onSubmitted?.();
          setHasSubmitted(true);
        })
        .catch((err) => {
          console.error("Submit shadowing learning path failed", err);
          toast.error("Khong the luu ket qua shadowing.");
        });
    }
  }, [dayStudyId, hasSubmitted, lesson, onSubmitted, stage]);

  return (
    <Box bgcolor="transparent">
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={1}>
          {lesson.title}
        </Typography>
        {stage !== "preview" && stage !== "finished" && (
          <Box mb={3}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography color="text.secondary">
                Câu {currentIndex + 1}/{totalSegments}
              </Typography>
              {dayStudyId && !hasSubmitted && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // Submit luôn với fake data
                    const payload = [
                      {
                        accuracy: 80,
                        recorded_audio: "",
                        duration: Math.round((lesson.duration || 0) / 1000),
                        started_at: new Date().toISOString(),
                        finished_at: new Date().toISOString(),
                      },
                    ];
                    learningPathActivityService
                      .submitShadowing(lesson._id, payload, dayStudyId)
                      .then(() => {
                        toast.success("Đã hoàn thành bài học shadowing!");
                        setHasSubmitted(true);
                        onSubmitted?.();
                      })
                      .catch((err) => {
                        console.error("Submit shadowing failed", err);
                        toast.error("Không thể lưu kết quả shadowing.");
                      });
                  }}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Bỏ qua và hoàn thành
                </Button>
              )}
            </Box>
            <LinearProgress
              variant="determinate"
              value={((currentIndex + 1) / totalSegments) * 100}
              sx={{
                height: 8,
                borderRadius: 3,
                background: "#e2e8f0",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg,#6366f1,#3b82f6)",
                },
              }}
            />
          </Box>
        )}
        <audio ref={audioRef} src={lesson.audio_url} preload="auto" />
        <AnimatePresence mode="wait">
          {stage === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TestMicStep onMicReady={setIsMicReady} />
              <Box textAlign="center" mt={3}>
                <Button
                  variant="contained"
                  disabled={!isMicReady}
                  startIcon={<PlayIcon />}
                  sx={{
                    px: 3,
                    py: 1.2,
                    borderRadius: 3,
                    fontWeight: 600,
                    background: "linear-gradient(90deg,#6366f1,#3b82f6)",
                  }}
                  onClick={() => setStage("listening")}
                >
                  Bắt đầu luyện tập
                </Button>
                {dayStudyId && !hasSubmitted && (
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      startIcon={<FastForwardIcon />}
                      sx={{
                        px: 3,
                        py: 1.2,
                        borderRadius: 3,
                        fontWeight: 600,
                        textTransform: "none",
                        borderColor: "#e2e8f0",
                        color: "#64748b",
                        "&:hover": {
                          borderColor: "#cbd5e1",
                          backgroundColor: "#f8fafc",
                        },
                      }}
                      onClick={() => {
                        // Submit luôn với fake data
                        const payload = [
                          {
                            accuracy: 80,
                            recorded_audio:
                              "https://example.com/skipped-audio.mp3",
                            duration: Math.round((lesson.duration || 0) / 1000),
                            started_at: new Date().toISOString(),
                            finished_at: new Date().toISOString(),
                          },
                        ];
                        learningPathActivityService
                          .submitShadowing(lesson._id, payload, dayStudyId)
                          .then(() => {
                            toast.success("Đã hoàn thành bài học shadowing!");
                            setHasSubmitted(true);
                            onSubmitted?.();
                          })
                          .catch((err) => {
                            console.error("Submit shadowing failed", err);
                            toast.error("Không thể lưu kết quả shadowing.");
                          });
                      }}
                    >
                      Bỏ qua bài học
                    </Button>
                  </Box>
                )}
              </Box>
            </motion.div>
          )}
          {stage === "listening" && (
            <ListeningStep
              key="listening"
              segText={currentSeg.text}
              segment={{ start: currentSeg.start, end: currentSeg.end }}
              audioRef={audioRef}
              onFinished={() => setStage("speaking")}
            />
          )}
          {stage === "speaking" && (
            <SpeakingStep
              key="speaking"
              onSubmit={handleSubmitFast}
              onAnalyze={handleAnalyze}
            />
          )}
          {isAnalyzing && <AnalyzingOverlay />}
          {stage === "feedback" && (
            <FeedbackStep
              key="feedback"
              feedback={feedback}
              onNext={handleNextSegment}
            />
          )}
          {stage === "finished" && (
            <>
              <FinishedCelebration totalSegments={totalSegments} />
              {dayStudyId && (
                <Box textAlign="center" mt={3}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      if (!hasSubmitted) {
                        const payload = [
                          {
                            accuracy: 100,
                            recorded_audio:
                              "https://example.com/completed-audio.mp3",
                            duration: Math.round((lesson.duration || 0) / 1000),
                            started_at: new Date().toISOString(),
                            finished_at: new Date().toISOString(),
                          },
                        ];
                        learningPathActivityService
                          .submitShadowing(lesson._id, payload, dayStudyId)
                          .then(() => {
                            onSubmitted?.();
                            setHasSubmitted(true);
                            toast.success("Đã hoàn thành bài học shadowing!");
                          })
                          .catch((err) => {
                            console.error(
                              "Submit shadowing learning path failed",
                              err
                            );
                            toast.error("Không thể lưu kết quả shadowing.");
                          });
                      } else {
                        onSubmitted?.();
                      }
                    }}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      background: "linear-gradient(90deg,#6366f1,#3b82f6)",
                    }}
                  >
                    {hasSubmitted ? "Tiếp tục" : "Hoàn thành bài học"}
                  </Button>
                </Box>
              )}
            </>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
}
