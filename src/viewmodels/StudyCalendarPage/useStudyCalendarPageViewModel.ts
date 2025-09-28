// src/viewmodels/useStudyCalendarPageViewModel.ts
import { useState } from "react";

export enum WeekStudyStatus {
  LOCK = "LOCK",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

const mockStudies = [
  {
    dayOfWeek: 1,
    dateLabel: "2025-09-30",
    status: WeekStudyStatus.DONE,
    progress: "9/9",
    sessions: [
      { name: "Bài giới thiệu" },
      { name: "Danh từ" },
      { name: "Mind map 1" },
    ],
    tag: "Grammar",
    note: "Đã Hoàn Thành",
  },
  {
    dayOfWeek: 2,
    dateLabel: "2025-10-01",
    status: WeekStudyStatus.DONE,
    progress: "8/9",
    sessions: [
      { name: "Mini test 1" },
      { name: "Động từ" },
      { name: "Mind map 2" },
    ],
    tag: "Grammar",
    note: "Đã Hoàn Thành",
  },
  {
    dayOfWeek: 3,
    dateLabel: "2025-10-02",
    status: WeekStudyStatus.IN_PROGRESS,
    progress: "6/9",
    sessions: [
      { name: "Tranh tả người: Các hoạt động của mắt" },
      { name: "Tranh tả người: Các hoạt động của tay" },
      { name: "Mini test 2" },
    ],
    tag: "Vocabulary +1 skill",
    note: "Bạn chưa hoàn thành buổi học này",
  },
  {
    dayOfWeek: 4,
    dateLabel: "2025-10-03",
    status: WeekStudyStatus.IN_PROGRESS,
    progress: "2/9",
    sessions: [
      { name: "Tranh tả người: Các hoạt động của chân" },
      { name: "Tranh tả người: Các hoạt động khác" },
      { name: "Đại từ" },
    ],
    tag: "Vocabulary +1 skill",
    note: "Bạn chưa hoàn thành buổi học này",
  },
  {
    dayOfWeek: 5,
    dateLabel: "2025-10-04",
    status: WeekStudyStatus.LOCK,
    progress: "0/9",
    sessions: [
      { name: "Mind map 3" },
      { name: "Transportation" },
      { name: "Furniture & Office facilities" },
    ],
    tag: "Grammar +1 skill",
    note: "Bạn chưa hoàn thành buổi học này",
  },
];

export const useStudyCalendarPageViewModel = () => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [month, setMonth] = useState(new Date(2025, 8, 1)); // Tháng 9

  return {
    month,
    setMonth,
    selectedDay,
    setSelectedDay,
    studies: mockStudies,
  };
};
