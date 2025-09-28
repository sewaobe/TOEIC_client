// src/viewmodels/useCalendarHeaderViewModel.ts
import { useCallback } from "react";

export const useCalendarHeaderViewModel = (
  month: Date,
  onChangeMonth: (newMonth: Date) => void
) => {
  const handlePrev = useCallback(() => {
    onChangeMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  }, [month, onChangeMonth]);

  const handleNext = useCallback(() => {
    onChangeMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
  }, [month, onChangeMonth]);

  const handleToday = useCallback(() => {
    const today = new Date();
    onChangeMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }, [onChangeMonth]);

  return { handlePrev, handleNext, handleToday };
};
