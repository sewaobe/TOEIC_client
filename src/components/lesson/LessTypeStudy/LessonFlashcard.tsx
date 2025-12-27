import { FC, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Flashcard from "../../flashCardItem/FlashCard";
import SpeechOptions from "../../flashCardItem/SpeechOptions";
import EvaluationSection, {
  EvalType,
} from "../../flashCardItem/EvaluationSection";
import { StatisticsModal, Log } from "../../flashCardItem/StatisticsModal";
import { toast } from "sonner";
import { FlashcardHistoryModal } from "../../flashCardItem/FlashCardHistory";
import F5Modal from "../../modals/F5Modal";
import { useNavigate } from "react-router-dom";
import { FlashcardItem } from "../../modals/CreateFlashcardItemModal";
import { learningPathActivityService } from "../../../services/learningPathActivity.service";

export interface Word extends FlashcardItem {
  weight?: number; // dùng để sắp xếp ưu tiên học
}

interface LessonFlashcardProps {
  vocabularies: Word[];
  topicId: string;
  dayId: string;
  lessonId: string;
  onFinish: () => void;
  onSubmitted?: () => void;
}

type Attempt = {
  _id: string;
  started_at: string;
  finished_at: string;
  accuracy: number; // %
  avg_time: number; // seconds
  total: number;
  logs: Log[];
};

export const LessonFlashcard: FC<LessonFlashcardProps> = ({
  vocabularies,
  topicId: _topicId,
  dayId,
  lessonId,
  onFinish,
  onSubmitted,
}) => {
  const [queue, setQueue] = useState<Word[]>([]);
  const [current, setCurrent] = useState<Word | null>(null);
  const [voice, setVoice] = useState<"US" | "UK">("US");

  // Modal / overlay states
  const [openStats, setOpenStats] = useState(false); // StatisticModal (session hiện tại)
  const [openHistory, setOpenHistory] = useState(false); // FlashcardHistory

  // Logs cho session hiện tại
  const [logs, setLogs] = useState<Log[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const navigate = useNavigate();

  // Tính summary cho session hiện tại để đẩy vào Attempt
  const currentAttempt: Attempt | null = useMemo(() => {
    if (logs.length === 0) return null;
    const started_at = logs[0].attempted_at;
    const finished_at = logs[logs.length - 1].attempted_at;
    const total = logs.length;

    const easy = logs.filter((l) => l.eval_type === "easy").length;
    const medium = logs.filter((l) => l.eval_type === "medium").length;
    const hard = logs.filter((l) => l.eval_type === "hard").length;
    const skip = logs.filter((l) => l.eval_type === "skip").length;

    const avg_time = Math.round(
      logs.reduce((a, b) => a + b.response_time, 0) / total / 1000
    );

    const accuracy = Math.round(
      ((skip * 1 + easy * 0.9 + medium * 0.6 + hard * 0.3) / total) * 100
    );

    return {
      _id: `attempt-${Date.now()}`,
      started_at,
      finished_at,
      accuracy,
      avg_time,
      total,
      logs,
    };
  }, [logs]);

  // Khi het queue + show FinishedFlashCard truoc, roi mo StatisticModal sau
  useEffect(() => {
    if (!current && logs.length > 0) {
      const submitPromise = (async () => {
        if (!currentAttempt) throw new Error("Không có dữ liệu attempt");
        if (!dayId) throw new Error("Thiếu day_study_id");
        await learningPathActivityService.submitFlashcard(lessonId, {
          accuracy: currentAttempt.accuracy,
          learned_words: logs.map((l) => l.vocab_id),
          time_spent: Math.max(
            1,
            Math.round(
              logs.reduce((a, b) => a + (b.response_time || 0), 0) / 1000
            )
          ),
          day_study_id: dayId,
          results: logs.map((l) => ({
            vocabulary_id: l.vocab_id,
            eval_type: l.eval_type,
            response_time: Math.round(l.response_time / 1000), // Convert ms to seconds
          })),
        });
      })();

      toast.promise(submitPromise, {
        loading: "Đang lưu trong hệ thống...",
        success: () => {
          onFinish();
          if (onSubmitted) onSubmitted();
          setOpenStats(true);
          return "Lưu thành công!";
        },
        error: "Lưu thất bại!",
      });
    }
  }, [
    current,
    logs.length,
    currentAttempt,
    dayId,
    lessonId,
    logs,
    onFinish,
    onSubmitted,
  ]);

  // Khởi tạo queue sort theo weight
  useEffect(() => {
    if (vocabularies.length) {
      const sorted = [...vocabularies].sort(
        (a, b) => (a.weight ?? 0) - (b.weight ?? 0)
      );
      setQueue(sorted);
      setCurrent(sorted[0]);
      setStartTime(Date.now());
      setLogs([]); // reset logs cho session mới
    }
  }, [vocabularies]);

  // Đọc từ khi current/voice thay đổi
  useEffect(() => {
    if (current) {
      const utterance = new SpeechSynthesisUtterance(current.word);
      utterance.lang = voice === "US" ? "en-US" : "en-GB";
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      setStartTime(Date.now());
    }
  }, [current, voice]);

  // Xử lý đánh giá
  const handleEvaluate = (type: EvalType) => {
    if (!current) return;
    const endTime = Date.now();
    const duration = endTime - startTime;

    const newLog: Log = {
      vocab_id: current._id ?? current.word,
      vocab_word: current.word,
      eval_type: type,
      response_time: duration,
      attempted_at: new Date().toISOString(),
    };
    setLogs((prev) => [...prev, newLog]);

    // xử lý queue
    const newQueue = [...queue];
    newQueue.shift();

    if (type === "easy") {
      newQueue.push(current);
    } else if (type === "medium") {
      const pos = Math.min(newQueue.length, 5 + Math.floor(Math.random() * 6));
      newQueue.splice(pos, 0, current);
    } else if (type === "hard") {
      const pos = Math.min(newQueue.length, 1 + Math.floor(Math.random() * 3));
      newQueue.splice(pos, 0, current);
    }
    // skip → không thêm lại

    setQueue(newQueue);
    setCurrent(newQueue[0] ?? null);
  };

  // Case: còn từ → UI học
  if (current) {
    return (
      <div className="w-2/3 max-w-3xl mx-auto p-4 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.word}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <Flashcard word={current} voice={voice} />
              <SpeechOptions voice={voice} setVoice={setVoice} />
            </div>
            <EvaluationSection
              onNext={(type: EvalType) => handleEvaluate(type)}
            />
          </motion.div>
        </AnimatePresence>
        {/* Modal khi ấn reload */}
        <F5Modal
          title="Cảnh báo rời khỏi bài học"
          content="Bạn có chắc chắn muốn rời khỏi trang không? Mọi dữ liệu chưa lưu có thể bị mất."
          onConfirm={() => navigate("/home")}
        />
      </div>
    );
  }

  if (!current) {
    if (!vocabularies || vocabularies.length === 0) {
      return (
        <div className="w-full flex flex-col items-center justify-center py-10 text-center">
          <p className="text-lg font-semibold mb-2">
            Hiện chưa có flashcard cho bài học này.
          </p>
          <p className="text-sm text-gray-500">
            Vui lòng quay lại sau hoặc chọn bài học khác.
          </p>
        </div>
      );
    }
  }
  // Case: hết từ → theo flow bạn yêu cầu
  return (
    <>
      {/* 1) Vừa hoàn thành → mở FinishedFlashCard và StatisticModal của session hiện tại */}
      {/* <AnimatePresence>
                {showFinished && (
                    <motion.div
                        key="finished"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -30, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <FinishedFlashCard
                            onStats={() => setOpenHistory(true)}
                            onRetry={() => {
                                const sorted = [...vocabularies].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
                                setQueue(sorted);
                                setCurrent(sorted[0] ?? null);
                                setStartTime(Date.now());
                                setLogs([]);
                                setShowFinished(false);
                                setOpenStats(false);
                            }}
                            onNext={() => console.log("Đi tới bài tiếp theo")}
                        />
                    </motion.div>
                )}
            </AnimatePresence> */}

      {openStats && currentAttempt && (
        <StatisticsModal
          open={openStats}
          onClose={() => setOpenStats(false)}
          logs={currentAttempt.logs}
        />
      )}

      {/* 2) FlashcardHistory (accordion theo ngày) */}
      {openHistory && (
        <FlashcardHistoryModal
          open={openHistory}
          onClose={() => setOpenHistory(false)}
          topicId={_topicId}
        />
      )}
    </>
  );
};
