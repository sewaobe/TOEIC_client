import { Session } from "../types/LearningProgress";

export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const hmToMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const durationMin = (s: Session) => Math.max(1, hmToMinutes(s.end) - hmToMinutes(s.start));

export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

export const generateColors = (count: number) =>
  Array.from({ length: count }, (_, i) => `hsl(${(i * 360) / Math.max(count, 1)}, 70%, 50%)`);

export function computePercent(totalWeeks: number, daysPerWeek: number, week: number, day: number) {
  const TW = Math.max(1, Math.floor(totalWeeks));
  const DPW = Math.max(1, Math.floor(daysPerWeek));
  const w = clamp(Math.floor(week), 1, TW);
  const d = clamp(Math.floor(day), 1, DPW);
  const totalDays = TW * DPW;
  const completedDays = (w - 1) * DPW + (d - 1);
  return Math.round((completedDays / totalDays) * 100);
}

export function computeDailyEfficiency(sessions: Session[]) {
  if (!sessions.length) return 0;
  const focusAvg = sessions.reduce((a, s) => a + s.focus, 0) / sessions.length;
  const understandingAvg = sessions.reduce((a, s) => a + s.understanding, 0) / sessions.length;
  const taskRate = 0.8; // giả định 80% task done
  return Math.round(50 * (focusAvg / 10) + 30 * (understandingAvg / 5) + 20 * taskRate);
}
