import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  IconButton,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Lightbulb,
  VolumeUp,
  Replay,
  EmojiEvents,
  Timer,
  LocalFireDepartment,
  Check,
  Close,
} from "@mui/icons-material";
import { FlashcardItem } from "../modals/CreateFlashcardItemModal";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface WordRecallGameProps {
  words: FlashcardItem[];
  onFinish: (
    result: WordRecallResult,
    startedAt: string,
    finishedAt: string
  ) => void;
  onBack: () => void;
}

export interface WordRecallResult {
  totalWords: number;
  correctWords: number;
  wrongWords: number;
  totalScore: number;
  accuracy: number;
  timeSpent: number;
  wrongList: { word: string; definition: string }[];
}

interface WordState {
  word: FlashcardItem;
  isCorrect: boolean | null;
  userAnswer: string;
  hintsUsed: number;
  timeSpent: number;
}

const TIME_LIMIT = 30; // 30 giây mỗi từ
const BASE_SCORE = 100;
const COMBO_BONUS = 20;
const HINT_PENALTY = 25;
const MAX_LIVES = 3;

export default function WordRecallGame({
  words,
  onFinish,
  onBack,
}: WordRecallGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [smoothTimeProgress, setSmoothTimeProgress] = useState(100);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState("");
  const [results, setResults] = useState<WordState[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<FlashcardItem[]>([]);
  const [gameStartedAt, setGameStartedAt] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Shuffle words và bắt đầu game
  const startGame = useCallback(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setUserInput("");
    setLives(MAX_LIVES);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(TIME_LIMIT);
    setSmoothTimeProgress(100);
    setHintsUsed(0);
    setShowHint("");
    setResults([]);
    setShowResult(false);
    setFeedback(null);
    setGameOver(false);
    setGameStarted(true);
    setGameStartedAt(new Date().toISOString());
    startTimeRef.current = Date.now();
  }, [words]);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || showResult || gameOver || feedback) return;

    const startTime = Date.now();
    const totalDuration = timeLeft * 1000; // Convert to ms

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalDuration - elapsed);
      const remainingSeconds = Math.ceil(remaining / 1000);
      const progress = (remaining / totalDuration) * 100;

      setSmoothTimeProgress(progress);
      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        // Hết giờ - tính như sai
        handleWrongAnswer();
      }
    }, 50); // Cập nhật mỗi 50ms cho mượt

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, showResult, gameOver, feedback, currentIndex]);

  // Focus input khi đổi từ
  useEffect(() => {
    if (gameStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, gameStarted]);

  const currentWord = shuffledWords[currentIndex];

  // Xử lý gợi ý
  const handleHint = (type: "letter" | "audio") => {
    if (!currentWord) return;

    if (type === "letter") {
      const word = currentWord.word;
      const wordLength = word.length;

      // Tính số chữ cái hiện ra mỗi lần dựa trên độ dài từ
      let charsToReveal = 1;
      if (wordLength <= 4) {
        charsToReveal = 1; // Từ ngắn: hiện 1 chữ/lần
      } else if (wordLength <= 8) {
        charsToReveal = 2; // Từ trung bình: hiện 2 chữ/lần
      } else {
        charsToReveal = 3; // Từ dài: hiện 3 chữ/lần
      }

      // Lấy các vị trí chưa hiện (đang là "_")
      const currentHint = showHint || "_".repeat(wordLength);
      const hiddenPositions: number[] = [];
      for (let i = 0; i < wordLength; i++) {
        if (currentHint[i] === "_") {
          hiddenPositions.push(i);
        }
      }

      // Tính số chữ tối đa được hiện (70% từ)
      const maxRevealable = Math.floor(wordLength * 0.7);
      const currentRevealed = wordLength - hiddenPositions.length;

      if (hiddenPositions.length > 0 && currentRevealed < maxRevealable) {
        // Chọn ngẫu nhiên các vị trí để hiện
        const canReveal = Math.min(
          charsToReveal,
          hiddenPositions.length,
          maxRevealable - currentRevealed
        );
        const shuffled = [...hiddenPositions].sort(() => Math.random() - 0.5);
        const revealPositions = shuffled.slice(0, canReveal);

        // Tạo hint mới
        let newHint = currentHint.split("");
        revealPositions.forEach((pos) => {
          newHint[pos] = word[pos];
        });

        setShowHint(newHint.join(""));
        setHintsUsed((prev) => prev + 1);
      }
    } else if (type === "audio") {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = "en-US";
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      setHintsUsed((prev) => prev + 1);
    }
  };

  // Xử lý đáp án đúng
  const handleCorrectAnswer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const wordScore =
      BASE_SCORE + combo * COMBO_BONUS - hintsUsed * HINT_PENALTY;
    const finalScore = Math.max(wordScore, 10); // Tối thiểu 10 điểm

    setScore((prev) => prev + finalScore);
    setCombo((prev) => prev + 1);
    setMaxCombo((prev) => Math.max(prev, combo + 1));
    setFeedback("correct");

    // Hiệu ứng
    confetti({
      particleCount: 30 + combo * 10,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#4CAF50", "#8BC34A", "#CDDC39"],
    });

    setResults((prev) => [
      ...prev,
      {
        word: currentWord,
        isCorrect: true,
        userAnswer: userInput,
        hintsUsed,
        timeSpent: TIME_LIMIT - timeLeft,
      },
    ]);

    setTimeout(() => {
      moveToNextWord();
    }, 1000);
  };

  // Xử lý đáp án sai
  const handleWrongAnswer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setLives((prev) => prev - 1);
    setCombo(0);
    setFeedback("wrong");

    setResults((prev) => [
      ...prev,
      {
        word: currentWord,
        isCorrect: false,
        userAnswer: userInput,
        hintsUsed,
        timeSpent: TIME_LIMIT - timeLeft,
      },
    ]);

    setTimeout(() => {
      if (lives <= 1) {
        setGameOver(true);
      } else {
        moveToNextWord();
      }
    }, 1500);
  };

  // Tự động lưu kết quả khi game kết thúc
  useEffect(() => {
    if ((gameOver || showResult) && startTimeRef.current > 0) {
      handleFinish();
    }
  }, [gameOver, showResult]);

  // Chuyển từ tiếp theo
  const moveToNextWord = () => {
    if (currentIndex >= shuffledWords.length - 1) {
      // Hoàn thành tất cả
      setShowResult(true);
      celebrateWin();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserInput("");
      setTimeLeft(TIME_LIMIT);
      setSmoothTimeProgress(100);
      setHintsUsed(0);
      setShowHint("");
      setFeedback(null);
    }
  };

  // Kiểm tra đáp án
  const handleSubmit = () => {
    if (!currentWord || !userInput.trim()) return;

    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedWord = currentWord.word.toLowerCase();

    if (normalizedInput === normalizedWord) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  // Hiệu ứng chiến thắng
  const celebrateWin = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 250);
  };

  // Hoàn thành và gửi kết quả
  const handleFinish = () => {
    const correctWords = results.filter((r) => r.isCorrect).length;
    const wrongWords = results.filter((r) => !r.isCorrect).length;
    const accuracy =
      results.length > 0
        ? Math.round((correctWords / results.length) * 100)
        : 0;
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const finishedAt = new Date().toISOString();

    onFinish(
      {
        totalWords: results.length,
        correctWords,
        wrongWords,
        totalScore: score,
        accuracy,
        timeSpent,
        wrongList: results
          .filter((r) => !r.isCorrect)
          .map((r) => ({
            word: r.word.word,
            definition: r.word.definition || "",
          })),
      },
      gameStartedAt,
      finishedAt
    );
  };

  // Màn hình bắt đầu
  if (!gameStarted) {
    return (
      <Card sx={{ p: 4, maxWidth: 500, mx: "auto", mt: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
        >
          🧠 Word Recall Challenge
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          Nhìn nghĩa và gõ lại từ vựng tiếng Anh tương ứng!
        </Typography>

        <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            📜 Luật chơi:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Mỗi từ có {TIME_LIMIT} giây để trả lời</li>
            <li>Đúng liên tiếp tạo combo (+{COMBO_BONUS} điểm/combo)</li>
            <li>Sử dụng gợi ý bị trừ {HINT_PENALTY} điểm</li>
            <li>Bạn có {MAX_LIVES} mạng, sai hết mạng phải chơi lại</li>
          </Typography>
        </Box>

        <Typography variant="body2" textAlign="center" mb={3} color="primary">
          Tổng số từ: <strong>{words.length}</strong>
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button variant="outlined" onClick={onBack}>
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={startGame}
            disabled={words.length === 0}
          >
            Bắt đầu chơi
          </Button>
        </Box>
      </Card>
    );
  }

  // Progress bar màu theo thời gian
  const getTimerColor = () => {
    if (timeLeft > 20) return "success";
    if (timeLeft > 10) return "warning";
    return "error";
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Score */}
          <Chip
            icon={<EmojiEvents sx={{ color: "gold" }} />}
            label={`${score} điểm`}
            color="primary"
          />

          {/* Combo */}
          {combo > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={combo}
            >
              <Chip
                icon={<LocalFireDepartment sx={{ color: "orange" }} />}
                label={`x${combo} combo`}
                color="warning"
                sx={{ fontWeight: "bold" }}
              />
            </motion.div>
          )}
        </Box>

        {/* Lives */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {[...Array(MAX_LIVES)].map((_, i) => (
            <motion.div
              key={i}
              animate={i < lives ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {i < lives ? (
                <Favorite sx={{ color: "#f44336", fontSize: 28 }} />
              ) : (
                <FavoriteBorder sx={{ color: "#ccc", fontSize: 28 }} />
              )}
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Từ {currentIndex + 1}/{shuffledWords.length}
        </Typography>
      </Box>

      {/* Timer */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Timer fontSize="small" color={getTimerColor()} />
          <Typography
            variant="body2"
            fontWeight="bold"
            color={`${getTimerColor()}.main`}
          >
            {timeLeft}s
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={smoothTimeProgress}
          color={getTimerColor()}
          sx={{
            height: 8,
            borderRadius: 4,
            transition: "none",
            "& .MuiLinearProgress-bar": {
              transition: "transform 0.05s linear",
            },
          }}
        />
      </Box>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <Card
            sx={{
              p: 4,
              mb: 3,
              textAlign: "center",
              bgcolor:
                feedback === "correct"
                  ? "success.light"
                  : feedback === "wrong"
                  ? "error.light"
                  : "background.paper",
              transition: "background-color 0.3s ease",
            }}
          >
            <Typography variant="body2" color="text.secondary" mb={2}>
              Nghĩa tiếng Việt:
            </Typography>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              {currentWord?.definition || "Chưa có nghĩa"}
            </Typography>

            {/* Gợi ý chữ cái */}
            {showHint && (
              <Typography
                variant="h6"
                color="primary"
                sx={{ letterSpacing: 2, mb: 2, fontFamily: "monospace" }}
              >
                {showHint}
              </Typography>
            )}

            {/* Feedback */}
            {feedback === "correct" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Check sx={{ color: "success.dark", fontSize: 32 }} />
                  <Typography variant="h6" color="success.dark">
                    Chính xác! Đáp án: {currentWord?.word}
                  </Typography>
                </Box>
              </motion.div>
            )}

            {feedback === "wrong" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Close sx={{ color: "error.dark", fontSize: 32 }} />
                  <Typography variant="h6" color="error.dark">
                    Sai rồi! Đáp án: {currentWord?.word}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Input */}
      {!feedback && (
        <Box sx={{ mb: 3 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            variant="outlined"
            placeholder="Gõ từ tiếng Anh..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            autoComplete="off"
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "1.2rem",
              },
            }}
          />
        </Box>
      )}

      {/* Actions */}
      {!feedback && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Lightbulb />}
              onClick={() => handleHint("letter")}
              disabled={(() => {
                if (!currentWord || !showHint) return false;
                const wordLength = currentWord.word.length;
                const revealed =
                  wordLength - (showHint.match(/_/g) || []).length;
                const maxRevealable = Math.floor(wordLength * 0.7);
                return revealed >= maxRevealable;
              })()}
            >
              Gợi ý chữ (
              {hintsUsed > 0 ? `-${hintsUsed * HINT_PENALTY}đ` : "miễn phí"})
            </Button>
            <IconButton
              onClick={() => handleHint("audio")}
              color="primary"
              title="Nghe phát âm"
            >
              <VolumeUp />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!userInput.trim()}
          >
            Kiểm tra
          </Button>
        </Box>
      )}

      {/* Game Over Dialog */}
      <Dialog open={gameOver} onClose={() => {}}>
        <DialogTitle sx={{ textAlign: "center", color: "error.main" }}>
          💔 Game Over!
        </DialogTitle>
        <DialogContent>
          <Typography textAlign="center" mb={2}>
            Điểm số: <strong>{score}</strong>
          </Typography>
          <Typography textAlign="center" mb={2}>
            Combo cao nhất: <strong>x{maxCombo}</strong>
          </Typography>
          <Typography textAlign="center" color="text.secondary">
            Số từ đúng: {results.filter((r) => r.isCorrect).length}/
            {results.length}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={onBack}>
            Quay lại
          </Button>
          <Button
            variant="contained"
            startIcon={<Replay />}
            onClick={startGame}
          >
            Chơi lại
          </Button>
          <Button variant="contained" color="primary" onClick={handleFinish}>
            Xem kết quả
          </Button>
        </DialogActions>
      </Dialog>

      {/* Victory/Result Dialog */}
      <Dialog open={showResult} onClose={() => {}} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: "center", color: "success.main" }}>
          <EmojiEvents sx={{ fontSize: 48, color: "gold", mb: 1 }} />
          <br />
          🎉 Hoàn thành xuất sắc!
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="primary" mb={2}>
              {score} điểm
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
              <Box>
                <Typography variant="h6">
                  {results.filter((r) => r.isCorrect).length}/{results.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Từ đúng
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="h6">x{maxCombo}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Combo cao nhất
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="h6">
                  {Math.round(
                    (results.filter((r) => r.isCorrect).length /
                      results.length) *
                      100
                  )}
                  %
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Độ chính xác
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Danh sách từ sai */}
          {results.filter((r) => !r.isCorrect).length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="error" gutterBottom>
                📚 Các từ cần ôn lại:
              </Typography>
              <List
                dense
                sx={{
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                {results
                  .filter((r) => !r.isCorrect)
                  .map((r, i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={
                          <Typography fontWeight="bold">
                            {r.word.word}
                          </Typography>
                        }
                        secondary={r.word.definition}
                      />
                    </ListItem>
                  ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={onBack}>
            Quay lại
          </Button>
          <Button
            variant="contained"
            startIcon={<Replay />}
            onClick={startGame}
          >
            Chơi lại
          </Button>
          <Button variant="contained" color="success" onClick={handleFinish}>
            Hoàn tất
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
