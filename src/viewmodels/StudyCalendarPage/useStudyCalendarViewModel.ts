import { useMemo } from "react";

export interface Study {
  dayOfWeek: number;
  dateLabel: string;
  status: "DONE" | "IN_PROGRESS" | "LOCK";
  progress: string;
  sessions: { name: string }[];
  tag?: string;
  note?: string;
}

export const toYMD = (d: Date) => d.toISOString().split("T")[0];
export const WEEKDAYS = ["CN", "TH 2", "TH 3", "TH 4", "TH 5", "TH 6", "TH 7"];

export const useStudyCalendarViewModel = (month: Date, studies: Study[]) => {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);

  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay()); // CN
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay())); // T7

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const todayStr = toYMD(new Date());

  const statusColors: Record<string, string> = {
    DONE: "#D1FAE5",
    IN_PROGRESS: "#FEF3C7",
    LOCK: "#F3F4F6",
  };

  const getCellBg = (date: Date) => {
    const study = studies.find((s) => s.dateLabel === toYMD(date));
    const inThisMonth = date.getMonth() === m;
    if (study) return statusColors[study.status];
    return inThisMonth ? "#fff" : "#f9fafb";
  };

  return { days, todayStr, getCellBg };
};
