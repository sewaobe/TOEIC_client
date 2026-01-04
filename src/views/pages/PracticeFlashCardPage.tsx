import { useState, useEffect, useMemo } from "react";
import { Box, LinearProgress, Skeleton, Typography } from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import Flashcard from "../../components/flashCardItem/FlashCard";
import Header from "../../components/flashCardItem/Header";
import Menu, { PracticeMode } from "../../components/flashCardItem/Menu";
import AlertBox from "../../components/flashCardItem/AlertBox";
import SpeechOptions from "../../components/flashCardItem/SpeechOptions";
import EvaluationSection from "../../components/flashCardItem/EvaluationSection";
import { FlashcardItem } from "../../components/modals/CreateFlashcardItemModal";
import { useFlashcardSession } from "../../hooks/useFlashcardSession";
import { StatisticsModal } from "../../components/flashCardItem/StatisticsModal";
import { toast } from "sonner";
import PracticeCompletionCard from "../../components/flashCard/PracticeCompletionCard";
import { useLocation, useNavigate } from "react-router-dom";
import F5Modal from "../../components/modals/F5Modal";
import { flashCardProgressService } from "../../services/flashcard_progress.service";
import { topicService } from "../../services/topic.service";
import MatchingGame, {
  MatchingGameResult,
} from "../../components/flashCardItem/MatchingGame";
import WordRecallGame, {
  WordRecallResult,
} from "../../components/flashCardItem/WordRecallGame";
import MatchingGameCompletion from "../../components/flashCardItem/MatchingGameCompletion";
import WordRecallCompletion from "../../components/flashCardItem/WordRecallCompletion";
import { flashCardGameService } from "../../services/flashcard_game.service";

