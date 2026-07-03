import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dictation, DictationAttemptLog } from "../../types/Dictation";
import { dictationAttemptService } from "../../services/dictation_attempt.service";
import { dictationProgressService } from "../../services/dictation_progress.service";
import geminiService from "../../services/gemini.service";
import type { DictationProgress } from "../../types/DictationProgress";
import DictationAIAnalysis from "./DictationAIAnalysis";
import { loadStopWords } from "../../utils/stopWord";
import {
  calculateWordSimilarity,
  normalizeForDictation,
  tokenizeForDictation,
} from "../../utils/textSimilarity.util";
import DictationHeader from "./dictation-components/DictationHeader";
import DictationMain from "./dictation-components/DictationMain";
import DictationFeedbackPanel from "./dictation-components/DictationFeedbackPanel";
import DictationCompletionOverlay from "./dictation-components/DictationCompletionOverlay";
import DictationTourGuide from "../tour-guide/DictationTourGuide";

export type Difficulty = "easy" | "medium" | "hard";

export interface DictationWord {
  word: string;
  isBlank: boolean;
  index: number;
}

type SentenceItem = {
  id: number;
  text: string;
  words: DictationWord[];
};

type SentenceRecord = {
  answers: Record<number, string>;
  showAnswer: boolean;
  accuracy: number;
  mistakes: string[];
  passed: boolean;
};

type EvaluationResult = {
  accuracy: number;
  mistakes: string[];
  correctTokens: string[];
  userTokens: string[];
  correctMatches: boolean[];
  userMatches: boolean[];
};

const hasResumeableDictationProgress = (
  progress: DictationProgress | null
): progress is DictationProgress => {
  if (!progress) return false;
  if ((progress.attempt_logs?.length ?? 0) > 0) return true;
  if ((progress.completed_indices?.length ?? 0) > 0) return true;

  return Object.values(progress.sentence_records ?? {}).some((record) => {
    const hasAnswer = Object.values(record.answers ?? {}).some(
      (answer) => answer.trim().length > 0
    );

    return (
      hasAnswer ||
      record.showAnswer ||
      record.accuracy > 0 ||
      record.passed
    );
  });
};

export type DictationRuleInsights = {
  strengths: string[];
  weaknesses: string[];
  patterns: string[];
  suggestion: string;
};

interface DictationContentV2Props {
  dictation: Dictation;
  initialDifficulty?: Difficulty;
  onBackToList?: () => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}

const getBlankRatio = (level: Difficulty): number =>
  level === "easy" ? 0.2 : level === "hard" ? 0.55 : 0.35;

const splitWords = (text: string): string[] => text.split(/\s+/).filter(Boolean);

const normalizeToken = (value: string): string => normalizeForDictation(value);

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
) => {
  const correctMatches = correctTokens.map((token, index) => {
    const userToken = userTokens[index];
    if (!userToken) return false;
    return normalizeToken(token) === normalizeToken(userToken);
  });

  const userMatches = userTokens.map((token, index) => {
    const correctToken = correctTokens[index];
    if (!correctToken) return false;
    return normalizeToken(token) === normalizeToken(correctToken);
  });

  return { correctTokens, userTokens, correctMatches, userMatches };
};

const alignTokens = (
  correctTokens: string[],
  userTokens: string[]
) => {
  const rows = userTokens.length + 1;
  const cols = correctTokens.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
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

    if (canSubstitute && dp[i][j] === dp[i - 1][j - 1] + substitutionCost) {
      if (substitutionCost === 0) {
        userMatches[i - 1] = true;
        correctMatches[j - 1] = true;
      }
      i -= 1;
      j -= 1;
      continue;
    }

    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      i -= 1;
      continue;
    }

    if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      j -= 1;
      continue;
    }

    break;
  }

  return { correctTokens, userTokens, correctMatches, userMatches };
};

const buildEasyEvaluation = (
  sentence: SentenceItem,
  userAnswers: Record<number, string>
): EvaluationResult => {
  const correctTokens = sentence.words.map((word) => word.word);
  const userTokens = splitWords(userAnswers[0] || "");
  const comparison = compareTokensByPosition(correctTokens, userTokens);
  const correct = comparison.correctMatches.filter(Boolean).length;
  const accuracy = correctTokens.length
    ? Math.round((correct / correctTokens.length) * 100)
    : 0;
  const mistakes = correctTokens.filter((_, index) => !comparison.correctMatches[index]);

  return { ...comparison, accuracy, mistakes };
};

