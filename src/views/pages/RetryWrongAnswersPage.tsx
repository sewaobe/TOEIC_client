import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import userTestService from "../../services/user_test.service";
import { questionService } from "../../services/question.service";
import testService from "../../services/test.service";
import type { RawAnswer } from "../../utils/mapAnswersToParts";
import { getPartFromTags } from "../../utils/mapAnswersToParts";
import type { ExamGroup, ExamQuestion } from "../../types/Exam";
import ConfirmModal from "../../components/modals/ConfirmModal";
import ToeicQuickResultModal, { ResultPayload } from "../../components/modals/ToeicQuickResultModal";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";

type GroupWithAnswers = ExamGroup & {
  answersInGroup: RawAnswer[];
};

const parts = [1, 2, 3, 4, 5, 6, 7];

const RetryWrongAnswersPage = () => {
  const { testId, historyId } = useParams<{ testId: string; historyId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<RawAnswer[]>([]);
  const [groups, setGroups] = useState<GroupWithAnswers[]>([]);
  const [activePart, setActivePart] = useState<number | null>(null);
  const [testTitle, setTestTitle] = useState<string>("");
  const [choiceMap, setChoiceMap] = useState<Record<string, string>>({}); // question_id -> selected
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultData, setResultData] = useState<ResultPayload>({ answers: [] });
  const [submitted, setSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const userId = useSelector((s: RootState) => s.user.user?._id);
  const [startTime] = useState(Date.now());

  // Fetch history + title
  useEffect(() => {
    const run = async () => {
      if (!historyId) return;
      setLoading(true);
      try {
        if (testId) {
          try {
            const { test } = await testService.getTestById(testId);
            setTestTitle(test?.title || "");
          } catch { }
        }
        const data = await userTestService.getTestHistoryDetail(historyId);
        // only wrong or skipped
        const filtered = (data.answers || []).filter(
          (a) => a.selectedOption === "" || a.isCorrect === false
        );
        setAnswers(filtered);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [historyId]);

  // Fetch groups for these answers
  useEffect(() => {
    const fetchGroups = async () => {
      if (!answers.length || !testId) return;
      setLoading(true);
      try {
        const byQid = new Map<string, RawAnswer>();
        answers.forEach((a) => byQid.set(a.question_id, a));
        const fetched: Record<string, GroupWithAnswers> = {};
        await Promise.all(
          answers.map(async (ans) => {
            try {
              const g = await questionService.getQuestionByIdFromGroup(ans.question_id, testId);
              if (!fetched[g._id]) fetched[g._id] = { ...g, answersInGroup: [] } as GroupWithAnswers;
              fetched[g._id].answersInGroup.push(byQid.get(ans.question_id)!);
            } catch (e) {
              console.error(e);
            }
          })
        );
        const arr = Object.values(fetched).sort((a, b) => {
          const qa = a.answersInGroup[0]?.question_no ?? 0;
          const qb = b.answersInGroup[0]?.question_no ?? 0;
          return qa - qb;
        });
        setGroups(arr);
        if (arr.length) setActivePart(arr[0].part);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [answers, testId]);

  // Before unload guard if progress not submitted
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const hasProgress = Object.values(choiceMap).some((v) => !!v);
      if (!submitted && hasProgress) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [choiceMap, submitted]);

  const questionIdToPart = useMemo(() => {
    const map = new Map<string, number>();
    groups.forEach((g) => g.questions.forEach((q) => map.set(q._id, g.part)));
    return map;
  }, [groups]);

  const scrollToPart = (part: number) => {
    setActivePart(part);
    const el = containerRef.current?.querySelector(`#part-${part}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToQuestion = (qno: number) => {
    const ans = answers.find((a) => a.question_no === qno);
    const part = ans ? questionIdToPart.get(ans.question_id) : undefined;
    if (part && activePart !== part) {
      setActivePart(part);
      setTimeout(() => {
        const el = containerRef.current?.querySelector(`#q-${qno}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } else {
      const el = containerRef.current?.querySelector(`#q-${qno}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const setChoice = (qid: string, value: string) =>
    setChoiceMap((prev) => ({ ...prev, [qid]: value }));

  const answeredCount = useMemo(
    () => Object.values(choiceMap).filter(Boolean).length,
    [choiceMap]
  );

  const handleBack = () => {
    const hasProgress = Object.values(choiceMap).some((v) => !!v);
    if (!submitted && hasProgress) setConfirmLeave(true);
    else navigate(location.pathname.replace(/\/retry$/, ""));
  };

  const submitRetry = async () => {
    try {
      const answersMap = Object.entries(choiceMap)
        .filter(([, v]) => !!v)
        .map(([qid, v]) => ({ question_id: qid, selectedOption: v }));
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const result = await testService.submitTest(
        false,
        testId!,
        userId!,
        answersMap,
        elapsed,
        "retry_wrong",
      );
      setResultData({
        score: result.score,
        answers: result.answers.map((a: any, idx: number) => ({
          ...a,
          question_no: idx + 1,
        })),
      });
      setSubmitted(true);
      setConfirmSubmit(false);
      setResultOpen(true);
    } catch (e) {
      console.error("Submit retry failed", e);
      setConfirmSubmit(false);
    }
  };



  return (
    <MainLayout>
      <Box display="flex" gap={2} p={2}>
        {/* Main column */}
        <Box ref={containerRef} sx={{ flex: 1, maxWidth: 960, mx: "auto" }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton size="small" onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6">Làm lại bài thi{testTitle ? `: ${testTitle}` : ""}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Đã trả lời: {answeredCount}/{answers.length}
            </Typography>
          </Stack>

          {/* Part tabs */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
            {parts.map((p) => (
              <Chip
                key={p}
                label={`Part ${p}`}
                color={activePart === p ? "primary" : "default"}
                onClick={() => scrollToPart(p)}
                variant={activePart === p ? "filled" : "outlined"}
                size="small"
              />
            ))}
          </Stack>

          {/* Progress + Submit */}
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Đã trả lời: {answeredCount}/{answers.length}
            </Typography>
            <Button variant="contained" size="small" onClick={() => setConfirmSubmit(true)}>
              Nộp bài
            </Button>
          </Stack>

          {loading && (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          )}

          {!loading && groups.length > 0 && (
            <Box className="space-y-8">
              {groups
                .filter((g) => (activePart ? g.part === activePart : true))
                .map((g, gi, arr) => (
                  <Box key={g._id}>
                    {gi === 0 || arr[gi - 1].part !== g.part ? (
                      <Typography id={`part-${g.part}`} variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                        Part {g.part}
                      </Typography>
                    ) : null}

                    <Box className="bg-white rounded-xl shadow" sx={{ p: 2, maxWidth: 900, mx: "auto" }}>
                      {g.audioUrl && (
                        <Box sx={{ mb: 1 }}>
                          <audio src={g.audioUrl} controls className="w-full" />
                        </Box>
                      )}
                      {g.imagesUrl?.length ? (
                        <Box sx={{ mb: 2 }}>
                          {g.imagesUrl.map((u, i) => (
                            <img key={i} src={u} alt={`img-${i}`} className="w-full rounded-lg mb-2 object-contain" style={{ maxHeight: 380, border: "1px solid #eee" }} />
                          ))}
                        </Box>
                      ) : null}

                      {/* Only wrong/skipped questions */}
                      {g.questions
                        .filter((q) => answers.some((a) => a.question_id === q._id))
                        .map((q) => (
                          <RetryQuestionBlock
                            key={q._id}
                            q={q}
                            answer={answers.find((a) => a.question_id === q._id)!}
                            selected={choiceMap[q._id] || ""}
                            onSelect={(v) => setChoice(q._id, v)}
                          />
                        ))}
                    </Box>
                  </Box>
                ))}
            </Box>
          )}
        </Box>

        {/* Right navigator */}
        <Box sx={{ width: 220, position: "sticky", top: 12, alignSelf: "flex-start" }}>
          <Box className="bg-white rounded-xl shadow" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Điều hướng
            </Typography>
            {parts.map((p) => {
              const qs = answers
                .filter((a) => {
                  const partFromTag = getPartFromTags(a.tags);
                  const partFromNo = (() => {
                    const q = a.question_no;
                    if (q >= 1 && q <= 6) return 1;
                    if (q >= 7 && q <= 31) return 2;
                    if (q >= 32 && q <= 70) return 3;
                    if (q >= 71 && q <= 100) return 4;
                    if (q >= 101 && q <= 130) return 5;
                    if (q >= 131 && q <= 146) return 6;
                    if (q >= 147 && q <= 200) return 7;
                    return undefined;
                  })();
                  return (partFromTag ?? partFromNo) === p;
                })
                .sort((a, b) => a.question_no - b.question_no);
              if (!qs.length) return null;
              return (
                <Box key={p} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Part {p}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                    {qs.map((a) => {
                      const selected = choiceMap[a.question_id];
                      // Border-only status: green border when answered, otherwise gray
                      let sxStyle: any = { minWidth: 36, p: 0, fontSize: 12, borderColor: "#D1D5DB", color: "#4B5563", bgcolor: "#fff" };
                      if (selected) {
                        sxStyle = { ...sxStyle, borderColor: "#10B981", color: "#065F46", bgcolor: "#F8FFFB" };
                      }
                      return (
                        <Button key={a.question_id} size="small" variant="outlined" sx={sxStyle} onClick={() => scrollToQuestion(a.question_no)}>
                          {a.question_no}
                        </Button>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Confirm leave without submit */}
      <ConfirmModal
        open={confirmLeave}
        title="Thoát khi chưa nộp bài?"
        message="Bạn có muốn thoát không? Các câu đã làm sẽ mất."
        onConfirm={() => navigate(location.pathname.replace(/\/retry$/, ""))}
        onCancel={() => setConfirmLeave(false)}
        confirmText="Thoát"
        cancelText="Tiếp tục làm"
        type="warning"
      />

      {/* Confirm submit */}
      <ConfirmModal
        open={confirmSubmit}
        title="Nộp bài làm lại"
        message="Bạn chắc chắn muốn nộp bài làm lại?"
        onConfirm={submitRetry}
        onCancel={() => setConfirmSubmit(false)}
        confirmText="Nộp bài"
        cancelText="Hủy"
      />

      {/* Result modal */}
      <ToeicQuickResultModal
        isGuest={false}
        open={resultOpen}
        data={resultData}
        onClose={() => setResultOpen(false)}
        onReviewDetails={() => navigate(location.pathname.replace(/\/retry$/, "/answers"))}
      />
    </MainLayout>
  );
};

function RetryQuestionBlock({ q, answer, selected, onSelect }: { q: ExamQuestion; answer: RawAnswer; selected: string; onSelect: (v: string) => void }) {
  return (
    <Box id={`q-${answer.question_no}`} sx={{ mb: 2, p: 2, borderRadius: 2, border: "1px solid #eee", bgcolor: "#fafafa" }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
        {answer.question_no}. {q.textQuestion || ""}
      </Typography>
      <RadioGroup value={selected} onChange={(e) => onSelect((e.target as HTMLInputElement).value)}>
        {Object.keys(q.choices)
          .sort()
          .map((k) => (
            <FormControlLabel key={k} value={k} control={<Radio size="small" />} label={q.choices[k]} />
          ))}
      </RadioGroup>
    </Box>
  );
}

export default RetryWrongAnswersPage;
