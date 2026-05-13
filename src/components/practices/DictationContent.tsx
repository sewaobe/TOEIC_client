import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  PlayArrow as PlayIcon,
  Replay as ReplayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  RestartAlt as RestartIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import HelpIcon from "@mui/icons-material/Help";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Typography,
  Slider,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Alert,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Dictation, DictationAttemptLog } from "../../types/Dictation";
import { toast } from "sonner";
import { dictationAttemptService } from "../../services/dictation_attempt.service";
import { useNavigate } from "react-router-dom";
import PracticeCompletionCard from "../flashCard/PracticeCompletionCard";
import geminiService from "../../services/gemini.service";
import DictationAIAnalysis from "./DictationAIAnalysis";
import SentenceRenderer from "./SetenceRenderer";
import { loadStopWords } from "../../utils/stopWord";
import DictationTourGuide from "../tour-guide/DictationTourGuide";
import {
  calculateWordSimilarity,
  normalizeForDictation,
  tokenizeForDictation,
} from "../../utils/textSimilarity.util";

/* ===== Types ===== */
type Difficulty = "easy" | "medium" | "hard";

interface DictationContentProps {
  dictation: Dictation;
  initialDifficulty?: Difficulty;
}

export interface DictationWord {
  word: string;
  isBlank: boolean;
  index: number;
}

/* ===== Helpers ===== */
const getBlankRatio = (level: Difficulty): number =>
  level === "easy" ? 0.2 : level === "hard" ? 0.55 : 0.35;

const splitWords = (text: string): string[] =>
  text.split(/\s+/).filter(Boolean);

const normalizeToken = (value: string): string => normalizeForDictation(value);

type TokenComparison = {
  correctTokens: string[];
  userTokens: string[];
  correctMatches: boolean[];
  userMatches: boolean[];
};

type EvaluationResult = TokenComparison & {
  accuracy: number;
  mistakes: string[];
};

const emptyEvaluation: EvaluationResult = {
  accuracy: 0,
  mistakes: [],
  correctTokens: [],
  userTokens: [],
  correctMatches: [],
  userMatches: [],
};

const compareTokensByPosition = (
  correctTokens: string[],
  userTokens: string[]
): TokenComparison => {
  const correctMatches = correctTokens.map((token, i) => {
    const userToken = userTokens[i];
    if (!userToken) return false;
    return normalizeToken(token) === normalizeToken(userToken);
  });

  const userMatches = userTokens.map((token, i) => {
    const correctToken = correctTokens[i];
    if (!correctToken) return false;
    return normalizeToken(token) === normalizeToken(correctToken);
  });

  return { correctTokens, userTokens, correctMatches, userMatches };
};

const alignTokens = (
  correctTokens: string[],
  userTokens: string[]
): TokenComparison => {
  const rows = userTokens.length + 1;
  const cols = correctTokens.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = userTokens[i - 1] === correctTokens[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  const correctMatches = Array(correctTokens.length).fill(false);
  const userMatches = Array(userTokens.length).fill(false);
  let i = userTokens.length;
  let j = correctTokens.length;

  while (i > 0 || j > 0) {
    const canSubstitute = i > 0 && j > 0;
    const substitutionCost =
      canSubstitute && userTokens[i - 1] === correctTokens[j - 1] ? 0 : 1;

    if (
      canSubstitute &&
      dp[i][j] === dp[i - 1][j - 1] + substitutionCost
    ) {
      if (substitutionCost === 0) {
        userMatches[i - 1] = true;
        correctMatches[j - 1] = true;
      }
      i -= 1;
      j -= 1;
      continue;
    }

    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      userMatches[i - 1] = false;
      i -= 1;
      continue;
    }

    if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      correctMatches[j - 1] = false;
      j -= 1;
    }
  }

  return { correctTokens, userTokens, correctMatches, userMatches };
};

const buildEasyEvaluation = (
  sentence: { words: DictationWord[] },
  userAnswers: Record<number, string>
): EvaluationResult => {
  const correctTokens = sentence.words.map((w) => w.word);
  const userTokens = splitWords(userAnswers[0] || "");
  const comparison = compareTokensByPosition(correctTokens, userTokens);
  const correct = comparison.correctMatches.filter(Boolean).length;
  const accuracy = correctTokens.length
    ? Math.round((correct / correctTokens.length) * 100)
    : 0;
  const mistakes = correctTokens.filter((_, i) => !comparison.correctMatches[i]);

  return { ...comparison, accuracy, mistakes };
};

