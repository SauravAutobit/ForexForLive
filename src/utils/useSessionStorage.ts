
import { useState, useEffect } from "react";

export default function useSessionStorage<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    const storedValue = sessionStorage.getItem(key);
    try {
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error("Failed to parse stored value:", error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to session storage:", error);
    }
  }, [key, state]);

  return [state, setState] as const;
}