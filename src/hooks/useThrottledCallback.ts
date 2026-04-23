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
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestArgsRef = useRef<T | null>(null);

  const throttledFn = useCallback(
    (...args: T) => {
      latestArgsRef.current = args;

      if (throttleRef.current) return;

      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;

        if (!latestArgsRef.current) {
          return;
        }

        callback(...latestArgsRef.current);
        latestArgsRef.current = null;
      }, delay);
    },
    [callback, delay]
  );

  return throttledFn;
};
