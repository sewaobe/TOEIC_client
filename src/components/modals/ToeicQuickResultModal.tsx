import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Tooltip,
  Chip,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  useTheme,
} from "@mui/material";
import BaseModal from "./BaseModal";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import { RawAnswer } from "../../utils/mapAnswersToParts";
import learningPathService from "../../services/learningPath.service";
import userTestService from "../../services/user_test.service";

export type ResultPayload = {
  score?: number; // điểm nội bộ hệ thống (nếu có)
  answers: RawAnswer[]; // chỉ cần đúng shape này
};

interface ToeicQuickResultModalProps {
  open: boolean;
  data: ResultPayload;
  onClose: () => void;
  onReviewDetails?: (id: string) => void; // xem lại bài làm (optional)
  onSuggestPlan?: () => void; // gợi ý lộ trình học (optional)
  testId?: string;
  practicedParts?: number[]; // Các part đã luyện tập (nếu có)
}

/* ---------- constants & helpers ---------- */
// Chuẩn TOEIC 2016+: Listening 100 (6/25/39/30), Reading 100 (30/16/54)
const TOEIC_PART_RANGES = [
  { part: 1, count: 6 },
  { part: 2, count: 25 },
  { part: 3, count: 39 },
  { part: 4, count: 30 },
  { part: 5, count: 30 },
  { part: 6, count: 16 },
  { part: 7, count: 54 },
] as const;

const PART_LABELS: Record<number, string> = {
  1: "Part 1 - Photos",
  2: "Part 2 - Q&A",
  3: "Part 3 - Conversations",
  4: "Part 4 - Talks",
  5: "Part 5 - Incomplete",
  6: "Part 6 - Text Completion",
  7: "Part 7 - Reading",
};

const pctText = (n: number) => `${Math.round(n * 100)}%`;
const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

const estimateToeic990 = (accuracy: number) =>
  Math.max(0, Math.min(990, Math.round(accuracy * 990)));

const estimateCEFR = (toeic: number) => {
  if (toeic >= 945) return "C1+";
  if (toeic >= 785) return "B2";
  if (toeic >= 550) return "B1";
  if (toeic >= 225) return "A2";
  return "A1-";
};

/** Map index câu (0-based) -> Part theo dải TOEIC */
function mapIndexToPart(idx: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  let cursor = 0;
  for (const r of TOEIC_PART_RANGES) {
    const start = cursor;
    const end = cursor + r.count - 1;
    if (idx >= start && idx <= end) return r.part as 1 | 2 | 3 | 4 | 5 | 6 | 7;
    cursor += r.count;
  }
  return 7; // fallback nếu vượt ngoài 200
}

/* ---------- small UI atoms ---------- */
const StatChip = ({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "primary" | "success" | "secondary";
}) => (
  <Chip
    size="small"
    label={label}
    color={tone === "default" ? undefined : (tone as any)}
    variant={tone === "default" ? "outlined" : "filled"}
    className="rounded-full"
  />
);

