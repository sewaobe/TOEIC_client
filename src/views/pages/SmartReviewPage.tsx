import { useState, useEffect, useCallback } from "react";
import {
  Box,
  LinearProgress,
  Skeleton,
  Typography,
  Button,
  Paper,
  Chip,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Psychology as BrainIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import MainLayout from "../layouts/MainLayout";
import Flashcard from "../../components/flashCardItem/FlashCard";
import SpeechOptions from "../../components/flashCardItem/SpeechOptions";
import EvaluationSection, {
  EvalType,
} from "../../components/flashCardItem/EvaluationSection";
import { StatisticsModal } from "../../components/flashCardItem/StatisticsModal";
import { toast } from "sonner";
import PracticeCompletionCard from "../../components/flashCard/PracticeCompletionCard";
import { useNavigate } from "react-router-dom";
import hlrService, {
  HLRStats,
  ReviewQueueItem,
} from "../../services/hlr.service";

/**
 * SmartReviewPage - Trang ôn tập thông minh sử dụng HLR
 *
 * Khác với PracticeFlashCardPage:
 * - Lấy từ từ HLR review queue (cross-topic)
 * - Submit trực tiếp qua HLR API
 * - Hiển thị metadata: last_practiced, half_life
 */

interface ReviewLog {
  vocab_id: string;
  vocab_word: string;
  eval_type: EvalType;
  response_time: number;
  attempted_at: string;
}

interface SmartReviewFinishSummary {
  processed: number;
  remainingDueNow: number;
  stats: HLRStats;
  nearestNextReview: string | null;
  results: Array<{
    vocabulary_id: string;
    word: string;
    is_correct: boolean;
    new_half_life: number;
    next_review: string;
  }>;
}

export default function SmartReviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [voice, setVoice] = useState<"US" | "UK">("US");

  // Review queue state
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logs, setLogs] = useState<ReviewLog[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionStartTime] = useState<string>(new Date().toISOString());

  // UI state
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openStats, setOpenStats] = useState(false);
  const [finishSummary, setFinishSummary] =
    useState<SmartReviewFinishSummary | null>(null);

  // Fetch review queue on mount
  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      const response = await hlrService.getReviewQueue(20, true);

      if (response.count === 0) {
        toast.info("Không có từ nào cần ôn tập hôm nay! 🎉");
        setQueue([]);
      } else {
        setQueue(response.items);
        toast.success(`Có ${response.count} từ cần ôn tập`);
      }
    } catch (error) {
      console.error("Failed to fetch review queue:", error);
      toast.error("Không thể lấy danh sách từ cần ôn");
    } finally {
      setLoading(false);
    }
  };

  // Current word
  const current = queue[currentIndex] || null;
  const total = queue.length;
  const progress = total ? Math.round((currentIndex / total) * 100) : 0;

  // Speak word when current changes
  useEffect(() => {
    if (!current?.vocabulary?.word) return;
    const utterance = new SpeechSynthesisUtterance(current.vocabulary.word);
    utterance.lang = voice === "US" ? "en-US" : "en-GB";
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [current, voice]);

  // Map eval_type to is_correct
  const mapEvalToCorrect = (evalType: EvalType): boolean => {
    return evalType === "skip" || evalType === "easy";
  };

  // Handle evaluation
  const handleEvaluate = useCallback(
    (type: EvalType) => {
      if (!current || !current.vocabulary) return;

      const vocabularyId =
        typeof current.vocabulary_id === "string"
          ? current.vocabulary_id
          : current.vocabulary?._id;

      if (!vocabularyId) {
        toast.error("Không xác định được từ vựng để cập nhật HLR");
        return;
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log this evaluation
      const newLog: ReviewLog = {
        vocab_id: vocabularyId,
        vocab_word: current.vocabulary.word,
        eval_type: type,
        response_time: duration,
        attempted_at: new Date().toISOString(),
      };

      setLogs((prev) => [...prev, newLog]);

      // Move to next word
      if (currentIndex < queue.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setStartTime(Date.now());
      } else {
        // Finished all words
        handleFinish([...logs, newLog]);
      }
    },
    [current, currentIndex, queue.length, startTime, logs],
  );

  // Handle finish
  const handleFinish = async (finalLogs: ReviewLog[]) => {
    setIsSubmitting(true);

    try {
      // Convert logs to HLR format
      const items = finalLogs.map((log) => ({
        vocabulary_id: log.vocab_id,
        is_correct: mapEvalToCorrect(log.eval_type),
      }));

      const submitResult = await hlrService.submitSession(items);

      // Refresh ngay dữ liệu sau submit để UI phản ánh trạng thái mới nhất
      const [updatedQueue, updatedStats] = await Promise.all([
        hlrService.getReviewQueue(20, true),
        hlrService.getStats(),
      ]);

      setQueue(updatedQueue.items);
      setCurrentIndex(0);

      const wordMap = new Map(
        finalLogs.map((log) => [log.vocab_id, log.vocab_word]),
      );
      const resultRows = submitResult.results.map((result) => ({
        vocabulary_id: result.vocabulary_id,
        word: wordMap.get(result.vocabulary_id) || "(không xác định)",
        is_correct: result.is_correct,
        new_half_life: result.new_half_life,
        next_review: result.next_review,
      }));

      const sortedNextReview = [...submitResult.results]
        .map((r) => r.next_review)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      setFinishSummary({
        processed: submitResult.processed,
        remainingDueNow: updatedQueue.count,
        stats: updatedStats,
        nearestNextReview: sortedNextReview[0] || null,
        results: resultRows,
      });

      setIsFinished(true);
      toast.success(
        `Đã cập nhật ${submitResult.processed} từ. Còn ${updatedQueue.count} từ đến hạn ngay.`,
      );
    } catch (error) {
      console.error("Failed to submit review session:", error);
      toast.error("Không thể lưu kết quả");
      setIsFinished(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "Chưa có dữ liệu";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "Không hợp lệ";
    return d.toLocaleString("vi-VN", {
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats for completion card
  const getStats = () => {
    if (logs.length === 0) return null;

    const correctCount = logs.filter(
      (l) => l.eval_type === "skip" || l.eval_type === "easy",
    ).length;
    const accuracy = Math.round((correctCount / logs.length) * 100);
    const avgTime = Math.round(
      logs.reduce((sum, l) => sum + l.response_time, 0) / logs.length,
    );

    return {
      accuracy,
      total: logs.length,
      avg_time: avgTime,
      logs,
      started_at: sessionStartTime,
      finished_at: new Date().toISOString(),
    };
  };

  // Format time since last practice
  const formatTimeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffHours < 1) return "Vừa học";
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return "Hôm qua";
    return `${diffDays} ngày trước`;
  };

  // Render content
  const renderContent = () => {
    // Loading
    if (loading) {
      return (
        <Box
          sx={{
            mt: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Skeleton
            variant="rectangular"
            width={400}
            height={280}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton variant="text" width={200} />
        </Box>
      );
    }

    // Empty queue
    if (queue.length === 0) {
      return (
        <Paper
          elevation={0}
          sx={{
            mt: 6,
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <BrainIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Tuyệt vời! 🎉
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Bạn không có từ nào cần ôn tập hôm nay.
            <br />
            Hãy tiếp tục học từ mới để mở rộng vốn từ vựng!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/flash-cards")}
            sx={{ mr: 2 }}
          >
            Học từ mới
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        </Paper>
      );
    }

    // Finished
    if (isFinished) {
      const stats = getStats();
      if (!stats) return null;

      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <PracticeCompletionCard
            type="flashcard"
            accuracy={stats.accuracy}
            total={stats.total}
            avgTime={stats.avg_time}
            onRetry={() => {
              setIsFinished(false);
              setCurrentIndex(0);
              setLogs([]);
              setFinishSummary(null);
              fetchReviewQueue();
            }}
            onViewStats={() => setOpenStats(true)}
            onGoHome={() => navigate("/flash-cards")}
          />

          {finishSummary && (
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Tổng hợp ôn tập thông minh
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                <Chip
                  size="small"
                  color="primary"
                  label={`Đã cập nhật: ${finishSummary.processed} từ`}
                />
                <Chip
                  size="small"
                  color={
                    finishSummary.remainingDueNow > 0 ? "warning" : "success"
                  }
                  label={`Đến hạn ngay: ${finishSummary.remainingDueNow} từ`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Đến hạn hôm nay: ${finishSummary.stats.dueToday} từ`}
                />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Lần ôn gần nhất tiếp theo:{" "}
                {formatDateTime(finishSummary.nearestNextReview)}
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Từ vừa ôn ({finishSummary.results.length} từ)
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {finishSummary.results.slice(0, 8).map((item) => (
                  <Box
                    key={`${item.vocabulary_id}-${item.next_review}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: "grey.50",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {item.word}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        size="small"
                        color={item.is_correct ? "success" : "warning"}
                        label={item.is_correct ? "Đúng" : "Cần ôn thêm"}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Ôn lại: {formatDateTime(item.next_review)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {finishSummary.results.length > 8 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1.25, display: "block" }}
                >
                  Hiển thị 8/{finishSummary.results.length} từ đã ôn.
                </Typography>
              )}

              <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    setIsFinished(false);
                    setLogs([]);
                    setStartTime(Date.now());
                  }}
                >
                  Ôn tiếp danh sách đến hạn
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => fetchReviewQueue()}
                >
                  Làm mới danh sách
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      );
    }

    // Current word
    if (current && current.vocabulary) {
      const vocab = current.vocabulary;

      return (
        <Box>
          {/* Metadata bar */}
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "grey.50",
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/* Recall Probability - hiển thị màu theo mức độ */}
            <Chip
              icon={<BrainIcon />}
              label={`${Math.round((current.recall_probability ?? 0) * 100)}% nhớ`}
              size="small"
              color={
                (current.recall_probability ?? 0) > 0.7
                  ? "success"
                  : (current.recall_probability ?? 0) > 0.4
                    ? "warning"
                    : "error"
              }
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<ScheduleIcon />}
              label={formatTimeSince(current.last_practiced)}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<TrendingIcon />}
              label={`Half-life: ${Math.round(current.half_life)}h`}
              size="small"
              variant="outlined"
              color={current.half_life < 24 ? "warning" : "default"}
            />
            <Chip
              label={`✓ ${current.right_count} | ✗ ${current.wrong_count}`}
              size="small"
              variant="outlined"
            />
          </Paper>

          {/* Flashcard */}
          <Flashcard
            word={{
              _id: vocab._id,
              word: vocab.word,
              phonetic: vocab.phonetic || "",
              type: vocab.type || "",
              definition: vocab.definition || "",
              examples: vocab.examples || [],
              image: vocab.image || "",
              weight: vocab.weight,
            }}
            voice={voice}
          />
          <SpeechOptions voice={voice} setVoice={setVoice} />
          <EvaluationSection onNext={handleEvaluate} />
        </Box>
      );
    }

    // Debug: không render được
    console.error("Cannot render smart review card", {
      current,
      hasVocabulary: current?.vocabulary,
    });
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">Lỗi: Không thể hiển thị từ vựng</Typography>
        <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
          currentIndex: {currentIndex}, total: {total}
        </Typography>
      </Paper>
    );
  };

  return (
    <MainLayout>
      <Box sx={{ pb: 4, maxWidth: 600, mx: "auto" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
              sx={{ minWidth: "auto" }}
            >
              Quay lại
            </Button>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BrainIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Ôn tập thông minh
              </Typography>
            </Box>
          </Box>
          {!isFinished && queue.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {currentIndex + 1} / {total}
            </Typography>
          )}
        </Box>

        {/* Progress bar */}
        {!isFinished && queue.length > 0 && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mb: 3, borderRadius: 1, height: 6 }}
          />
        )}

        {/* Content */}
        {isSubmitting ? (
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Đang tổng hợp kết quả buổi ôn...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hệ thống đang cập nhật HLR và làm mới lịch ôn tập của bạn.
            </Typography>
          </Paper>
        ) : (
          renderContent()
        )}

        {/* Statistics Modal */}
        {openStats && logs.length > 0 && (
          <StatisticsModal
            open={openStats}
            onClose={() => setOpenStats(false)}
            logs={logs}
          />
        )}
      </Box>
    </MainLayout>
  );
}
