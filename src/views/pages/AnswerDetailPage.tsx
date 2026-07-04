import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
  Collapse,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import userTestService from "../../services/user_test.service";
import { questionService } from "../../services/question.service";
import testService from "../../services/test.service";
import type { RawAnswer } from "../../utils/mapAnswersToParts";
import type { ExamGroup, ExamQuestion } from "../../types/Exam";
import { clearChatRouteState, compactQuestionText, setChatRouteState } from "../../utils/chatRouteState";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../stores/store";
import {
  disableHighlightPopup,
  enableHighlightPopup,
} from "../../stores/highlightPopupSlice";

type GroupWithAnswers = ExamGroup & {
  answersInGroup: RawAnswer[];
};

const parts = [1, 2, 3, 4, 5, 6, 7];

const AnswerDetailPage = () => {
  const { testId, historyId } = useParams<{
    testId: string;
    historyId: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<RawAnswer[]>([]);
  const [groups, setGroups] = useState<GroupWithAnswers[]>([]);
  const [activePart, setActivePart] = useState<number | null>(null);
  const [testTitle, setTestTitle] = useState<string>("");
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedQuestionId = useMemo(
    () => new URLSearchParams(location.search).get("questionId") ?? undefined,
    [location.search]
  );
  const focusTs = useMemo(
    () => new URLSearchParams(location.search).get("focusTs") ?? undefined,
    [location.search]
  );
  const answerFilter = useMemo(
    () => new URLSearchParams(location.search).get("filter") ?? undefined,
    [location.search]
  );
  const visibleAnswers = useMemo(() => {
    if (answerFilter !== "wrong") return answers;
    return answers.filter((answer) => answer.selectedOption === "" || answer.isCorrect === false);
  }, [answers, answerFilter]);

  useEffect(() => {
    dispatch(enableHighlightPopup());

    return () => {
      dispatch(disableHighlightPopup());
    };
  }, [dispatch]);

  // Fetch answers first
  useEffect(() => {
    const run = async () => {
      if (!historyId) return;
      setLoading(true);
      try {
        // fetch title
        if (testId) {
          try {
            const { test } = await testService.getTestById(testId);
            setTestTitle(test?.title || "");
          } catch {
            // Title is optional for this review page.
          }
        }
        const data = await userTestService.getTestHistoryDetail(historyId);
        const arr = data.answers || [];
        setAnswers(arr);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [historyId, testId]);

  // Fetch groups that contain the answered questions
  useEffect(() => {
    const fetchGroups = async () => {
      if (!visibleAnswers.length || !testId) {
        setGroups([]);
        return;
      }
      setLoading(true);
      try {
        const byQid = new Map<string, RawAnswer>();
        visibleAnswers.forEach((a) => byQid.set(a.question_id, a));

        // Deduplicate group by id after fetching
        const fetched: Record<string, GroupWithAnswers> = {};

        await Promise.all(
          visibleAnswers.map(async (ans) => {
            try {
              const g = await questionService.getQuestionByIdFromGroup(
                ans.question_id,
                testId
              );
              if (!fetched[g._id]) {
                fetched[g._id] = {
                  ...g,
                  answersInGroup: [],
                } as GroupWithAnswers;
              }
              fetched[g._id].answersInGroup.push(byQid.get(ans.question_id)!);
            } catch (err) {
              console.error(
                "Failed to fetch group for question",
                ans.question_id,
                err
              );
            }
          })
        );

        const arr: GroupWithAnswers[] = Object.values(fetched).sort((a, b) => {
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
  }, [visibleAnswers, testId]);

  const answerMap = useMemo(() => {
    const m = new Map<string, RawAnswer>();
    visibleAnswers.forEach((a) => m.set(a.question_id, a));
    return m;
  }, [visibleAnswers]);

  const scrollToPart = (part: number) => {
    const params = new URLSearchParams(location.search);
    params.delete("questionId");
    params.delete("focusTs");
    const nextSearch = params.toString();
    setActivePart(part);
    if (nextSearch !== location.search.replace(/^\?/, "")) {
      navigate(nextSearch ? `${location.pathname}?${nextSearch}` : location.pathname, { replace: true });
    }
    window.setTimeout(() => {
      const el = containerRef.current?.querySelector(`#part-${part}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  // Map questionId -> part to ensure rightbar navigates correctly
  const questionIdToPart = useMemo(() => {
    const map = new Map<string, number>();
    groups.forEach((g) => {
      g.questions.forEach((q) => map.set(q._id, g.part));
    });
    return map;
  }, [groups]);

  const questionRefs = useMemo(() => {
    const questionText = new Map<string, string | undefined>();
    groups.forEach((g) => {
      g.questions.forEach((q) => questionText.set(q._id, q.textQuestion));
    });
    return visibleAnswers.map((answer) => ({
      questionNumber: answer.question_no,
      questionId: answer.question_id,
      textPreview: compactQuestionText(questionText.get(answer.question_id)),
    }));
  }, [groups, visibleAnswers]);

  const currentQuestionNumber = useMemo(() => {
    if (!selectedQuestionId) return undefined;
    return visibleAnswers.find((answer) => answer.question_id === selectedQuestionId)?.question_no;
  }, [selectedQuestionId, visibleAnswers]);

  useEffect(() => {
    setChatRouteState({
      attemptId: historyId,
      questionId: selectedQuestionId,
      currentQuestionNumber,
      questionRefs,
    });
    return clearChatRouteState;
  }, [historyId, selectedQuestionId, currentQuestionNumber, questionRefs]);

  const syncQuestionQuery = useCallback((questionId: string) => {
    const params = new URLSearchParams(location.search);
    params.set("questionId", questionId);
    params.set("focusTs", String(Date.now()));
    const nextSearch = params.toString();
    navigate(`${location.pathname}?${nextSearch}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const findQuestionElement = useCallback(
    (questionId: string) =>
      containerRef.current?.querySelector(`[data-question-id="${questionId}"]`),
    []
  );

  const focusQuestionElement = useCallback((questionId: string) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = findQuestionElement(questionId);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setFocusedQuestionId(questionId);
        window.setTimeout(() => {
          setFocusedQuestionId((current) => (current === questionId ? null : current));
        }, 1800);
      });
    });
  }, [findQuestionElement]);

  const scrollToQuestionId = useCallback((questionId: string, options?: { updateQuery?: boolean }) => {
    const part = questionIdToPart.get(questionId);
    if (options?.updateQuery !== false) {
      syncQuestionQuery(questionId);
    }
    if (part && activePart !== part) {
      setActivePart(part);
      window.setTimeout(() => focusQuestionElement(questionId), 80);
      return;
    }
    focusQuestionElement(questionId);
  }, [activePart, focusQuestionElement, questionIdToPart, syncQuestionQuery]);

  const scrollToQuestion = (qno: number, options?: { updateQuery?: boolean }) => {
    // find the answer by qno to know its question_id
    const ans = visibleAnswers.find((a) => a.question_no === qno);
    if (ans) scrollToQuestionId(ans.question_id, options);
  };

  useEffect(() => {
    if (!focusTs) return;
    if (!selectedQuestionId || !visibleAnswers.length || !groups.length) return;
    if (!visibleAnswers.some((item) => item.question_id === selectedQuestionId)) return;
    scrollToQuestionId(selectedQuestionId, { updateQuery: false });
  }, [selectedQuestionId, focusTs, visibleAnswers, groups, scrollToQuestionId]);

  return (
    <MainLayout>
      {/* <SecondLayout> */}
      <Box display="flex" gap={2} p={2}>
        {/* Main column */}
        <Box ref={containerRef} sx={{ flex: 1, maxWidth: 960, mx: "auto" }}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                size="small"
                onClick={() => {
                  const from = (location.state as { from?: string } | null)?.from;
                  if (from) {
                    navigate(from);
                  } else {
                    // Fallback: remove /answers from path
                    navigate(location.pathname.replace(/\/answers$/, ""));
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6">
                Đáp án chi tiết{testTitle ? `: ${testTitle}` : ""}
              </Typography>
            </Stack>
          </Stack>

          {/* Centered part tabs */}
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mb: 2 }}
          >
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

          {loading && (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          )}

          {!loading && groups.length === 0 && (
            <Typography>Không tìm thấy dữ liệu đáp án.</Typography>
          )}

          {!loading && groups.length > 0 && (
            <Box className="space-y-8">
              {groups
                .filter((g) => (activePart ? g.part === activePart : true))
                .map((g, gi, arr) => (
                  <Box key={g._id}>
                    {/* Part anchor */}
                    {gi === 0 || arr[gi - 1].part !== g.part ? (
                      <Typography
                        id={`part-${g.part}`}
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ mb: 1 }}
                      >
                        Part {g.part}
                      </Typography>
                    ) : null}

                    {/* Group card (narrower, centered) */}
                    <Box
                      className="bg-white rounded-xl shadow"
                      sx={{ p: 2, maxWidth: 900, mx: "auto" }}
                    >
                      {g.audioUrl && (
                        <Box sx={{ mb: 1 }}>
                          <audio src={g.audioUrl} controls className="w-full" />
                        </Box>
                      )}

                      {g.imagesUrl && g.imagesUrl.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          {g.imagesUrl.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`img-${i}`}
                              className="w-full rounded-lg mb-2 object-contain"
                              style={{
                                maxHeight: 380,
                                objectFit: "contain",
                                border: "1px solid #eee",
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Transcript toggle (show before questions) */}
                      {(g.transcriptEnglish || g.transcriptTranslation) && (
                        <TranscriptBox
                          english={g.transcriptEnglish}
                          translation={g.transcriptTranslation}
                        />
                      )}

                      {/* Questions within the group that belong to user answers */}
                      {g.questions
                        .filter((q) => answerMap.has(q._id))
                        .map((q) => (
                          <QuestionBlock
                            key={q._id}
                            q={q}
                            ans={answerMap.get(q._id)!}
                            focused={focusedQuestionId === q._id}
                            testId={testId || ""}
                            attemptId={historyId || ""}
                            testTitle={testTitle}
                          />
                        ))}
                    </Box>
                  </Box>
                ))}
            </Box>
          )}
        </Box>

        {/* Right navigator */}
        <Box
          sx={{
            width: 220,
            position: "sticky",
            top: 12,
            alignSelf: "flex-start",
          }}
        >
          <Box className="bg-white rounded-xl shadow" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Điều hướng
            </Typography>
            {parts.map((p) => {
              const qs = visibleAnswers
                .filter((a) => {
                  const partFromGroup = questionIdToPart.get(a.question_id);
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
                  return (partFromGroup ?? partFromNo) === p;
                })
                .sort((a, b) => a.question_no - b.question_no);
              if (!qs.length) return null;
              return (
                <Box key={p} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Part {p}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      flexWrap: "wrap",
                      mt: 0.5,
                    }}
                  >
                    {qs.map((a) => {
                      const status =
                        a.selectedOption === ""
                          ? "skipped"
                          : a.isCorrect
                          ? "correct"
                          : "wrong";
                      let sxStyle: SxProps<Theme> = {
                        minWidth: 36,
                        p: 0,
                        fontSize: 12,
                        borderColor: "#D6D6D6",
                        color: "#555",
                      };
                      if (status === "correct")
                        sxStyle = {
                          ...sxStyle,
                          bgcolor: "#D1FADF",
                          color: "#065F46",
                          border: "none",
                        };
                      else if (status === "wrong")
                        sxStyle = {
                          ...sxStyle,
                          bgcolor: "#FEE2E2",
                          color: "#B91C1C",
                          border: "none",
                        };
                      else if (status === "skipped")
                        sxStyle = {
                          ...sxStyle,
                          bgcolor: "#FEF3C7",
                          color: "#92400E",
                          border: "none",
                        };
                      return (
                        <Button
                          key={a.question_id}
                          size="small"
                          variant="outlined"
                          sx={sxStyle}
                          onClick={() => scrollToQuestion(a.question_no)}
                        >
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
      {/* </SecondLayout> */}
    </MainLayout>
  );
};

type AnswerStatus = "correct" | "wrong" | "skipped";

function QuestionBlock({
  q,
  ans,
  focused,
  testId,
  attemptId,
  testTitle,
}: {
  q: ExamQuestion;
  ans: RawAnswer;
  focused?: boolean;
  testId: string;
  attemptId: string;
  testTitle?: string;
}) {
  const [openExplain, setOpenExplain] = useState(false);
  const status: AnswerStatus =
    ans.selectedOption === "" ? "skipped" : ans.isCorrect ? "correct" : "wrong";
  const stylesByStatus: Record<AnswerStatus, { borderColor: string; bgcolor: string }> = {
    correct: { borderColor: "#86efac", bgcolor: "#f0fdf4" },
    wrong: { borderColor: "#fecaca", bgcolor: "#fef2f2" },
    skipped: { borderColor: "#fde68a", bgcolor: "#fffbeb" },
  };
  const chipByStatus: Record<AnswerStatus, { label: string; color: "success" | "error" | "warning"; variant: "filled" }> = {
    correct: {
      label: "Đúng",
      color: "success" as const,
      variant: "filled" as const,
    },
    wrong: {
      label: "Sai",
      color: "error" as const,
      variant: "filled" as const,
    },
    skipped: {
      label: "Bỏ qua",
      color: "warning" as const,
      variant: "filled" as const,
    },
  };
  const handleAskChatbot = () => {
    if (!testId || !attemptId || !ans.question_id) return;
    window.dispatchEvent(
      new CustomEvent("chatbot:quick-question-explain", {
        detail: {
          requestId: `${Date.now()}-${ans.question_id}`,
          testId,
          attemptId,
          questionId: ans.question_id,
          questionNumber: ans.question_no,
          textPreview: compactQuestionText(q.textQuestion),
          testTitle,
        },
      })
    );
  };

  return (
    <Box
      id={`q-${ans.question_no}`}
      data-question-id={ans.question_id}
      sx={{
        mb: 2,
        p: 2,
        scrollMarginTop: "96px",
        borderRadius: 2,
        border: "1px solid",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        boxShadow: focused ? "0 0 0 3px rgba(37, 99, 235, 0.35)" : "none",
        transform: focused ? "translateY(-2px)" : "none",
        ...stylesByStatus[status],
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 0.5,
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          sx={{ color: "primary.main", flex: 1, minWidth: 0 }}
        >
          {ans.question_no}. {q.textQuestion || ""}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleAskChatbot}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 1.25,
              py: 0.25,
              minWidth: "auto",
              bgcolor: "#fff",
            }}
          >
            Hỏi chatbot
          </Button>
          <Chip size="small" {...chipByStatus[status]} />
        </Stack>
      </Box>
      {Object.entries(q.choices).map(([key, value]) => {
        const isCorrect = key === q.correctAnswer;
        const isSelected = key === ans.selectedOption;
        return (
          <Box
            key={key}
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
          >
            <Typography
              sx={{
                fontSize: 15,
                color: isCorrect
                  ? "success.main"
                  : isSelected && !isCorrect
                  ? "error.main"
                  : "text.primary",
                fontWeight: isCorrect ? 700 : 500,
              }}
            >
              {value}
            </Typography>
            {isCorrect && (
              <CheckCircleOutlineIcon fontSize="small" color="success" />
            )}
            {isSelected && !isCorrect && (
              <CancelOutlinedIcon fontSize="small" color="error" />
            )}
          </Box>
        );
      })}

      <Divider sx={{ my: 1 }} />
      <Typography variant="body2" color="success.main" fontWeight={700}>
        Đáp án đúng: {q.correctAnswer}
      </Typography>
      {q.explanation && (
        <Box sx={{ mt: 0.5 }}>
          <Button
            endIcon={openExplain ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            size="small"
            onClick={() => setOpenExplain((v) => !v)}
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            Giải thích chi tiết đáp án
          </Button>
          <Collapse in={openExplain}>
            <Typography
              sx={{
                whiteSpace: "pre-line",
                mt: 0.5,
                bgcolor: "#F9FAFB",
                p: 1.5,
                borderRadius: 1,
              }}
            >
              {q.explanation}
            </Typography>
          </Collapse>
        </Box>
      )}
    </Box>
  );
}

function TranscriptBox({
  english,
  translation,
}: {
  english?: string;
  translation?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!english && !translation) return null;
  return (
    <Box sx={{ mt: 1 }}>
      <Button
        size="small"
        endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setOpen((v) => !v)}
        sx={{ fontWeight: 600 }}
      >
        Hiện Transcript
      </Button>
      <Collapse in={open}>
        {english && (
          <Typography
            sx={{
              whiteSpace: "pre-line",
              mt: 0.5,
              bgcolor: "#E5F4FF",
              p: 1.25,
              borderRadius: 1,
            }}
          >
            {english}
          </Typography>
        )}
        {translation && (
          <Typography
            sx={{
              whiteSpace: "pre-line",
              color: "text.secondary",
              mt: 0.75,
              bgcolor: "#F3F4F6",
              p: 1.25,
              borderRadius: 1,
            }}
          >
            {translation}
          </Typography>
        )}
      </Collapse>
    </Box>
  );
}

export default AnswerDetailPage;
