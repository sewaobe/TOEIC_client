// src/types.ts

export type Skill = "L" | "R"; // Listening / Reading

export interface ProgramLesson {
  id: string;
  scheduledISO: string;
  title: string;
  skill: Skill;
  minutes: number;
}

export interface ProgressEntry {
  lessonId: string;
  completedISO: string;
}

export interface DailyJournalItem {
  id: string;
  iso: string;
  text: string;
  minutes?: number;
}

export interface DayState {
  iso: string;
  programLessons: ProgramLesson[];
  completedLessons: ProgressEntry[];
  journal: DailyJournalItem[];
}

export const MOCK_PROGRAM_LESSONS: ProgramLesson[] = [
  // Day 1
  { id: "2025-09-28-L-0", scheduledISO: "2025-09-28", title: "LC: Mini test 10 câu", skill: "L", minutes: 15 },
  { id: "2025-09-28-R-0", scheduledISO: "2025-09-28", title: "RC: Vocab 20 từ (ETS)", skill: "R", minutes: 20 },
  { id: "2025-09-28-R-1", scheduledISO: "2025-09-28", title: "RC: Grammar – thì/điều kiện", skill: "R", minutes: 25 },
  // Day 2
  { id: "2025-09-29-L-0", scheduledISO: "2025-09-29", title: "LC: Shadowing 10’", skill: "L", minutes: 10 },
  { id: "2025-09-29-R-0", scheduledISO: "2025-09-29", title: "RC: Reading Part 7 – 1 bài", skill: "R", minutes: 30 },
  // Day 3 (late)
  { id: "2025-09-26-L-0", scheduledISO: "2025-09-26", title: "LC: Dictation 2 đoạn", skill: "L", minutes: 20 },
];

export const MOCK_PROGRESS: ProgressEntry[] = [
  // Lesson from day 1 done ON TIME
  { lessonId: "2025-09-28-L-0", completedISO: "2025-09-28" },
  // Lesson from day 2 done EARLY on day 1
  { lessonId: "2025-09-29-R-0", completedISO: "2025-09-28" },
  // Lesson from day 3 done LATE on day 1
  { lessonId: "2025-09-26-L-0", completedISO: "2025-09-28" },
];

export const MOCK_JOURNAL: DailyJournalItem[] = [
  { id: "j1", iso: "2025-09-28", text: "Xem video TED 15’ – từ vựng chủ đề công sở", minutes: 15 },
  { id: "j2", iso: "2025-09-28", text: "Nghe podcast TOEIC về Part 3", minutes: 20 },
];

// Helper to create a dummy DayState map for CalendarView
export function createMockDayMap(
  lessons: ProgramLesson[],
  progress: ProgressEntry[],
  journal: DailyJournalItem[]
): Record<string, DayState> {
  const map: Record<string, DayState> = {};
  const allISOs = new Set([
    ...lessons.map((l) => l.scheduledISO),
    ...progress.map((p) => p.completedISO),
    ...journal.map((j) => j.iso),
  ]);

  allISOs.forEach((iso) => {
    map[iso] = {
      iso,
      programLessons: lessons.filter((l) => l.scheduledISO === iso),
      completedLessons: progress.filter((p) => p.completedISO === iso),
      journal: journal.filter((j) => j.iso === iso),
    };
  });
  return map;
}