export default function PracticeFlashcardPage() {
  const location = useLocation();
  const topicId = location.pathname.split("/")[2] || "";
  const [words, setWords] = useState<FlashcardItem[]>([]);
  const [voice, setVoice] = useState<"US" | "UK">("US");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("flashcard");
  const [gameResult, setGameResult] = useState<
    MatchingGameResult | WordRecallResult | null
  >(null);

  const fetchData = async (topicId: string) => {
    try {
      // Gọi API lấy tất cả từ vựng của topic, không giới hạn phân trang
      const res = await topicService.getTopicVocabularyDetail(topicId, 1, 100);

      if (!res.items || res.items.length === 0) {
        toast.error("Danh sách từ trống. Vui lòng thêm từ mới để luyện tập.");
        return;
      }

      setWords(res.items);
    } catch (error) {
      toast.error("Lấy toàn bộ flashcards thất bại. Vui lòng thử lại.");
    }
  };
  useEffect(() => {
    if (!topicId) {
      toast.error("Topic ID không hợp lệ.");
      return;
    }

    fetchData(topicId);

    return () => {
      localStorage.removeItem("flashcard_session_id");
    };
  }, []);

  const {
    current,
    handleEvaluate,
    currentAttempt,
    openStats,
    setOpenStats,
    logs,
    initialTotal,
    remaining,
    queue,
  } = useFlashcardSession({
    vocabularies: words,
    topicId,
    withWeight: false,
    resumeSessionId: localStorage.getItem("flashcard_session_id") || undefined,
    onFinish: () => console.log("Hoàn thành luyện tập cá nhân!"),
  });
  const uniqueWords = useMemo(() => {
    const uniqueSet = new Set(logs.map((l) => l.vocab_id));
    return Array.from(uniqueSet);
  }, [logs]);

  // Cảnh báo khi đạt mốc 20 từ duy nhất (và chỉ 1 lần)
  const [warned, setWarned] = useState(false);
  useEffect(() => {
    if (!warned && uniqueWords.length >= 20) {
      toast.info(
        <div>
          Bạn đã học <strong>20 từ</strong> trong buổi này.
          <br />
          Nghỉ ngơi 5 phút nhé! Hôm sau quay lại học tiếp thôi 😊
        </div>
      );
      setWarned(true);
    }
  }, [uniqueWords.length, warned]);

  useEffect(() => {
    if (!current) return;
    const utterance = new SpeechSynthesisUtterance(current.word);
    utterance.lang = voice === "US" ? "en-US" : "en-GB";
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [current, voice]);

  const total = initialTotal || 0;
  const completed = total - remaining; // số từ đã xong (đã bị loại)
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const navigate = useNavigate();

  // Xử lý khi hoàn thành game Matching
  const handleMatchingFinish = async (
    result: MatchingGameResult,
    startedAt: string,
    finishedAt: string
  ) => {
    setGameResult(result);
    toast.success(`🎮 Hoàn thành! Độ chính xác: ${result.accuracy}%`);

    // Gọi API lưu kết quả
    try {
      await flashCardGameService.submitMatchingGame(
        topicId,
        result,
        startedAt,
        finishedAt
      );
      console.log("✅ Matching game result saved");
    } catch (error) {
      console.error("❌ Failed to save matching game result:", error);
      toast.error("Không thể lưu kết quả game");
    }
  };

  // Xử lý khi hoàn thành game Word Recall
  const handleWordRecallFinish = async (
    result: WordRecallResult,
    startedAt: string,
    finishedAt: string
  ) => {
    setGameResult(result);
    toast.success(`🧠 Hoàn thành! Điểm số: ${result.totalScore}`);

    // Gọi API lưu kết quả
    try {
      await flashCardGameService.submitWordRecallGame(
        topicId,
        result,
        startedAt,
        finishedAt
      );
      console.log("✅ Word recall game result saved");
    } catch (error) {
      console.error("❌ Failed to save word recall game result:", error);
      toast.error("Không thể lưu kết quả game");
    }
  };

  // Xử lý quay lại từ game
  const handleGameBack = () => {
    setPracticeMode("flashcard");
    setGameResult(null);
  };

  // Xử lý đổi chế độ
  const handleModeChange = (mode: PracticeMode) => {
    setPracticeMode(mode);
    setGameResult(null);
  };

  // Render nội dung theo chế độ
  const renderContent = () => {
    // Nếu đang ở chế độ game và có kết quả
    if (gameResult) {
      const isMatchingResult = "totalPairs" in gameResult;

      if (isMatchingResult) {
        // Matching Game completion
        return (
          <MatchingGameCompletion
            result={gameResult as MatchingGameResult}
            onRetry={() => setGameResult(null)}
            onGoHome={() => navigate("/flash-cards")}
          />
        );
      } else {
        // Word Recall completion
        return (
          <WordRecallCompletion
            result={gameResult as WordRecallResult}
            onRetry={() => setGameResult(null)}
            onGoHome={() => navigate("/flash-cards")}
          />
        );
      }
    }

    // Chế độ Matching Game
    if (practiceMode === "matching") {
      if (words.length < 2) {
        return (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              Cần ít nhất 2 từ vựng để chơi Matching Game
            </Typography>
          </Box>
        );
      }
      return (
        <MatchingGame
          words={words}
          onFinish={handleMatchingFinish}
          onBack={handleGameBack}
        />
      );
    }

    // Chế độ Word Recall
    if (practiceMode === "recall") {
      if (words.length === 0) {
        return (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              Không có từ vựng để chơi Word Recall
            </Typography>
          </Box>
        );
      }
      return (
        <WordRecallGame
          words={words}
          onFinish={handleWordRecallFinish}
          onBack={handleGameBack}
        />
      );
    }

    // Chế độ Flashcard (mặc định)
    if (current) {
      return (
        <div className="relative">
          <Flashcard word={current} voice={voice} />
          <SpeechOptions voice={voice} setVoice={setVoice} />
          <EvaluationSection onNext={handleEvaluate} />
        </div>
      );
    }

    if (currentAttempt) {
      return (
        <PracticeCompletionCard
          type="flashcard"
          accuracy={currentAttempt.accuracy}
          total={currentAttempt.total}
          avgTime={currentAttempt.avg_time}
          onRetry={() => window.location.reload()}
          onViewStats={() => setOpenStats(true)}
          onGoHome={() => navigate("/flash-cards")}
        />
      );
    }

    // Loading state
    return (
      <Box
        sx={{
          mt: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            height: 280,
            borderRadius: 2,
            position: "relative",
            boxShadow: 2,
            overflow: "hidden",
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            sx={{ position: "absolute", bottom: 16, right: 16 }}
          />
        </Box>
        <Box sx={{ width: "80%", textAlign: "center" }}>
          <Skeleton variant="text" width="60%" sx={{ mx: "auto", mb: 1 }} />
          <Skeleton variant="text" width="40%" sx={{ mx: "auto" }} />
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Đang tải dữ liệu flashcards...
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <MainLayout>
      <div
        className="max-w-3xl mx-auto p-4"
        style={{ minHeight: "calc(100vh - 180px)" }}
      >
        <Header />
        <Menu currentMode={practiceMode} onModeChange={handleModeChange} />

        {/* Alert chỉ hiện ở chế độ flashcard */}
        {practiceMode === "flashcard" && (
          <AlertBox
            severity="warning"
            variant="outlined"
            message="Chú ý: bạn được học tối đa 20 từ mới mỗi ngày. Đây là lượng từ phù hợp để bạn có thể học hiệu quả."
            mb={6}
          />
        )}

        {/* Thanh tiến độ chỉ hiện ở chế độ flashcard */}
        {practiceMode === "flashcard" && total > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Tiến độ học: {completed}/{total} từ ({progress}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 2,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}

        {/* Render nội dung theo chế độ */}
        {renderContent()}

        {openStats && currentAttempt && (
          <StatisticsModal
            open={openStats}
            onClose={() => setOpenStats(false)}
            logs={currentAttempt.logs}
          />
        )}

        <F5Modal
          title="Cảnh báo rời trang"
          content="Bạn có muốn lưu tiến độ học hiện tại trước khi rời trang không?"
          onConfirm={async () => {
            const sessionId = localStorage.getItem("flashcard_session_id");
            if (sessionId) {
              await flashCardProgressService.updateSession(
                sessionId,
                queue
                  .map((q) => q._id)
                  .filter((_id): _id is string => typeof _id === "string"),
                0,
                logs
              );
            }
            navigate(`/flash-cards/${topicId}`);
          }}
        />
      </div>
    </MainLayout>
  );
}