const buildMediumEvaluation = (
  sentence: { words: DictationWord[] },
  userAnswers: Record<number, string>,
  blankIndices: number[]
): EvaluationResult => {
  const correctTokens = sentence.words.map((w) => w.word);
  const userTokens = sentence.words.map((w) =>
    w.isBlank ? userAnswers[w.index] || "" : w.word
  );
  const correctMatches = sentence.words.map((w) =>
    !w.isBlank
      ? true
      : normalizeToken(userAnswers[w.index] || "") === normalizeToken(w.word)
  );
  const userMatches = [...correctMatches];
  const correct = blankIndices.reduce((sum, i) => {
    const isCorrect =
      normalizeToken(userAnswers[i] || "") ===
      normalizeToken(sentence.words[i].word);
    return sum + (isCorrect ? 1 : 0);
  }, 0);
  const accuracy = blankIndices.length
    ? Math.round((correct / blankIndices.length) * 100)
    : 0;
  const mistakes = blankIndices
    .filter(
      (i) =>
        normalizeToken(userAnswers[i] || "") !==
        normalizeToken(sentence.words[i].word)
    )
    .map((i) => sentence.words[i].word);

  return {
    correctTokens,
    userTokens,
    correctMatches,
    userMatches,
    accuracy,
    mistakes,
  };
};

const buildHardEvaluation = (
  sentence: { text: string },
  userAnswers: Record<number, string>
): EvaluationResult => {
  const displayCorrectTokens = splitWords(sentence.text);
  const displayUserTokens = splitWords(userAnswers[0] || "");
  const normalizedCorrectTokens = tokenizeForDictation(sentence.text);
  const normalizedUserTokens = tokenizeForDictation(userAnswers[0] || "");
  const comparison = alignTokens(normalizedCorrectTokens, normalizedUserTokens);
  const useDisplayTokens =
    displayCorrectTokens.length === normalizedCorrectTokens.length &&
    displayUserTokens.length === normalizedUserTokens.length;
  const correctTokens = useDisplayTokens
    ? displayCorrectTokens
    : normalizedCorrectTokens;
  const userTokens = useDisplayTokens
    ? displayUserTokens
    : normalizedUserTokens;
  const accuracy = calculateWordSimilarity(sentence.text, userAnswers[0] || "");
  const isExact =
    normalizeForDictation(userAnswers[0] || "") ===
    normalizeForDictation(sentence.text);
  const mistakes = isExact ? [] : ["Câu chưa chính xác"];

  return {
    ...comparison,
    correctTokens,
    userTokens,
    accuracy,
    mistakes,
  };
};

const buildWords = async (
  text: string,
  ratio: number
): Promise<DictationWord[]> => {
  const stopWords = await loadStopWords();
  const parts = text.split(/\s+/);
  const total = parts.length;

  const candidates = parts
    .map((word, i) => {
      const norm = word.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
      return { word, norm, index: i };
    })
    .filter(({ norm }) => !stopWords.has(norm) && norm.length >= 4)
    .map(({ index }) => index);

  const blanks = new Set<number>();
  const blankCount = Math.max(1, Math.floor(total * ratio));

  while (blanks.size < blankCount && candidates.length > 0) {
    const randIdx = Math.floor(Math.random() * candidates.length);
    blanks.add(candidates[randIdx]);
    candidates.splice(randIdx, 1);
  }

  return parts.map((word, i) => ({
    word,
    index: i,
    isBlank: blanks.has(i),
  }));
};

const getSegmentBounds = (
  segment: Dictation["timings"][number],
  fallbackDuration?: number,
  audioDuration?: number
) => {
  const start = Math.max(0, segment.startTime ?? 0);
  const fallbackEnd =
    typeof fallbackDuration === "number" && fallbackDuration > start
      ? fallbackDuration
      : typeof audioDuration === "number" &&
        Number.isFinite(audioDuration) &&
        audioDuration > start
        ? audioDuration
        : start;
  const end = segment.endTime > start ? segment.endTime : fallbackEnd;

  return {
    start,
    end,
    duration: Math.max(end - start, 0),
  };
};

