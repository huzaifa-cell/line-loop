"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * Returns false during SSR and the first client render, true after hydration.
 * Replaces the `useEffect(() => setMounted(true))` pattern that triggers
 * React 19's set-state-in-effect lint rule.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Subscribe to a localStorage key. Returns [value, setValue].
 * Uses useSyncExternalStore to avoid the set-state-in-effect lint rule
 * while still being SSR-safe (returns `initial` during SSR).
 *
 * Cross-tab updates are synced via the `storage` event.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") return () => {};
      const handler = (e: StorageEvent) => {
        if (e.key === key) callback();
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
    [key]
  );

  const getSnapshot = useCallback((): T => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  }, [key, initial]);

  const getServerSnapshot = useCallback((): T => initial, [initial]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      try {
        const current = getSnapshot();
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(current) : next;
        window.localStorage.setItem(key, JSON.stringify(resolved));
        // Dispatch a storage event manually for same-tab updates
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {
        /* ignore */
      }
    },
    [key, getSnapshot]
  );

  return [value, setValue];
}
