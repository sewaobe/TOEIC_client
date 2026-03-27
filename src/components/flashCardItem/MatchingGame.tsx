import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from "@mui/material";
import { Replay, EmojiEvents, Close } from "@mui/icons-material";
import { FlashcardItem } from "../modals/CreateFlashcardItemModal";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface MatchingGameProps {
  words: FlashcardItem[];
  onFinish: (
    result: MatchingGameResult,
    startedAt: string,
    finishedAt: string,
  ) => void;
  onBack: () => void;
}

export interface MatchingGameResult {
  totalPairs: number;
  correctPairs: number;
  wrongAttempts: number;
  timeSpent: number;
  accuracy: number;
  score: number;
  // HLR data
  vocabularyIds: string[]; // Tất cả vocabulary IDs trong game
  correctPairIds: string[]; // IDs của các từ ghép đúng
  wrongAttemptCounts: Record<string, number>; // Map vocab_id -> số lần click sai
}

interface GameCard {
  id: string;
  content: string;
  type: "word" | "definition";
  pairId: string;
  vocabularyId: string; // ID của vocabulary
  isSelected: boolean;
  isMatched: boolean;
  isWrong?: boolean;
  isCorrect?: boolean;
}

const PAIR_MILESTONES = [4, 6, 8, 10]; // Các mốc số cặp (tròn x*y)

const getGridLayout = (pairs: number) => {
  if (pairs <= 4) return { cols: 4, rows: 2 }; // 4 cặp = 8 cards = 4x2
  if (pairs <= 6) return { cols: 4, rows: 3 }; // 6 cặp = 12 cards = 4x3
  if (pairs <= 8) return { cols: 4, rows: 4 }; // 8 cặp = 16 cards = 4x4
  return { cols: 5, rows: 4 }; // 10 cặp = 20 cards = 5x4
};