const buildMediumEvaluation = (
  sentence: SentenceItem,
  userAnswers: Record<number, string>,
  blankIndices: number[]
): EvaluationResult => {
  const correctTokens = sentence.words.map((word) => word.word);
  const userTokens = sentence.words.map((word) =>
    word.isBlank ? userAnswers[word.index] || "" : word.word
  );
  const correctMatches = sentence.words.map((word) =>
    !word.isBlank
      ? true
      : normalizeToken(userAnswers[word.index] || "") === normalizeToken(word.word)
  );
  const userMatches = [...correctMatches];
  const correct = blankIndices.reduce((sum, index) => {
    const isCorrect =
      normalizeToken(userAnswers[index] || "") ===
      normalizeToken(sentence.words[index].word);
    return sum + (isCorrect ? 1 : 0);
  }, 0);
  const accuracy = blankIndices.length
    ? Math.round((correct / blankIndices.length) * 100)
    : 0;
  const mistakes = blankIndices
    .filter(
      (index) =>
        normalizeToken(userAnswers[index] || "") !==
        normalizeToken(sentence.words[index].word)
    )
    .map((index) => sentence.words[index].word);

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
  sentence: SentenceItem,
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
    .map((word, index) => {
      const norm = word.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
      return { word, norm, index };
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

  return parts.map((word, index) => ({
    word,
    index,
    isBlank: blanks.has(index),
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

const isPassedAccuracy = (difficulty: Difficulty, accuracy: number) =>
  accuracy >= PASS_THRESHOLD[difficulty];

const LEVEL_THRESHOLDS: Record<string, number> = {
  A1: 95,
  A2: 92,
  B1: 90,
  B2: 88,
  C1: 85,
  C2: 80,
};

const emptyInsights: DictationRuleInsights = {
  strengths: [],
  weaknesses: [],
  patterns: [],
  suggestion: "Tiếp tục duy trì nhịp luyện hiện tại và tăng dần độ khó.",
};

const normalizeInsightText = (value: string) =>
  normalizeForDictation(value).replace(/\s+/g, " ").trim();

const uniqueMessages = (messages: string[]) => Array.from(new Set(messages));

const isGenericSentenceMistake = (mistake: string) =>
  normalizeInsightText(mistake) === normalizeInsightText("Câu chưa chính xác");

const buildDictationRuleInsights = (
  logs: DictationAttemptLog[],
  level: string | undefined,
  timings: Dictation["timings"],
  avgTime: number
): DictationRuleInsights => {
  const normalizedLevel = (level || "B1").toUpperCase();
  const threshold = LEVEL_THRESHOLDS[normalizedLevel] ?? LEVEL_THRESHOLDS.B1;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const patterns: string[] = [];
  const mistakeCounts = new Map<string, { label: string; count: number }>();
  let finalWordMistakeCount = 0;

  logs.forEach((log) => {
    const validMistakes = (log.mistakes || [])
      .map((mistake) => mistake.trim())
      .filter(Boolean);
    const hasMistake = validMistakes.length > 0;

    if (log.accuracy >= threshold && !hasMistake) {
      strengths.push("Bạn nghe tốt các từ chính trong câu.");
    }

    if (log.accuracy < threshold || hasMistake) {
      const mistakeText =
        validMistakes.length && !validMistakes.some(isGenericSentenceMistake)
          ? validMistakes.join(", ")
          : "một số phần trong câu";
      weaknesses.push(`Bạn còn nhầm ở các từ: ${mistakeText}.`);
    }

    validMistakes
      .filter((mistake) => !isGenericSentenceMistake(mistake))
      .forEach((mistake) => {
        const key = normalizeInsightText(mistake);
        if (!key) return;

        const current = mistakeCounts.get(key);
        mistakeCounts.set(key, {
          label: current?.label ?? mistake,
          count: (current?.count ?? 0) + 1,
        });

        const sentenceText = timings[log.index]?.text || "";
        const sentenceTokens = tokenizeForDictation(sentenceText);
        const mistakeTokens = tokenizeForDictation(mistake);
        const finalTokens = sentenceTokens.slice(Math.max(sentenceTokens.length - 2, 0));
        const isFinalMistake = mistakeTokens.some((token) =>
          finalTokens.includes(token)
        );

        if (isFinalMistake) {
          finalWordMistakeCount += 1;
        }
      });
  });

  const repeatedMistakes = Array.from(mistakeCounts.values())
    .filter((item) => item.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  if (repeatedMistakes.length) {
    patterns.push(
      `Bạn thường nhầm từ/cụm: ${repeatedMistakes
        .map((item) => item.label)
        .join(", ")}.`
    );
  }

  if (finalWordMistakeCount >= 2) {
    patterns.push("Chú ý từ cuối câu.");
  }

  if (normalizedLevel === "B1") {
    patterns.push("Tập trung nghe các từ trọng tâm trong câu.");
  } else if (normalizedLevel === "B2") {
    patterns.push("Tập trung các cụm từ khó và nối âm.");
  } else if (normalizedLevel === "C1" || normalizedLevel === "C2") {
    patterns.push("Luyện phản xạ với câu dài và tốc độ tự nhiên.");
  }

  const hasWeaknessOrPattern = weaknesses.length > 0 || patterns.length > 0;
  const suggestionParts = [
    hasWeaknessOrPattern
      ? "Nghe chậm các từ khó, chia câu thành cụm để luyện tập hiệu quả hơn."
      : "Tiếp tục duy trì nhịp luyện hiện tại và tăng dần độ khó.",
  ];

  if (avgTime > 30) {
    suggestionParts.push("Bạn có thể luyện lại để rút ngắn thời gian phản xạ.");
  }

  return {
    strengths: uniqueMessages(strengths),
    weaknesses: uniqueMessages(weaknesses),
    patterns: uniqueMessages(patterns),
    suggestion: suggestionParts.join(" "),
  };
};

export default function DictationContentV2({
  dictation,
  initialDifficulty = "hard",
  onBackToList,
  onNextLesson,
  hasNextLesson = false,
}: DictationContentV2Props) {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [loadingSentences, setLoadingSentences] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentenceRecords, setSentenceRecords] = useState<Record<number, SentenceRecord>>({});
  const [currentAnswers, setCurrentAnswers] = useState<Record<number, string>>({});
  const [currentShowAnswer, setCurrentShowAnswer] = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  const [currentPassed, setCurrentPassed] = useState(false);
  const [autoNext, setAutoNext] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [openComplete, setOpenComplete] = useState(false);
  const [summary, setSummary] = useState({
    accuracy: 0,
    total: 0,
    avgTime: 0,
    totalTime: 0,
    completedItems: 0,
    difficulty: initialDifficulty as Difficulty,
    insights: emptyInsights,
    logs: [] as DictationAttemptLog[],
  });
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<unknown>(null);
  const [anchorSpeed, setAnchorSpeed] = useState<null | HTMLElement>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isRunGuide, setIsRunGuide] = useState<boolean>(() => {
    return localStorage.getItem("dictation_tour_seen") !== "true";
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoNextTimerRef = useRef<number | null>(null);
  const saveProgressTimerRef = useRef<number | null>(null);
  const attemptLogsRef = useRef<DictationAttemptLog[]>([]);
  const hasSubmittedRef = useRef(false);
  const progressIdRef = useRef<string | null>(null);
  const pendingRestoreRef = useRef<DictationProgress | null>(null);
  const hasUserInteractedRef = useRef(false);
  const isRestoringRef = useRef(false);
  const [activeProgress, setActiveProgress] = useState<DictationProgress | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [, setProgressId] = useState<string | null>(null);

  useEffect(() => {
    setDifficulty(initialDifficulty);
  }, [initialDifficulty, dictation._id]);

  useEffect(() => {
    let isMounted = true;

    const loadActiveProgress = async () => {
      try {
        const progress = await dictationProgressService.getActive(dictation._id);
        if (!isMounted) return;
        if (!hasResumeableDictationProgress(progress)) {
          setActiveProgress(null);
          setShowResumeDialog(false);
          return;
        }

        setActiveProgress(progress);
        setShowResumeDialog(true);
      } catch (error) {
        console.error("Failed to load active dictation progress:", error);
      }
    };

    setActiveProgress(null);
    setShowResumeDialog(false);
    setProgressId(null);
    progressIdRef.current = null;
    pendingRestoreRef.current = null;
    hasUserInteractedRef.current = false;
    loadActiveProgress();

    return () => {
      isMounted = false;
    };
  }, [dictation._id]);

  useEffect(() => {
    let isMounted = true;

    const build = async () => {
      setLoadingSentences(true);
      const ratio = getBlankRatio(difficulty);
      const results = await Promise.all(
        (dictation.timings || []).map(async (segment, index) => ({
          id: index + 1,
          text: segment.text,
          words: await buildWords(segment.text, ratio),
        }))
      );

      if (!isMounted) return;

      setSentences(results);
      setSentenceRecords({});
      setCurrentIndex(0);
      setCurrentAnswers({});
      setCurrentShowAnswer(false);
      setCurrentAccuracy(0);
      setCurrentPassed(false);
      setIsPlaying(false);
      setProgress(0);
      attemptLogsRef.current = [];
      hasSubmittedRef.current = false;
      setOpenComplete(false);
      setSummary({
        accuracy: 0,
        total: 0,
        avgTime: 0,
        totalTime: 0,
        completedItems: 0,
        difficulty,
        insights: emptyInsights,
        logs: [],
      });
      setAiAnalysis(null);
      setStartedAt(Date.now());
      setLoadingSentences(false);
    };

    build();

    return () => {
      isMounted = false;
    };
  }, [dictation, difficulty]);

  const totalItems = sentences.length;
  const currentItem = sentences[currentIndex];
  const currentSegment = dictation.timings?.[currentIndex];
  const blankIndices = useMemo(
    () =>
      currentItem?.words
        .filter((word) => word.isBlank)
        .map((word) => word.index) || [],
    [currentItem]
  );

  const passedIndices = useMemo(() => {
    return new Set(
      Object.entries(sentenceRecords)
        .filter(([, record]) => record.passed)
        .map(([index]) => Number(index))
    );
  }, [sentenceRecords]);

  const completed = passedIndices.size;
  const overallProgress = totalItems ? Math.round((completed / totalItems) * 100) : 0;
  const canAnalyze = totalItems > 0 && completed === totalItems;
  const canComplete = canAnalyze;

  const stopAudio = useCallback(() => {
    if (autoNextTimerRef.current !== null) {
      window.clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
    }
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const loadSentenceState = useCallback(
    (index: number) => {
      const record = sentenceRecords[index];
      setCurrentIndex(index);
      setCurrentAnswers(record?.answers ?? {});
      setCurrentShowAnswer(record?.showAnswer ?? false);
      setCurrentAccuracy(record?.accuracy ?? 0);
      setCurrentPassed(record?.passed ?? false);
      setStartedAt(Date.now());
      stopAudio();
    },
    [sentenceRecords, stopAudio]
  );

  const getEvaluation = useCallback(
    (answers: Record<number, string>) => {
      if (!currentItem) return emptyEvaluation;

      if (difficulty === "medium") {
        return buildMediumEvaluation(currentItem, answers, blankIndices);
      }

      if (difficulty === "easy") {
        return buildEasyEvaluation(currentItem, answers);
      }

      return buildHardEvaluation(currentItem, answers);
    },
    [blankIndices, currentItem, difficulty]
  );

  const currentEvaluation = useMemo(
    () => getEvaluation(currentAnswers),
    [currentAnswers, getEvaluation]
  );

  const allFilled =
    difficulty === "medium"
      ? blankIndices.every((index) => (currentAnswers[index] || "").trim())
      : (currentAnswers[0] || "").trim().length > 0;

  const buildProgressPatch = useCallback(
    (overrides?: {
      currentIndex?: number;
      sentenceRecords?: Record<number, SentenceRecord>;
      currentAnswers?: Record<number, string>;
      currentShowAnswer?: boolean;
      currentAccuracy?: number;
      currentPassed?: boolean;
    }) => {
      const nextCurrentIndex = overrides?.currentIndex ?? currentIndex;
      const recordIndex = currentIndex;
      const nextRecords = {
        ...(overrides?.sentenceRecords ?? sentenceRecords),
      };
      const answers = overrides?.currentAnswers ?? currentAnswers;

      nextRecords[recordIndex] = {
        answers: { ...answers },
        showAnswer: overrides?.currentShowAnswer ?? currentShowAnswer,
        accuracy: overrides?.currentAccuracy ?? currentAccuracy,
        mistakes:
          nextRecords[recordIndex]?.mistakes ?? getEvaluation(answers).mistakes,
        passed: overrides?.currentPassed ?? currentPassed,
      };

      const completedIndices = Object.entries(nextRecords)
        .filter(([, record]) => record.passed)
        .map(([index]) => Number(index));

      return {
        difficulty,
        current_index: nextCurrentIndex,
        completed_indices: completedIndices,
        sentence_records: nextRecords,
        attempt_logs: attemptLogsRef.current,
      };
    },
    [
      currentAccuracy,
      currentAnswers,
      currentIndex,
      currentPassed,
      currentShowAnswer,
      difficulty,
      getEvaluation,
      sentenceRecords,
    ]
  );

  const ensureProgressStarted = useCallback(async () => {
    if (progressIdRef.current) return progressIdRef.current;

    const progress = await dictationProgressService.start(dictation._id, difficulty);
    progressIdRef.current = progress._id;
    setProgressId(progress._id);
    return progress._id;
  }, [dictation._id, difficulty]);

  const saveProgressDraft = useCallback(
    async (
      overrides?: Parameters<typeof buildProgressPatch>[0],
      options?: { createIfMissing?: boolean }
    ) => {
      try {
        if (hasSubmittedRef.current || isRestoringRef.current) return;
        if (!progressIdRef.current && options?.createIfMissing === false) return;

        const id = await ensureProgressStarted();
        await dictationProgressService.update(id, buildProgressPatch(overrides));
      } catch (error) {
        console.error("Failed to save dictation progress:", error);
      }
    },
    [buildProgressPatch, ensureProgressStarted]
  );

  const scheduleProgressSave = useCallback(() => {
    if (!hasUserInteractedRef.current || hasSubmittedRef.current || isRestoringRef.current) {
      return;
    }

    if (saveProgressTimerRef.current !== null) {
      window.clearTimeout(saveProgressTimerRef.current);
    }

    saveProgressTimerRef.current = window.setTimeout(() => {
      saveProgressTimerRef.current = null;
      saveProgressDraft();
    }, 700);
  }, [saveProgressDraft]);

  useEffect(() => {
    scheduleProgressSave();

    return () => {
      if (saveProgressTimerRef.current !== null) {
        window.clearTimeout(saveProgressTimerRef.current);
        saveProgressTimerRef.current = null;
      }
    };
  }, [currentAnswers, scheduleProgressSave]);

  const restoreProgress = useCallback(
    (progress: DictationProgress) => {
      isRestoringRef.current = true;
      const records = progress.sentence_records ?? {};
      const safeIndex = Math.min(
        Math.max(progress.current_index ?? 0, 0),
        Math.max(totalItems - 1, 0)
      );
      const record = records[safeIndex];

      progressIdRef.current = progress._id;
      setProgressId(progress._id);
      setSentenceRecords(records);
      attemptLogsRef.current = progress.attempt_logs ?? [];
      setCurrentIndex(safeIndex);
      setCurrentAnswers(record?.answers ?? {});
      setCurrentShowAnswer(record?.showAnswer ?? false);
      setCurrentAccuracy(record?.accuracy ?? 0);
      setCurrentPassed(record?.passed ?? false);
      setStartedAt(Date.now());
      setProgress(0);
      setOpenComplete(false);
      hasUserInteractedRef.current = true;
      window.setTimeout(() => {
        isRestoringRef.current = false;
      }, 0);
    },
    [totalItems]
  );

  useEffect(() => {
    if (loadingSentences || !pendingRestoreRef.current) return;
    const progress = pendingRestoreRef.current;

    if (progress.difficulty !== difficulty) return;

    pendingRestoreRef.current = null;
    restoreProgress(progress);
  }, [difficulty, loadingSentences, restoreProgress]);

  const renderTokens = useCallback(
    (tokens: string[], matches: boolean[], normalize = false) => {
      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {tokens.map((token, index) => {
            const isMatched = matches[index] === true;
            return (
              <Box
                component="span"
                key={`${token}-${index}`}
                sx={{
                  px: 0.5,
                  borderRadius: 0.75,
                  backgroundColor: isMatched ? "#dcfce7" : "#fee2e2",
                  color: isMatched ? "#166534" : "#991b1b",
                  fontWeight: 700,
                }}
              >
                {normalize ? normalizeToken(token) : token}
              </Box>
            );
          })}
        </Box>
      );
    },
    []
  );

  const renderMediumUserText = () => {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {currentItem?.words.map((word) => {
          const isBlank = word.isBlank;
          const userWord = currentAnswers[word.index] || "";
          const isCorrect = currentEvaluation.correctMatches[word.index] ?? false;
          const displayWord = isBlank ? userWord || "____" : word.word;

          return (
            <Box
              component="span"
              key={word.index}
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
    );
  };

  const renderMediumTranscript = () => {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {currentItem?.words.map((word) => {
          const isBlank = word.isBlank;
          const isCorrect = currentEvaluation.correctMatches[word.index] ?? false;

          return (
            <Box
              component="span"
              key={`${word.word}-${word.index}`}
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
              {word.word}
            </Box>
          );
        })}
      </Box>
    );
  };

  const handlePlay = useCallback(() => {
    if (!dictation.audio_url || !currentSegment) return;

    const audioSrc = dictation.audio_url;
    let audio = audioRef.current;

    if (!audio || audio.getAttribute("src") !== audioSrc) {
      audio?.pause();
      audio = new Audio(audioSrc);
      audioRef.current = audio;
    }

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

      const nextProgress = ((current - start) / duration) * 100;
      setProgress(nextProgress);
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
  }, [currentSegment, dictation.audio_url, dictation.duration, playbackRate]);

  const seekAudio = useCallback(
    (value: number) => {
      if (!audioRef.current || !currentSegment) return;

      const { start, duration } = getSegmentBounds(
        currentSegment,
        dictation.duration,
        audioRef.current.duration
      );

      if (duration <= 0) return;

      const newTime = start + (value / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(value);
    },
    [currentSegment, dictation.duration]
  );

  const rewindAudio = useCallback(
    (seconds: number) => {
      if (!audioRef.current || !currentSegment) return;

      const { start, duration } = getSegmentBounds(
        currentSegment,
        dictation.duration,
        audioRef.current.duration
      );

      if (duration <= 0) return;

      const end = start + duration;
      const nextTime = Math.max(start, audioRef.current.currentTime - seconds);
      audioRef.current.currentTime = nextTime;
      setProgress(((Math.min(nextTime, end) - start) / duration) * 100);
    },
    [currentSegment, dictation.duration]
  );

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioRef.current) {
        audioRef.current.src = "";
      }
    };
  }, [stopAudio]);

  useEffect(() => {
    if (!dictation.audio_url || !currentSegment) return;
    if (isRunGuide) return;
    handlePlay();
  }, [currentSegment, dictation.audio_url, handlePlay, isRunGuide]);

  const commitCurrentRecord = useCallback(
    (record: SentenceRecord) => {
      setSentenceRecords((prev) => ({
        ...prev,
        [currentIndex]: record,
      }));
    },
    [currentIndex]
  );

  const handleWordChange = (index: number, value: string) => {
    hasUserInteractedRef.current = true;
    setCurrentAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleCheck = () => {
    if (!currentItem) return;
    hasUserInteractedRef.current = true;

    const accuracy = currentEvaluation.accuracy;
    const passed = isPassedAccuracy(difficulty, accuracy);
    const mistakes = currentEvaluation.mistakes;
    const finishedAt = Date.now();
    const duration = Math.round((finishedAt - startedAt) / 1000);

    const newLog: DictationAttemptLog = {
      index: currentIndex,
      accuracy,
      answers: { ...currentAnswers },
      difficulty,
      mistakes,
      duration,
      started_at: new Date(startedAt).toISOString(),
      finished_at: new Date(finishedAt).toISOString(),
    };

    const nextAttemptLogs = [...attemptLogsRef.current, newLog];
    attemptLogsRef.current = nextAttemptLogs;
    setCurrentShowAnswer(true);
    setCurrentAccuracy(accuracy);
    setCurrentPassed(passed);
    const nextRecord = {
      answers: { ...currentAnswers },
      showAnswer: true,
      accuracy,
      mistakes,
      passed,
    };
    commitCurrentRecord(nextRecord);
    saveProgressDraft({
      currentAnswers,
      currentShowAnswer: true,
      currentAccuracy: accuracy,
      currentPassed: passed,
    });

    if (passed && autoNext && currentIndex < totalItems - 1) {
      if (autoNextTimerRef.current !== null) {
        window.clearTimeout(autoNextTimerRef.current);
      }

      autoNextTimerRef.current = window.setTimeout(() => {
        autoNextTimerRef.current = null;
        loadSentenceState(currentIndex + 1);
      }, 1200);
    }
  };

  const handleRetry = () => {
    hasUserInteractedRef.current = true;
    setCurrentAnswers({});
    setCurrentShowAnswer(false);
    setCurrentAccuracy(0);
    setCurrentPassed(false);
    setProgress(0);
    setStartedAt(Date.now());
    setSentenceRecords((prev) => {
      const next = { ...prev };
      delete next[currentIndex];
      saveProgressDraft({
        sentenceRecords: next,
        currentAnswers: {},
        currentShowAnswer: false,
        currentAccuracy: 0,
        currentPassed: false,
      });
      return next;
    });
    stopAudio();
    window.setTimeout(() => {
      handlePlay();
    }, 0);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      hasUserInteractedRef.current = true;
      saveProgressDraft({ currentIndex: currentIndex - 1 });
      loadSentenceState(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (!currentPassed) return;

    if (currentIndex >= totalItems - 1) {
      if (canComplete) {
        handleSubmit();
      }
      return;
    }

    hasUserInteractedRef.current = true;
    saveProgressDraft({ currentIndex: currentIndex + 1 });
    loadSentenceState(currentIndex + 1);
  };

  const handleJumpTo = (index: number) => {
    if (index === currentIndex) return;
    hasUserInteractedRef.current = true;
    saveProgressDraft({ currentIndex: index });
    loadSentenceState(index);
  };

  const handleSubmit = async () => {
    if (hasSubmittedRef.current) {
      setOpenComplete(true);
      return;
    }

    try {
      const logsForSummary = attemptLogsRef.current;
      const total = logsForSummary.length;
      const accuracy = total
        ? Math.round(
            logsForSummary.reduce((sum, log) => sum + (log.accuracy || 0), 0) /
              total
          )
        : 0;
      const avgTime = total
        ? Math.round(
            logsForSummary.reduce((sum, log) => sum + (log.duration || 0), 0) /
              total
          )
        : 0;
      const totalTime = logsForSummary.reduce(
        (sum, log) => sum + (log.duration || 0),
        0
      );
      const insights = buildDictationRuleInsights(
        logsForSummary,
        dictation.level,
        dictation.timings || [],
        avgTime
      );

      const nextSummary = {
        accuracy,
        total,
        avgTime,
        totalTime,
        completedItems: totalItems,
        difficulty,
        insights,
        logs: logsForSummary,
      };

      try {
        const id = await ensureProgressStarted();
        await toast.promise(
          dictationProgressService.complete(id, {
            ...buildProgressPatch(),
            summary: nextSummary,
            attempts: logsForSummary,
          }),
          {
            loading: "Dang luu ket qua luyen tap...",
            success: "Luu ket qua luyen tap thanh cong!",
          }
        );
      } catch (progressError) {
        console.error(
          "Dictation progress complete failed. Falling back to legacy attempt API.",
          progressError
        );
        await toast.promise(
          dictationAttemptService.createDictationAttempts(
            logsForSummary,
            dictation._id
          ),
          {
            loading: "Dang luu ket qua bang luong du phong...",
            success: "Luu ket qua luyen tap thanh cong!",
          }
        );
      }

      setSummary(nextSummary);
      hasSubmittedRef.current = true;
      setOpenComplete(true);
    } catch {
      toast.error("Co loi xay ra khi luu ket qua luyen tap.");
    }
  };

  const handleResumeProgress = () => {
    if (!activeProgress) return;
    setShowResumeDialog(false);
    pendingRestoreRef.current = activeProgress;

    if (activeProgress.difficulty !== difficulty) {
      setDifficulty(activeProgress.difficulty);
      return;
    }

    if (loadingSentences) return;

    restoreProgress(activeProgress);
    pendingRestoreRef.current = null;
  };

  const handleRestartProgress = async () => {
    const progressToCancel = activeProgress;
    setShowResumeDialog(false);
    setActiveProgress(null);
    pendingRestoreRef.current = null;
    progressIdRef.current = null;
    setProgressId(null);
    hasUserInteractedRef.current = false;

    if (progressToCancel?._id) {
      try {
        await dictationProgressService.cancel(progressToCancel._id);
      } catch (error) {
        console.error("Failed to cancel dictation progress:", error);
      }
    }

    setSentenceRecords({});
    setCurrentIndex(0);
    setCurrentAnswers({});
    setCurrentShowAnswer(false);
    setCurrentAccuracy(0);
    setCurrentPassed(false);
    attemptLogsRef.current = [];
    setStartedAt(Date.now());
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

  if (loadingSentences) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h6" color="text.secondary">
          Đang chuẩn bị bài luyện tập...
        </Typography>
      </Box>
    );
  }

  if (aiAnalysis) {
    return (
      <DictationAIAnalysis
        loading={loadingAI}
        analysis={aiAnalysis}
        onConfirm={() => window.location.reload()}
      />
    );
  }

  if (!totalItems) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography variant="h5" color="text.secondary">
          Chưa có bài luyện tập nào
        </Typography>
      </Box>
    );
  }

  const userText =
    difficulty === "medium"
      ? renderMediumUserText()
      : currentEvaluation.userTokens.length
      ? renderTokens(currentEvaluation.userTokens, currentEvaluation.userMatches)
      : "(Chưa nhập nội dung)";

  const transcriptText =
    difficulty === "medium"
      ? renderMediumTranscript()
      : renderTokens(currentEvaluation.correctTokens, currentEvaluation.correctMatches);

  const currentBounds = currentSegment
    ? getSegmentBounds(
        currentSegment,
        dictation.duration,
        audioRef.current?.duration
      )
    : { start: 0, end: 0, duration: 0 };

  return (
    <Box
      sx={{
        px: { xs: 1.25, sm: 2, md: 2.5, lg: 3, xl: 4 },
        pb: { xs: 11, sm: 12, lg: 13 },
        width: {
          xs: "100%",
          sm: "min(100%, 720px)",
          md: "min(100%, 920px)",
          lg: "min(100%, 1120px)",
          xl: "min(100%, 1280px)",
        },
        mx: "auto",
        minHeight: "100%",
        overflowX: "hidden",
      }}
    >
      <Dialog open={showResumeDialog} onClose={handleResumeProgress} maxWidth="xs" fullWidth>
        <DialogTitle>Khôi phục phiên Dictation</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Bạn đang có một phiên dictation chưa hoàn thành. Bạn muốn tiếp tục
            từ tiến trình đã lưu hay bắt đầu lại?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestartProgress} color="inherit">
            Làm lại
          </Button>
          <Button onClick={handleResumeProgress} variant="contained">
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>

      <DictationTourGuide isRun={isRunGuide} />

      <DictationHeader
        title={dictation.title}
        level={dictation.level}
        totalItems={totalItems}
        completed={completed}
        overallProgress={overallProgress}
        onBack={onBackToList ?? (() => navigate("/practice-skill/dictation"))}
        currentIndex={currentIndex}
        passedIndices={passedIndices}
        onJumpTo={handleJumpTo}
      />

      {!openComplete ? (
        <>
          <DictationMain
            difficulty={difficulty}
            sentence={currentItem}
            currentIndex={currentIndex}
            totalItems={totalItems}
            currentAnswers={currentAnswers}
            showAnswer={currentShowAnswer}
            isPlaying={isPlaying}
            progress={progress}
            playbackRate={playbackRate}
            autoNext={autoNext}
            allFilled={allFilled}
            isPassed={currentShowAnswer && currentPassed}
            segmentStart={currentBounds.start}
            segmentEnd={currentBounds.end}
            onPlay={handlePlay}
            onSeek={seekAudio}
            onRewind={rewindAudio}
            onOpenSpeedMenu={(event) => setAnchorSpeed(event.currentTarget)}
            onCloseSpeedMenu={() => setAnchorSpeed(null)}
            onSelectPlaybackRate={(rate) => setPlaybackRate(rate)}
            anchorSpeed={anchorSpeed}
            onWordChange={handleWordChange}
            onAutoNextChange={(checked) => setAutoNext(checked)}
            onCheck={handleCheck}
            onRetry={handleRetry}
            onPrev={handlePrev}
            onNext={handleNext}
            canComplete={canComplete}
            onRestartGuide={() => {
              localStorage.setItem("dictation_tour_seen", "false");
              setIsRunGuide(false);
              setTimeout(() => setIsRunGuide(true), 150);
            }}
          />

          <DictationFeedbackPanel
            showAnswer={currentShowAnswer}
            accuracy={currentAccuracy}
            passed={currentPassed}
            userText={userText}
            transcriptText={transcriptText}
          />
        </>
      ) : null}

      <DictationCompletionOverlay
        open={openComplete}
        accuracy={summary.accuracy}
        completedItems={summary.completedItems}
        totalItems={totalItems}
        totalTime={summary.totalTime}
        attemptCount={summary.total}
        level={dictation.level}
        difficulty={summary.difficulty}
        insights={summary.insights}
        loadingAI={loadingAI}
        hasNextLesson={hasNextLesson}
        onAnalyze={handleAnalyzeWithAI}
        onRetry={() => window.location.reload()}
        onViewAnswers={() => setOpenComplete(false)}
        onNextLesson={onNextLesson ?? (() => navigate("/practice-skill/dictation"))}
      />
    </Box>
  );
}
