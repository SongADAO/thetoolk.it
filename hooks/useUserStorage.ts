import { useCallback, useContext, useEffect, useState } from "react";

import { UserStorageContext } from "@/contexts/UserStorageContext";

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
): [
  T,
  (value: T | ((prevValue: T) => T)) => Promise<void>,
  boolean,
  () => Promise<void>,
] {
  const context = useContext(UserStorageContext);
  const [, forceUpdate] = useState({});

  const { getValue, setValue, refresh, subscribersRef } = context;

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
    async (newValue: T | ((prevValue: T) => T)) => setValue<T>(key, newValue),
    [key, setValue],
  );

  const refreshValue = useCallback(async () => refresh(key), [key, refresh]);

  return [value, updateValue, isLoading, refreshValue];
}
