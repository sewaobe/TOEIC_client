import { ExamGroup, ExamQuestion } from "../types/Exam";

type RawAsset = string | { url?: string | null } | null | undefined;

const QUESTION_NUMBER_RE = /Question\s*(\d+)/i;

const getStringId = (value: unknown, fallback: string): string => {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const objectValue = value as { _id?: unknown; $oid?: unknown };
    if (typeof objectValue.$oid === "string") return objectValue.$oid;
    if (typeof objectValue._id === "string") return objectValue._id;
  }
  return fallback;
};

const getAssetUrl = (asset: RawAsset): string | null => {
  if (!asset) return null;
  if (typeof asset === "string") return asset || null;
  return asset.url || null;
};

const normalizeImages = (images: unknown): string[] => {
  if (!Array.isArray(images)) return [];
  return images
    .map((image) => getAssetUrl(image as RawAsset))
    .filter((url): url is string => Boolean(url));
};

const extractQuestionNumber = (
  name: unknown,
  fallbackQuestionNumber: number
): number => {
  if (typeof name === "string") {
    const match = name.match(QUESTION_NUMBER_RE);
    if (match) return Number(match[1]);
  }
  return fallbackQuestionNumber;
};

const normalizeChoices = (choices: unknown): Record<string, string> => {
  if (!choices || typeof choices !== "object" || Array.isArray(choices)) {
    return {};
  }

  return Object.entries(choices as Record<string, unknown>).reduce(
    (acc, [key, value]) => {
      if (typeof value === "string") {
        acc[key] = value;
      } else if (value !== null && value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    },
    {} as Record<string, string>
  );
};

const getPartNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (match) return Number(match[0]);
  }
  return fallback;
};

const unwrapTestPayload = (payload: unknown): any => {
  if (!payload || typeof payload !== "object") return payload;
  const objectPayload = payload as { data?: unknown; test?: unknown };
  return objectPayload.data ?? objectPayload.test ?? payload;
};

const getRawGroups = (test: any): any[] => {
  if (Array.isArray(test?.groups)) return test.groups;

  const questionsByPart = test?.questions;
  if (!questionsByPart || typeof questionsByPart !== "object") return [];

  return Object.entries(questionsByPart).flatMap(([partName, partData]) => {
    const partGroups = (partData as { groups?: unknown })?.groups;
    if (!Array.isArray(partGroups)) return [];
    const part = getPartNumber(partName, 0);
    return partGroups.map((group) => ({ ...(group as object), part }));
  });
};

export const normalizeTestToGroups = (payload: unknown): ExamGroup[] => {
  const test = unwrapTestPayload(payload);
  const rawGroups = getRawGroups(test);
  let fallbackQuestionNumber = 1;

  return rawGroups.map((rawGroup, groupIndex) => {
    const part = getPartNumber(rawGroup?.part, 0);
    const questions = Array.isArray(rawGroup?.questions)
      ? rawGroup.questions
      : [];

    const normalizedQuestions: ExamQuestion[] = questions.map(
      (rawQuestion: any, questionIndex: number) => {
        const questionNumber = extractQuestionNumber(
          rawQuestion?.name,
          fallbackQuestionNumber
        );
        fallbackQuestionNumber = Math.max(
          fallbackQuestionNumber + 1,
          questionNumber + 1
        );

        return {
          _id: getStringId(
            rawQuestion?._id,
            `part-${part}-group-${groupIndex}-question-${questionIndex}`
          ),
          name: String(rawQuestion?.name ?? `Question ${questionNumber}`),
          questionNumber,
          textQuestion: rawQuestion?.textQuestion || "",
          choices: normalizeChoices(rawQuestion?.choices),
          correctAnswer: String(rawQuestion?.correctAnswer ?? ""),
          explanation: rawQuestion?.explanation || "",
          tags: Array.isArray(rawQuestion?.tags) ? rawQuestion.tags : [],
        };
      }
    );

    return {
      _id: getStringId(rawGroup?._id, `part-${part}-group-${groupIndex}`),
      part,
      audioUrl: getAssetUrl(rawGroup?.audioUrl),
      imagesUrl: normalizeImages(rawGroup?.imagesUrl),
      transcriptEnglish: rawGroup?.transcriptEnglish || "",
      transcriptTranslation: rawGroup?.transcriptTranslation || "",
      questions: normalizedQuestions,
    };
  });
};

