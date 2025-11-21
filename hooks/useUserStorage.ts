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
): [
  T,
  (value: T | ((prevValue: T) => T)) => void,
  boolean,
  () => Promise<void>,
] {
  const context: UserStorageContextType = useContext(UserStorageContext);

  // eslint-disable-next-line react/hook-use-state
  const [, forceUpdate] = useState({});

  const { getValue, setValue, refresh, subscribersRef } = context;

  const { value, isLoading } = getValue<T>(key, defaultValue);

  const updateValue = useCallback(
    (newValue: T | ((prevValue: T) => T)) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setValue<T>(key, newValue);
    },
    [key, setValue],
  );

  const refreshValue = useCallback(async () => refresh(key), [key, refresh]);

  // Subscribe to changes for this key
  useEffect(() => {
    const callback = () => forceUpdate({});

    if (!subscribersRef.current.has(key)) {
      subscribersRef.current.set(key, new Set());
    }

    subscribersRef.current.get(key)?.add(callback);

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      subscribersRef.current.get(key)?.delete(callback);
    };
  }, [key, subscribersRef]);

  return [value, updateValue, isLoading, refreshValue];
}
