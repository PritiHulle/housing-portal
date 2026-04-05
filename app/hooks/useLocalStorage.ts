import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.error(`Error loading localStorage key "${key}":`, error);
        }
    }, [key]);

    // Save to localStorage whenever storedValue changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            // Only save if it's not the initial empty state (optional optimization)
            if (Array.isArray(storedValue) && storedValue.length === 0) {
                // If we want to allow clearing, we should still save the empty array
                // But for first load, item might be null.
            }
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error saving localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}
