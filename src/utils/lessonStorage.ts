import { LessonItem } from "../types/Lesson";

const LS_CURRENT = "current_lesson";
const LS_WEEK_LESSONS = "week_lessons";

export function readCurrentLesson(): LessonItem | null {
  try {
    const raw = localStorage.getItem(LS_CURRENT);
    return raw ? (JSON.parse(raw) as LessonItem) : null;
  } catch {
    return null;
  }
}

export function saveCurrentLesson(lesson: LessonItem) {
  localStorage.setItem(LS_CURRENT, JSON.stringify(lesson));
}



export function saveWeekLessons(lessons: LessonItem[]) {
  localStorage.setItem(LS_WEEK_LESSONS, JSON.stringify(lessons));
}
