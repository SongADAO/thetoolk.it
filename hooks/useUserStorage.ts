import { useCallback, useContext, useEffect, useState } from "react";

import {
  UserStorageContext,
  type UserStorageContextType,
} from "@/contexts/UserStorageContext";

/**
 * Custom hook that uses Supabase database when user is authenticated,
 * falls back to localStorage when not authenticated.
 *
 * Must be used within a UserStorageProvider.
 *
 * @param key - Storage key (format: "prefix-serviceId-field")
 * @param defaultValue - Default value if no stored value exists
 * @returns Tuple of [value, setValue, isLoading, refresh]
 */
export function useUserStorage<T>(
  key: string,
  defaultValue: T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: { initializeWithValue?: boolean },
): [
  T,
  (value: T | ((prevValue: T) => T)) => void,
  boolean,
  () => Promise<void>,
] {
  const context: UserStorageContextType = useContext(UserStorageContext);
  const [, forceUpdate] = useState({});

  if (!context) {
    throw new Error("useUserStorage must be used within UserStorageProvider");
  }

  const { getValue, setValue, refresh, requestInit, subscribersRef } = context;

  // Request initialization in an effect, not during render
  useEffect(() => {
    requestInit(key, defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Only re-init if key changes, not defaultValue

  // Subscribe to changes for this key
  useEffect(() => {
    const callback = () => forceUpdate({});

    if (!subscribersRef.current.has(key)) {
      subscribersRef.current.set(key, new Set());
    }
    subscribersRef.current.get(key)!.add(callback);

    return () => {
      subscribersRef.current.get(key)?.delete(callback);
    };
  }, [key, subscribersRef]);

  const { value, isLoading } = getValue<T>(key, defaultValue);

  const updateValue = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      // Fire and forget - explicitly mark promise as ignored
      void setValue<T>(key, newValue);
    },
    [key, setValue],
  );

  const refreshValue = useCallback(async () => refresh(key), [key, refresh]);

  return [value, updateValue, isLoading, refreshValue];
}