const PASS_THRESHOLD: Record<Difficulty, number> = {
  easy: 100,
  medium: 100,
  hard: 85,
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

const isPassedAccuracy = (difficulty: Difficulty, accuracy: number): boolean => {
  return accuracy >= PASS_THRESHOLD[difficulty];
};

/* ===== Component ===== */
export default function DictationContent({
  dictation,
  initialDifficulty = "hard",
}: DictationContentProps) {
  // Dictation UI: force single mode (full-sentence input)
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [sentences, setSentences] = useState<
    { id: number; text: string; words: DictationWord[] }[]
  >([]);
  const [loadingSentences, setLoadingSentences] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [autoNext, setAutoNext] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [anchorSpeed, setAnchorSpeed] = useState<null | HTMLElement>(null);
  const [completed, setCompleted] = useState(0);
  const [progress, setProgress] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [attemptLogs, setAttemptLogs] = useState<DictationAttemptLog[]>([]);
  const [openComplete, setOpenComplete] = useState(false);
  const [summary, setSummary] = useState({
    accuracy: 0,
    total: 0,
    avgTime: 0,
    logs: [] as DictationAttemptLog[],
  });
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isRunGuide, setIsRunGuide] = useState<boolean>(() => {
    return localStorage.getItem("dictation_tour_seen") !== "true";
  });

  useEffect(() => {
    setDifficulty(initialDifficulty);
  }, [initialDifficulty, dictation._id]);

  /* ===== Load sentences with stopwords filter ===== */
  useEffect(() => {
    let isMounted = true;
    const build = async () => {
      setLoadingSentences(true);
      const ratio = getBlankRatio(difficulty);
      const results = await Promise.all(
        (dictation.timings || []).map(async (seg, i) => ({
          id: i + 1,
          text: seg.text,
          words: await buildWords(seg.text, ratio),
        }))
      );
      if (isMounted) {
        setSentences(results);
        setLoadingSentences(false);
      }
    };
    build();
    return () => {
      isMounted = false;
    };
  }, [dictation, difficulty]);

  const totalItems = sentences.length;
  const currentItem = sentences[currentIndex];
  const currentSegment = dictation.timings?.[currentIndex];
  const blankIndices =
    currentItem?.words.filter((w) => w.isBlank).map((w) => w.index) || [];

  /* ===== Audio Logic ===== */
  const handlePlay = useCallback(() => {
    if (!dictation.audio_url || !currentSegment) return;

    const audioSrc = dictation.audio_url;
    let audio = audioRef.current;

    if (!audio || audio.getAttribute("src") !== audioSrc) {
      audio?.pause();
      audio = new Audio(audioSrc);
      audioRef.current = audio;
    }

    audioRef.current = audio;

    const { start, end, duration } = getSegmentBounds(
      currentSegment,
      dictation.duration,
      audio.duration
    );

    if (duration <= 0) return;

    audio.pause();
    audio.ontimeupdate = null;
    audio.onended = null;
    audio.currentTime = start;
    audio.playbackRate = playbackRate;
    setIsPlaying(true);
    setProgress(0);

    const onTime = () => {
      const current = audio.currentTime;
      if (current >= end) {
        audio.pause();
        setIsPlaying(false);
        setProgress(100);
        audio.ontimeupdate = null;
        audio.onended = null;
        return;
      }
      const p = ((current - start) / duration) * 100;
      setProgress(p);
    };

    audio.ontimeupdate = onTime;
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(100);
      audio.ontimeupdate = null;
      audio.onended = null;
    };
    audio.play().catch(() => {
      setIsPlaying(false);
      audio.ontimeupdate = null;
      audio.onended = null;
    });
  }, [dictation.audio_url, dictation.duration, currentSegment, playbackRate]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.ontimeupdate = null;
        audioRef.current.onended = null;
        audioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!dictation.audio_url || !currentSegment) return;
    if (isRunGuide) return;
    handlePlay();
    setStartedAt(Date.now());
  }, [currentIndex, isRunGuide]); // nhớ thêm isRunGuide vào deps

  /* ===== Logic ===== */
  const handleWordChange = (index: number, value: string) =>
    setUserAnswers((prev) => ({ ...prev, [index]: value }));

  const evaluation = useMemo(() => {
    if (!currentItem) return emptyEvaluation;

    if (difficulty === "medium") {
      return buildMediumEvaluation(currentItem, userAnswers, blankIndices);
    }

    if (difficulty === "easy") {
      return buildEasyEvaluation(currentItem, userAnswers);
    }

    return buildHardEvaluation(currentItem, userAnswers);
  }, [blankIndices, currentItem, difficulty, userAnswers]);

  /* ===== Check logic ===== */
  const handleCheck = () => {
    const { accuracy: acc, mistakes } = evaluation;
    setShowAnswer(true);
    const finishedAt = Date.now();
    const duration = Math.round((finishedAt - startedAt) / 1000);

    const newLog: DictationAttemptLog = {
      index: currentIndex,
      accuracy: acc,
      answers: { ...userAnswers },
      difficulty,
      mistakes,
      duration,
      started_at: new Date(startedAt).toISOString(),
      finished_at: new Date(finishedAt).toISOString(),
    };
    setAttemptLogs((prev) => [...prev, newLog]);

    if (isPassedAccuracy(difficulty, acc)) {
      setCompleted((prev) => Math.min(prev + 1, totalItems));

      if (autoNext && currentIndex < totalItems - 1) {
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
          setShowAnswer(false);
          setUserAnswers({});
          setProgress(0);
          setStartedAt(Date.now());
        }, 1200);
      }
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setShowAnswer(false);
    setProgress(0);
    setStartedAt(Date.now());
  };

  const handleNext = () => {
    const acc = evaluation.accuracy;

    if (isPassedAccuracy(difficulty, acc) && currentIndex < totalItems - 1) {
      setCurrentIndex((i) => i + 1);
      setShowAnswer(false);
      setUserAnswers({});
      setProgress(0);
      setStartedAt(Date.now());
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setShowAnswer(false);
      setUserAnswers({});
      setProgress(0);
      setStartedAt(Date.now());
    }
  };

  const allFilled =
    difficulty === "medium"
      ? blankIndices.every((i) => (userAnswers[i] || "").trim())
      : (userAnswers[0] || "").trim().length > 0;

  const overallProgress = Math.round((completed / totalItems) * 100);
  const accuracy = evaluation.accuracy;

  const handleSubmit = async () => {
    try {
      await toast.promise(
        dictationAttemptService.createDictationAttempts(
          attemptLogs,
          dictation._id
        ),
        {
          loading: "Đang lưu kết quả luyện tập...",
          success: "Lưu kết quả luyện tập thành công!",
        }
      );

      const total = attemptLogs.length;
      const accuracy = Math.round(
        attemptLogs.reduce((sum, log) => sum + (log.accuracy || 0), 0) / total
      );
      const avgTime = Math.round(
        attemptLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / total
      );

      setSummary({ accuracy, total, avgTime, logs: attemptLogs });
      setOpenComplete(true);
    } catch {
      toast.error("Có lỗi xảy ra khi lưu kết quả luyện tập.");
    }
  };

  const handleAnalyzeWithAI = async () => {
    try {
      setLoadingAI(true);
      toast.loading("Đang phân tích bài luyện với AI...");
      const result = await geminiService.analyzeDictation(summary.logs, {
        _id: dictation._id,
        title: dictation.title,
        level: dictation.level,
      });
      toast.dismiss();
      toast.success("AI đã hoàn tất phân tích 🎉");
      setAiAnalysis(result);
    } catch {
      toast.dismiss();
      toast.error("Không thể phân tích bằng AI, vui lòng thử lại.");
    } finally {
      setLoadingAI(false);
    }
  };

  /* ===== Loading UI ===== */
  if (loadingSentences)
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h6" color="text.secondary">
          Đang chuẩn bị bài luyện tập...
        </Typography>
      </Box>
    );

  /* ===== AI result ===== */
  if (aiAnalysis) {
    return (
      <DictationAIAnalysis
        loading={loadingAI}
        analysis={aiAnalysis}
        onConfirm={() => window.location.reload()}
      />
    );
  }

  /* ===== Main UI ===== */
  if (!totalItems)
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h5" color="text.secondary">
          Chưa có bài luyện tập nào
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        p: 4,
        width: "min(980px, 95%)",
        mx: "auto",
        minHeight: "calc(100vh - 100px)",
        overflowY: "auto",
      }}
    >
      {/* Tour Guide */}
      <DictationTourGuide isRun={isRunGuide} />

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        className="dictation-header"
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="#2563eb">
            {dictation.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Luyện nghe chép chính tả · {dictation.level || "—"} · {totalItems}{" "}
            câu
          </Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          className="dictation-progress"
        >
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
              animation:
                completed >= totalItems
                  ? "gradientShift 4s ease infinite"
                  : "none",
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
        className="dictation-audio"
      >
        <IconButton onClick={handlePlay} sx={{ color: "#fff" }}>
          {isPlaying ? <ReplayIcon /> : <PlayIcon />}
        </IconButton>

        <Slider
          min={0}
          max={100}
          value={progress}
          onChange={(_, newValue) => {
            if (!audioRef.current || !currentSegment) return;
            const { start, duration } = getSegmentBounds(
              currentSegment,
              dictation.duration,
              audioRef.current.duration
            );
            if (duration <= 0) return;
            const newTime = start + ((newValue as number) / 100) * duration;
            audioRef.current.currentTime = newTime;
            setProgress(newValue as number);
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

        <Menu
          anchorEl={anchorSpeed}
          open={Boolean(anchorSpeed)}
          onClose={() => setAnchorSpeed(null)}
        >
          {[0.75, 1, 1.25, 1.5].map((r) => (
            <MenuItem
              key={r}
              selected={playbackRate === r}
              onClick={() => {
                setPlaybackRate(r);
                setAnchorSpeed(null);
              }}
            >
              {r}x
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Mode: fixed to full-sentence (người dùng nhập nguyên câu) */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        className="dictation-difficulty"
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Chế độ:
          </Typography>
          <Chip
            size="small"
            label={DIFFICULTY_LABEL[difficulty]}
            sx={{
              fontWeight: 700,
              backgroundColor: "#eff6ff",
              color: "#2563eb",
            }}
          />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Checkbox
            size="small"
            checked={autoNext}
            onChange={(e) => setAutoNext(e.target.checked)}
          />
          <Typography variant="body2">Tự động chuyển câu</Typography>
          <IconButton
            onClick={() => {
              localStorage.setItem("dictation_tour_seen", "false");
              setIsRunGuide(false); // tắt trước
              setTimeout(() => setIsRunGuide(true), 150); // bật lại sau 150ms
            }}
            size="small"
            sx={{
              color: "#2563eb",
              backgroundColor: "rgba(37,99,235,0.1)",
              "&:hover": {
                backgroundColor: "rgba(37,99,235,0.2)",
              },
            }}
          >
            <HelpIcon />
          </IconButton>
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
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1,
                }}
                className="dictation-sentence"
              >
                <Box sx={{ width: "100%" }}>
                  <SentenceRenderer
                    mode={difficulty}
                    sentence={currentItem}
                    userAnswers={userAnswers}
                    onChange={handleWordChange}
                    showAnswer={showAnswer}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <Box display="flex" justifyContent="center" gap={1} mb={2}>
        <Button
          variant="outlined"
          startIcon={<ChevronLeftIcon />}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Trước
        </Button>

        {!showAnswer ? (
          <Button
            variant="contained"
            onClick={handleCheck}
            disabled={!allFilled}
            className="dictation-check"
          >
            Kiểm tra
          </Button>
        ) : isPassedAccuracy(difficulty, accuracy) ? (
          <Button
            variant="contained"
            color="success"
            endIcon={<ChevronRightIcon />}
            onClick={() => {
              if (currentIndex >= totalItems - 1) handleSubmit();
              else handleNext();
            }}
          >
            {currentIndex >= totalItems - 1 ? "Hoàn thành" : "Tiếp theo"}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<RestartIcon />}
            onClick={handleRetry}
          >
            Làm lại câu này
          </Button>
        )}
      </Box>

      {/* Feedback */}
      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {isPassedAccuracy(difficulty, accuracy) ? (
              <Alert
                icon={<CheckCircleIcon />}
                severity="success"
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Tuyệt vời! Bạn đã nghe chính xác toàn bộ câu này.
              </Alert>
            ) : (
              <Alert
                icon={<ErrorIcon />}
                severity="warning"
                sx={{ mt: 1, borderRadius: 2 }}
              >
                Bạn đạt khoảng {accuracy}%. Nghe lại đoạn này và sửa những phần còn sai nhé.
              </Alert>
            )}
            {/* Hiển thị kết quả chi tiết người dùng nhập & transcript */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                backgroundColor: "#f9fafb",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
              >
                Đáp án của người dùng:
              </Typography>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  mt: 0.5,
                  color: "text.primary",
                  backgroundColor: "#fff",
                  borderRadius: 1,
                  p: 1.2,
                  border: "1px solid #e5e7eb",
                  fontStyle: userAnswers[0] ? "normal" : "italic",
                }}
              >
                {difficulty === "medium" ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {currentItem.words.map((w) => {
                      const isBlank = w.isBlank;
                      const userWord = userAnswers[w.index] || "";
                      const isCorrect = evaluation.correctMatches[w.index] ?? false;
                      const displayWord = isBlank ? userWord || "____" : w.word;

                      return (
                        <Box
                          component="span"
                          key={w.index}
                          sx={{
                            px: 0.5,
                            borderRadius: 0.75,
                            backgroundColor: isBlank
                              ? isCorrect
                                ? "#dcfce7"
                                : "#fee2e2"
                              : "transparent",
                            color: isBlank
                              ? isCorrect
                                ? "#166534"
                                : "#991b1b"
                              : "text.primary",
                            fontWeight: isBlank ? 700 : 500,
                          }}
                        >
                          {displayWord}
                        </Box>
                      );
                    })}
                  </Box>
                ) : evaluation.userTokens.length ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {evaluation.userTokens.map((word, i) => {
                      const isCorrect = evaluation.userMatches[i] === true;
                      return (
                        <Box
                          component="span"
                          key={`${word}-${i}`}
                          sx={{
                            px: 0.5,
                            borderRadius: 0.75,
                            backgroundColor: isCorrect ? "#dcfce7" : "#fee2e2",
                            color: isCorrect ? "#166534" : "#991b1b",
                            fontWeight: 700,
                          }}
                        >
                          {word}
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  "(Chưa nhập nội dung)"
                )}
              </Typography>

              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Transcript gốc:
              </Typography>
              <Typography
                variant="body1"
                component="div"
                sx={{
                  mt: 0.5,
                  color: "#1e3a8a",
                  backgroundColor: "#eef2ff",
                  borderRadius: 1,
                  p: 1.2,
                  border: "1px solid #c7d2fe",
                }}
              >
                {difficulty === "medium" ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {currentItem.words.map((w) => {
                      const isBlank = w.isBlank;
                      const isCorrect = evaluation.correctMatches[w.index] ?? false;
                      const displayWord = w.word;

                      return (
                        <Box
                          component="span"
                          key={`${w.word}-${w.index}`}
                          sx={{
                            px: 0.5,
                            borderRadius: 0.75,
                            backgroundColor: isBlank
                              ? isCorrect
                                ? "#dcfce7"
                                : "#fee2e2"
                              : "transparent",
                            color: isBlank
                              ? isCorrect
                                ? "#166534"
                                : "#991b1b"
                              : "#1e3a8a",
                            fontWeight: isBlank ? 700 : 500,
                          }}
                        >
                          {displayWord}
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {evaluation.correctTokens.map((word, i) => {
                      const isCorrect = evaluation.correctMatches[i] === true;
                      return (
                        <Box
                          component="span"
                          key={`${word}-${i}`}
                          sx={{
                            px: 0.5,
                            borderRadius: 0.75,
                            backgroundColor: isCorrect ? "#dcfce7" : "#fee2e2",
                            color: isCorrect ? "#166534" : "#991b1b",
                            fontWeight: 700,
                          }}
                        >
                          {word}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Typography>
            </Box>
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
  );
}
