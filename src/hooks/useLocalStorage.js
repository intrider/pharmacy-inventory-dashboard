import { useCallback, useState } from 'react';

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = readStorage(key, null);
    return stored ?? initialValue;
  });

  const persist = useCallback(
    (updater) => {
      setValue((current) => {
        const next = typeof updater === 'function' ? updater(current) : updater;
        try {
          writeStorage(key, next);
        } catch {
          // Ignore quota / private-mode write failures; keep in-memory state.
        }
        return next;
      });
    },
    [key]
  );

  return [value, persist];
}
