// src/viewmodels/useStudyCardViewModel.ts

export type StudyStatus = "DONE" | "IN_PROGRESS" | "LOCK";

export const useStudyCardViewModel = (status: StudyStatus) => {
  const colors = {
    DONE: {
      bg: "#ECFDF5",
      headerBg: "#10B981",
      text: "#065F46",
      dot: "#10B981",
      note: "#10B981",
    },
    IN_PROGRESS: {
      bg: "#FEF9C3",
      headerBg: "#F59E0B",
      text: "#92400E",
      dot: "#16A34A",
      note: "#F59E0B",
    },
    LOCK: {
      bg: "#F3F4F6",
      headerBg: "#9CA3AF",
      text: "#374151",
      dot: "#9CA3AF",
      note: "#9CA3AF",
    },
  };

  return { color: colors[status] };
};
