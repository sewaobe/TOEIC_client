import { useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item != null) {
        try {
          return JSON.parse(item) as T;
        } catch (parseErr) {
          console.warn(
            `LocalStorage key ${key} contains invalid JSON. Resetting.`
          );
          window.localStorage.removeItem(key);
          window.localStorage.setItem(key, JSON.stringify(initialValue));
          return initialValue;
        }
      }
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export default useLocalStorage;
