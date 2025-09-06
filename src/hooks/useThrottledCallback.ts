import { useRef, useCallback } from "react";

/**
 * Tạo callback throttled
 * @param callback Hàm cần throttle
 * @param delay Thời gian delay (ms)
 */
export const useThrottledCallback = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number = 300
) => {
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  const throttledFn = useCallback(
    (...args: T) => {
      if (throttleRef.current) clearTimeout(throttleRef.current);
      throttleRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return throttledFn;
};
