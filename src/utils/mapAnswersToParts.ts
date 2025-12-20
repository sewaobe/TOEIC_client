// types giữ nguyên
export type RawAnswer = {
  question_id: string;
  question_no: number;
  selectedOption?: string;
  isCorrect: boolean;
  correctAnswer: string;
  tags?: string[];
};

export type PartAnswers = {
  [part: number]: RawAnswer[];
};

type PartNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Suy ra số part từ tags, ví dụ "[Part 5] Câu hỏi ..." -> 5 */
export function getPartFromTags(tags?: string[]): PartNumber | undefined {
  if (!tags?.length) return;
  for (const t of tags) {
    const m = t.match(/\[Part\s+(\d+)\]/i);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 7) return n as PartNumber;
    }
  }
}

/** Fallback: suy ra part từ question_no theo chuẩn TOEIC */
export function getPartFromQuestionNo(q: number): PartNumber | undefined {
  if (q >= 1 && q <= 6) return 1;
  if (q >= 7 && q <= 31) return 2;
  if (q >= 32 && q <= 70) return 3;
  if (q >= 71 && q <= 100) return 4;
  if (q >= 101 && q <= 130) return 5;
  if (q >= 131 && q <= 146) return 6;
  if (q >= 147 && q <= 200) return 7;
}

/** Map theo từng câu, không cắt “theo block”, nên chịu thiếu/thiếu thứ tự */
export function mapAnswersToParts(answers: RawAnswer[]): PartAnswers {
  const result: PartAnswers = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  };

  for (const ans of answers) {
    let part = getPartFromTags(ans.tags);
    if (!part) part = getPartFromQuestionNo(ans.question_no);
    if (!part) continue; // hoặc tạo bucket "unknown" nếu muốn
    result[part].push(ans);
  }

  // Sắp xếp mỗi part theo question_no để hiển thị đẹp
  (Object.keys(result) as unknown as PartNumber[]).forEach((p) => {
    result[p].sort((a, b) => a.question_no - b.question_no);
  });

  return result;
}

/** Nếu cần danh sách part xuất hiện (không trùng): */
export function extractAvailableParts(answers: RawAnswer[]): PartNumber[] {
  const set = new Set<PartNumber>();
  for (const ans of answers) {
    const byTag = getPartFromTags(ans.tags);
    const part = byTag ?? getPartFromQuestionNo(ans.question_no);
    if (part) set.add(part);
  }
  return [...set].sort((a, b) => a - b);
}
