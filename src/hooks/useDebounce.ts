import { useState, useEffect } from "react";

/**
 * Custom hook để debounce một giá trị.
 * @param value - giá trị cần debounce (ví dụ: input text)
 * @param delay - thời gian chờ (ms), mặc định 500ms
 * @returns giá trị đã được debounce
 */
export function useDebounce<T>(value: T, delay = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup khi value thay đổi hoặc component unmount
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