export default function MatchingGame({
  words,
  onFinish,
  onBack,
}: MatchingGameProps) {
  const [showSetup, setShowSetup] = useState(true);
  const [selectedPairs, setSelectedPairs] = useState(4); // số cặp được chọn
  const [cards, setCards] = useState<GameCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<GameCard[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0); // Thời gian đã trôi qua (ms)
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [gameStartedAt, setGameStartedAt] = useState<string>("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [gameVocabularyIds, setGameVocabularyIds] = useState<string[]>([]); // Track vocabulary IDs
  const [matchedVocabularyIds, setMatchedVocabularyIds] = useState<string[]>(
    [],
  ); // Track matched IDs
  const [wrongAttemptCounts, setWrongAttemptCounts] = useState<
    Record<string, number>
  >({}); // Track số lần sai cho mỗi từ

  const maxPairs = Math.min(Math.floor(words.length), 10); // Max 10 cặp
  const availableOptions = PAIR_MILESTONES.filter((p) => p <= maxPairs);

  // Khởi tạo game
  const initializeGame = useCallback(() => {
    const pairsNeeded = selectedPairs;

    // Shuffle và lấy số từ cần thiết
    const shuffledWords = [...words]
      .sort(() => Math.random() - 0.5)
      .slice(0, pairsNeeded);

    // Lưu vocabulary IDs cho HLR
    const vocabIds = shuffledWords.map((w) => w._id || "").filter(Boolean);
    setGameVocabularyIds(vocabIds);
    setMatchedVocabularyIds([]);
    setWrongAttemptCounts({}); // Reset wrong counts

    // Tạo các card (mỗi từ tạo 2 card: word và definition)
    const gameCards: GameCard[] = [];
    shuffledWords.forEach((word, index) => {
      const vocabId = word._id || `unknown-${index}`;
      gameCards.push({
        id: `word-${index}`,
        content: word.word,
        type: "word",
        pairId: `pair-${index}`,
        vocabularyId: vocabId,
        isSelected: false,
        isMatched: false,
        isWrong: false,
        isCorrect: false,
      });
      gameCards.push({
        id: `def-${index}`,
        content: word.definition || "Chưa có nghĩa",
        type: "definition",
        pairId: `pair-${index}`,
        vocabularyId: vocabId,
        isSelected: false,
        isMatched: false,
        isWrong: false,
        isCorrect: false,
      });
    });

    // Shuffle các card
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setSelectedCards([]);
    setElapsedTime(0);
    setMatchedPairs(0);
    setWrongAttempts(0);
    setScore(0);
    setStartTime(Date.now());
    setGameStartedAt(new Date().toISOString());
    setGameOver(false);
    setGameWon(false);
    setShowSetup(false);
  }, [words, selectedPairs]);

  // Xử lý chọn card
  const handleCardClick = useCallback(
    (card: GameCard) => {
      if (
        isChecking ||
        card.isMatched ||
        card.isSelected ||
        selectedCards.length >= 2
      )
        return;

      // Đánh dấu card được chọn
      const newCards = cards.map((c) =>
        c.id === card.id ? { ...c, isSelected: true, isWrong: false } : c,
      );
      setCards(newCards);

      const newSelected = [...selectedCards, { ...card, isSelected: true }];
      setSelectedCards(newSelected);

      // Nếu đã chọn 2 card
      if (newSelected.length === 2) {
        setIsChecking(true);
        const [first, second] = newSelected;

        setTimeout(() => {
          if (first.pairId === second.pairId && first.type !== second.type) {
            // Match thành công!
            // Tính điểm dựa trên tốc độ ghép (nhanh hơn = điểm cao hơn)
            const speedBonus = Math.max(0, 50 - Math.floor(elapsedTime / 1000)); // Bonus giảm theo thời gian
            const pairScore = 100 + speedBonus;
            setScore((prev) => prev + pairScore);

            // Track matched vocabulary ID cho HLR
            setMatchedVocabularyIds((prev) => [...prev, first.vocabularyId]);

            // Hiển màu xanh lá trước
            setCards((prev) =>
              prev.map((c) =>
                c.pairId === first.pairId
                  ? { ...c, isCorrect: true, isSelected: false, isWrong: false }
                  : c,
              ),
            );

            // Sau 600ms mới biến mất
            setTimeout(() => {
              setCards((prev) =>
                prev.map((c) =>
                  c.pairId === first.pairId
                    ? { ...c, isMatched: true, isCorrect: false }
                    : c,
                ),
              );
            }, 600);

            setMatchedPairs((prev) => prev + 1);

            // Hiệu ứng match
            confetti({
              particleCount: 30,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#4CAF50", "#8BC34A", "#CDDC39"],
            });
          } else {
            // Sai - đánh dấu sai và bỏ chọn
            setCards((prev) =>
              prev.map((c) =>
                c.id === first.id || c.id === second.id
                  ? { ...c, isSelected: false, isWrong: true }
                  : c,
              ),
            );
            setWrongAttempts((prev) => prev + 1);

            // Track số lần sai cho từng từ (cả 2 từ đều bị tính sai)
            setWrongAttemptCounts((prev) => ({
              ...prev,
              [first.vocabularyId]: (prev[first.vocabularyId] || 0) + 1,
              [second.vocabularyId]: (prev[second.vocabularyId] || 0) + 1,
            }));

            // Bỏ đánh dấu sai sau 300ms
            setTimeout(() => {
              setCards((prev) =>
                prev.map((c) =>
                  c.id === first.id || c.id === second.id
                    ? { ...c, isWrong: false }
                    : c,
                ),
              );
            }, 300);
          }

          setSelectedCards([]);
          setIsChecking(false);
        }, 500);
      }
    },
    [cards, selectedCards, isChecking],
  );

  // Timer đếm lên
  useEffect(() => {
    if (showSetup || gameOver || gameWon) return;

    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 10); // Cập nhật mỗi 10ms cho mượt

    return () => clearInterval(timer);
  }, [showSetup, gameOver, gameWon, startTime]);

  // Kiểm tra kết thúc game
  useEffect(() => {
    const totalPairs = selectedPairs;

    if (matchedPairs === totalPairs && totalPairs > 0 && !gameWon) {
      setGameWon(true);
      // Hiệu ứng chiến thắng
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
    }
  }, [matchedPairs, selectedPairs, gameWon]);

  // Tự động lưu kết quả khi game kết thúc
  useEffect(() => {
    if ((gameOver || gameWon) && startTime > 0) {
      handleFinish();
    }
  }, [gameOver, gameWon]);

  // Kết thúc và gửi kết quả
  const handleFinish = () => {
    const totalPairs = selectedPairs;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const accuracy =
      totalPairs > 0 ? Math.round((matchedPairs / totalPairs) * 100) : 0;
    const finishedAt = new Date().toISOString();

    onFinish(
      {
        totalPairs,
        correctPairs: matchedPairs,
        wrongAttempts,
        timeSpent,
        accuracy,
        score,
        // HLR data
        vocabularyIds: gameVocabularyIds,
        correctPairIds: matchedVocabularyIds,
        wrongAttemptCounts, // Gửi số lần sai cho từng từ
      },
      gameStartedAt,
      finishedAt,
    );
  };

  const gridOption = getGridLayout(selectedPairs);

  // Format thời gian đã trôi qua
  const formatElapsedTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Dialog setup
  if (showSetup) {
    return (
      <Card sx={{ p: 4, maxWidth: 500, mx: "auto", mt: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          textAlign="center"
        >
          🎮 Chế độ Matching Game
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          Ghép cặp từ vựng với nghĩa tương ứng. Bấm càng nhanh điểm càng cao!
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Chọn số cặp từ ({words.length} từ có sẵn, tối đa 10):
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
            {availableOptions.map((pairs) => (
              <Chip
                key={pairs}
                label={`${pairs} cặp`}
                onClick={() => setSelectedPairs(pairs)}
                color={selectedPairs === pairs ? "primary" : "default"}
                variant={selectedPairs === pairs ? "filled" : "outlined"}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button variant="outlined" onClick={onBack}>
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={initializeGame}
            disabled={availableOptions.length === 0}
          >
            Bắt đầu chơi
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Matching Game
          </Typography>
          <Chip
            label={`${matchedPairs}/${selectedPairs} cặp`}
            color="primary"
            size="small"
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "warning.light",
              px: 2,
              py: 0.5,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              🏆 {score}
            </Typography>
          </Box>

          <IconButton onClick={() => setShowSetup(true)} size="small">
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Timer hiển thị thời gian đã trôi qua */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary.main"
            sx={{ fontFamily: "monospace", letterSpacing: 1 }}
          >
            ⏱️ {formatElapsedTime(elapsedTime)}
          </Typography>
        </Box>
      </Box>

      {/* Game Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridOption.cols}, 1fr)`,
          gap: 1.5,
          mb: 3,
        }}
      >
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0 }}
              animate={{
                scale: card.isMatched ? 0 : 1,
                opacity: card.isMatched ? 0 : 1,
              }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                onClick={() => handleCardClick(card)}
                sx={{
                  height: { xs: 80, sm: 100 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: card.isMatched ? "default" : "pointer",
                  bgcolor: card.isMatched
                    ? "transparent"
                    : card.isCorrect
                      ? "#A5D6A7"
                      : card.isSelected
                        ? "#BBDEFB"
                        : card.isWrong
                          ? "#FFCCBC"
                          : "#FAFAFA",
                  color: card.isCorrect
                    ? "#1B5E20"
                    : card.isSelected
                      ? "#1565C0"
                      : card.isWrong
                        ? "#D84315"
                        : "text.primary",
                  border: card.isMatched
                    ? "2px solid transparent"
                    : card.isCorrect
                      ? "2px solid #4CAF50"
                      : card.isSelected
                        ? "2px solid #1976D2"
                        : card.isWrong
                          ? "2px solid #FF7043"
                          : "1px solid #E0E0E0",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: card.isMatched
                      ? "transparent"
                      : card.isCorrect
                        ? "#A5D6A7"
                        : card.isSelected
                          ? "#BBDEFB"
                          : card.isWrong
                            ? "#FFCCBC"
                            : "#E8E8E8",
                    transform: card.isMatched ? "none" : "scale(1.05)",
                    borderColor: card.isMatched
                      ? "transparent"
                      : card.isCorrect
                        ? "#4CAF50"
                        : card.isSelected
                          ? "#1976D2"
                          : card.isWrong
                            ? "#FF7043"
                            : "#BDBDBD",
                  },
                  p: 1,
                  textAlign: "center",
                  visibility: card.isMatched ? "hidden" : "visible",
                  boxShadow: card.isMatched
                    ? 0
                    : card.isSelected
                      ? 3
                      : card.isWrong
                        ? 2
                        : 1,
                  animation: card.isWrong ? "shake 0.3s ease-in-out" : "none",
                  "@keyframes shake": {
                    "0%, 100%": { transform: "rotate(0deg)" },
                    "25%": { transform: "rotate(-2deg)" },
                    "75%": { transform: "rotate(2deg)" },
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={card.isSelected ? 700 : 500}
                  sx={{
                    fontSize: { xs: "0.7rem", sm: "0.85rem" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {card.content}
                </Typography>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>

      {/* Victory Dialog */}
      <Dialog open={gameWon} onClose={() => {}}>
        <DialogTitle sx={{ textAlign: "center", color: "success.main" }}>
          <EmojiEvents sx={{ fontSize: 48, color: "gold", mb: 1 }} />
          <br />
          🎉 Xuất sắc!
        </DialogTitle>
        <DialogContent>
          <Typography textAlign="center" mb={2} variant="h6" fontWeight="bold">
            Điểm số: {score}
          </Typography>
          <Typography textAlign="center" mb={1}>
            Hoàn thành:{" "}
            <strong>
              {matchedPairs}/{selectedPairs}
            </strong>{" "}
            cặp
          </Typography>
          <Typography textAlign="center" mb={1}>
            Số lần sai: <strong>{wrongAttempts}</strong>
          </Typography>
          <Typography textAlign="center" color="text.secondary">
            Thời gian hoàn thành:{" "}
            <strong>{formatElapsedTime(elapsedTime)}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={onBack}>
            Quay lại
          </Button>
          <Button
            variant="contained"
            startIcon={<Replay />}
            onClick={initializeGame}
          >
            Chơi lại
          </Button>
          <Button variant="contained" color="success" onClick={handleFinish}>
            Xem kết quả
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
