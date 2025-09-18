import { CurrentLesson, LessonItem } from "../types/Lesson";

const LS_CURRENT = "current_lesson";
const LS_WEEK_LESSONS = "week_lessons";

export function readCurrentLesson(): CurrentLesson | null {
  try {
    const raw = localStorage.getItem(LS_CURRENT);
    return raw ? (JSON.parse(raw) as CurrentLesson) : null;
  } catch {
    return null;
  }
}

export function saveCurrentLesson(lesson: CurrentLesson) {
  localStorage.setItem(LS_CURRENT, JSON.stringify(lesson));
}

export function ensureWeekLessons(): LessonItem[] {
  try {
    const raw = localStorage.getItem(LS_WEEK_LESSONS);
    if (raw) return JSON.parse(raw) as LessonItem[];
  } catch {}

  const seed: LessonItem[] = [
    {
      id: "W1-L1",
      week: 1,
      title: "Core Lesson 1",
      type: "core",
      status: "done",
      progress: 100,
    },
    {
      id: "W1-L1-Q1",
      week: 1,
      title: "Quick Quiz Lesson 1 - 1",
      type: "quiz",
      status: "done",
    },
    {
      id: "W1-L2",
      week: 1,
      title: "Core Lesson 2",
      type: "core",
      status: "done",
    },
    {
      id: "W1-T1",
      week: 1,
      title: "Mini Test 1",
      type: "mini",
      status: "todo",
    },
  ];

  localStorage.setItem(LS_WEEK_LESSONS, JSON.stringify(seed));
  return seed;
}

export function saveWeekLessons(lessons: LessonItem[]) {
  localStorage.setItem(LS_WEEK_LESSONS, JSON.stringify(lessons));
}
