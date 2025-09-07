export type RawAnswer = {
    question_id: { $oid: string };
    question_no: number;
    selectedOption?: string;
    isCorrect: boolean;
    tags?: string[];
    _id: { $oid: string };
};

export type PartAnswers = {
    [part: number]: RawAnswer[];
};

const PART_RANGES = [
    { part: 1, count: 6 },
    { part: 2, count: 25 },
    { part: 3, count: 39 },
    { part: 4, count: 30 },
    { part: 5, count: 30 },
    { part: 6, count: 16 },
    { part: 7, count: 54 },
] as const;

export function mapAnswersToParts(answers: RawAnswer[]): PartAnswers {
    const result: PartAnswers = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

    let start = 0;
    for (const r of PART_RANGES) {
        const end = start + r.count;
        result[r.part] = answers.slice(start, end).map((ans, idx) => ({
            ...ans,
            question_no: start + idx + 1,
        }));
        start = end;
    }

    return result;
}