const PartMiniCard = ({
  title,
  correct,
  total,
}: {
  title: string;
  correct: number;
  total: number;
}) => {
  const acc = total ? correct / total : 0;
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      <CardContent
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 1,
          minHeight: { xs: 120, sm: 120 },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Tooltip title={title} arrow>
            <Typography
              variant="body2"
              className="font-semibold"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                maxWidth: '100%',
              }}
            >
              {title}
            </Typography>
          </Tooltip>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Typography variant="caption" color="text.secondary">
              {correct}/{total} • {pctText(acc)}
            </Typography>
          </Box>
        </Box>

        {/* Progress track - fixed height to ensure consistent rendering */}
        <Box
          sx={{
            mt: 1.5,
            height: 8,
            width: '100%',
            borderRadius: 999,
            bgcolor: (t) => (t.palette.mode === 'dark' ? t.palette.grey[800] : t.palette.grey[100]),
            overflow: 'hidden',
            alignSelf: 'stretch',
          }}
        >
          <Box
            sx={{
              height: '100%',
              borderRadius: 'inherit',
              width: `${acc * 100}%`,
              bgcolor: theme.palette.primary.main,
              transition: 'width 300ms ease',
              display: 'block',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

/* ---------- MAIN ---------- */
export default function ToeicQuickResultModal({
  open,
  data,
  onClose,
  onReviewDetails,
  onSuggestPlan,
  testId,
  practicedParts,
}: ToeicQuickResultModalProps) {
  const { answers = [], score } = data || {};
  const [showSuggest, setShowSuggest] = useState(false);
  const stats = useMemo(() => {
    const total = answers.length;
    const correct = answers.filter((a) => a.isCorrect).length;
    const accuracy = total ? correct / total : 0;
    const toeic = estimateToeic990(accuracy);
    const cefr = estimateCEFR(toeic);

    // Group theo Part dựa trên vị trí câu trong mảng answers
    const byPart: Record<
      1 | 2 | 3 | 4 | 5 | 6 | 7,
      { total: number; correct: number }
    > = {
      1: { total: 0, correct: 0 },
      2: { total: 0, correct: 0 },
      3: { total: 0, correct: 0 },
      4: { total: 0, correct: 0 },
      5: { total: 0, correct: 0 },
      6: { total: 0, correct: 0 },
      7: { total: 0, correct: 0 },
    };

    answers.forEach((a, idx) => {
      const part = mapIndexToPart(idx);
      byPart[part].total += 1;
      if (a.isCorrect) byPart[part].correct += 1;
    });

    // Nếu có practicedParts, chỉ lấy các part đã luyện
    const displayParts =
      practicedParts && practicedParts.length > 0
        ? practicedParts
        : [1, 2, 3, 4, 5, 6, 7]; // Mặc định hiển thị tất cả

    return { total, correct, accuracy, toeic, cefr, byPart, displayParts };
  }, [answers, practicedParts]);

  useEffect(() => {
    const fetchLearningPath = async () => {
      try {
        const res = await learningPathService.getUserLearningPath();
        if (!res.data) {
          setShowSuggest(true);
        }
      } catch (error) {
        console.error("Error fetching learning path suggestion:", error);
      }
    };
    fetchLearningPath();
  }, [stats]);

  const renderFooter = () => (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      gap={1.25}
      sx={{ px: 0.5, pt: 1 }}
    >
      {/* LEFT: links (nhẹ thị giác) */}
      <Stack direction="row" gap={0.5} flexWrap="wrap">
        {onReviewDetails && (
          <Button
            variant="text"
            color="primary"
            startIcon={<VisibilityOutlined />}
            onClick={async () => {
              try {
                if (testId) {
                  const res = await userTestService.getUserTestHistories(
                    1,
                    1,
                    testId
                  );
                  const resultId = res.data[0]._id;
                  onReviewDetails(resultId);
                }
              } catch (error) {
                console.error("Error fetching user test histories:", error);
                onReviewDetails("");
              }
            }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 1,
              minHeight: 36,
            }}
          >
            Xem lại bài làm
          </Button>
        )}
      </Stack>

      {/* RIGHT: Primary CTA duy nhất */}
      {showSuggest && onSuggestPlan && (
        <Button
          variant="contained"
          color="primary"
          onClick={onSuggestPlan}
          startIcon={<TrendingUpRounded />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "999px",
            px: 2.5,
            minHeight: 44,
            width: { xs: "100%", sm: "auto" },
            boxShadow: "0 10px 24px rgba(37,99,235,0.28)",
          }}
        >
          Gợi ý lộ trình học
        </Button>
      )}

      {!showSuggest && (
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          startIcon={<TrendingUpRounded />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "999px",
            px: 2.5,
            minHeight: 44,
            width: { xs: "100%", sm: "auto" },
            boxShadow: "0 10px 24px rgba(37,99,235,0.28)",
          }}
        >
          Luyện tập tiếp
        </Button>
      )}
    </Stack>
  );

  return (
    <BaseModal
      open={open}
      type="success"
      title="Kết quả bài thi TOEIC"
      buttonOther={renderFooter()}
      onCancel={onClose}
    >
      <Stack gap={2} className="w-full">
        {/* ===== TOP SUMMARY (morphism) ===== */}
        <Card
          elevation={0}
          className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 backdrop-blur-md shadow-[0_10px_40px_rgba(2,6,23,0.10)]"
        >
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              {/* Accuracy ring */}
              <Grid size={{ xs: 12, sm: 5, md: 4 }}>
                <Box className="relative flex items-center justify-center py-4">
                  <CircularProgress
                    variant="determinate"
                    value={stats.accuracy * 100}
                    size={128}
                    thickness={5}
                    color="success"
                  />
                  <Box className="absolute flex flex-col items-center justify-center">
                    <Typography variant="h4" className="font-bold leading-none">
                      {pctText(stats.accuracy)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Accuracy
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Summary + actions */}
              <Grid size={{ xs: 12, sm: 7, md: 8 }}>
                <Stack gap={0.5} className="mb-2">
                  <Typography variant="h6" className="font-semibold">
                    Tổng quan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tóm tắt dựa trên bài làm vừa nộp.
                  </Typography>
                </Stack>

                <Stack direction="row" gap={1} flexWrap="wrap">
                  <StatChip label={`Đúng ${stats.correct}/${stats.total}`} />
                  <StatChip
                    label={`Ước tính TOEIC: ${score}/990`}
                    tone="primary"
                  />
                  {typeof score === "number" && (
                    <StatChip label={`Điểm hệ thống: ${round(score, 2)}`} />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ===== PART OVERVIEW ===== */}
        <Card
          elevation={0}
          className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 backdrop-blur-md shadow-[0_10px_40px_rgba(2,6,23,0.08)]"
        >
          <CardContent>
            <Typography variant="subtitle1" className="font-semibold mb-2">
              Phân bố theo Part
            </Typography>

            <Grid container spacing={1.5}>
              {stats.displayParts.map((p) => {
                const item = stats.byPart[p as 1 | 2 | 3 | 4 | 5 | 6 | 7];
                // Chỉ hiển thị part có câu hỏi
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p}>
                    <PartMiniCard
                      title={PART_LABELS[p]}
                      correct={item.correct}
                      total={item.total}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </BaseModal>
  );
}
