import React, { useState } from "react";
import { Box, Tabs, Tab, Divider, Stack, Button, Typography } from "@mui/material";
import { DayTab } from "./DayTab";
import { WeekTab } from "./WeekTab";
import { ProgramTab } from "./ProgramTab";
import { KpiStrip } from "./KpiStrip";
import { sum, durationMin, generateColors, computePercent, computeDailyEfficiency } from "../../utils/learningProgress";
import { Session, Topic, Badge, DayTask } from "../../types/LearningProgress";

export const TOTAL_WEEKS = 8;
export const DAYS_PER_WEEK = 7;

export const mockSessions: Session[] = [
  { start: "06:30", end: "07:00", activity: "Flashcards", focus: 8, understanding: 4, correct: 24, total: 30 },
  { start: "19:10", end: "19:50", activity: "Reading RC", focus: 7, understanding: 5, correct: 18, total: 22 },
  { start: "21:15", end: "21:35", activity: "Listening", focus: 6, understanding: 4, correct: 12, total: 15 },
];

export const weeklyPlannedPerDay = [90, 90, 90, 90, 90, 60, 60];
export const weeklyActualPerDay = [80, 110, 0, 95, 60, 45, 0];

export const cumulativePlanned = [3, 6.5, 10, 13.5, 17, 20, 24, 28];
export const cumulativeActual = [2.5, 6, 9, 12.2, 15.8, 18.3, 22.7, 26.5];

export const topics: Topic[] = [
  { key: "rc", label: "Reading", hours: 14, score: 62 },
  { key: "lc", label: "Listening", hours: 12, score: 71 },
  { key: "spk", label: "Speaking", hours: 8, score: 55 },
  { key: "wrt", label: "Writing", hours: 6, score: 48 },
];

export const badges: Badge[] = [
  { icon: "🏁", label: "Tuần hoàn hảo 7/7" },
  { icon: "🔥", label: "Streak 10 ngày" },
  { icon: "⏱️", label: "100 giờ đầu tiên" },
];

export const dayTasks: DayTask[] = [
  { id: 1, text: "Ôn 30 từ vựng mới", impact: "H" },
  { id: 2, text: "Đọc RC set #3", impact: "M" },
  { id: 3, text: "Nghe podcast 15'", impact: "L" },
];

export default function LearningProgress() {
  const [tab, setTab] = useState(0);
  const [week, setWeek] = useState(4);
  const [day, setDay] = useState(3);
  const percentProgram = computePercent(TOTAL_WEEKS, DAYS_PER_WEEK, week, day);

  // Derived mock metrics
  const sessions = mockSessions;
  const dayMinutesActual = sum(sessions.map(durationMin));
  const dayMinutesPlanned = 90;
  const dailyEfficiency = computeDailyEfficiency(sessions);
  const dayColors = generateColors(sessions.length);

  const weekPlanned = sum(weeklyPlannedPerDay);
  const weekActual = sum(weeklyActualPerDay);
  const weeklyColors = generateColors(7);

  // KPI strip data
  const kpi = [
    { title: "Mục tiêu điểm", value: 725, sub: "Target score" },
    { title: "Nhịp độ", value: "7 buổi/tuần", sub: "Rhythm" },
    { title: "Thời lượng TB", value: "90 phút/ngày", sub: "Average focus" },
  ];

  return (
    <Box sx={{ p: 3, width: "100%",  mx: "auto" }}>
      <KpiStrip kpi={kpi} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="📅 Ngày" />
        <Tab label="📆 Tuần" />
        <Tab label="📈 Chương trình" />
      </Tabs>

      {tab === 0 && (
        <DayTab
          sessions={sessions}
          day={day}
          week={week}
          dayMinutesActual={dayMinutesActual}
          dayMinutesPlanned={dayMinutesPlanned}
          dailyEfficiency={dailyEfficiency}
          dayColors={dayColors}
          dayTasks={dayTasks}
        />
      )}

      {tab === 1 && (
        <WeekTab
          weekActual={weekActual}
          weekPlanned={weekPlanned}
          weeklyActualPerDay={weeklyActualPerDay}
          weeklyPlannedPerDay={weeklyPlannedPerDay}
          weeklyColors={weeklyColors}
        />
      )}

      {tab === 2 && (
        <ProgramTab
          week={week}
          percentProgram={percentProgram}
          TOTAL_WEEKS={TOTAL_WEEKS}
          cumulativePlanned={cumulativePlanned}
          cumulativeActual={cumulativeActual}
          topics={topics}
          badges={badges}
        />
      )}

      <Divider sx={{ my: 3 }} />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
        <Typography variant="caption">Đạt 90’ hôm nay để giữ streak. Thiếu 20’? Học thêm mini 10’ × 2 trước ngủ 😴</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained">Bắt đầu học</Button>
          <Button variant="outlined">Ghi nhận phiên</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
