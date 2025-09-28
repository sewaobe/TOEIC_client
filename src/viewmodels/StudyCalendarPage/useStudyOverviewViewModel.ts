// src/viewmodels/useStudyOverviewViewModel.ts
import { useMemo } from "react";

export const useStudyOverviewViewModel = (
  completedUnits: number,
  totalUnits: number
) => {
  const progressPercent = useMemo(() => {
    if (totalUnits === 0) return 0;
    return (completedUnits / totalUnits) * 100;
  }, [completedUnits, totalUnits]);

  return { progressPercent };
};
