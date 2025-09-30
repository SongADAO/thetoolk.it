"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AuthContext } from "@/contexts/AuthContext";
import {
  UserStorageContext,
  type UserStorageContextType,
} from "@/contexts/UserStorageContext";
import { createClient } from "@/lib/supabase/client";

interface StorageValue<T = any> {
  value: T;
  isLoading: boolean;
}

export function UserStorageProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = React.use(AuthContext);
  const supabase = createClient();

  // Store all values in a Map
  const [storage, setStorage] = useState<Map<string, any>>(new Map());
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [initializedKeys, setInitializedKeys] = useState<Set<string>>(
    new Set(),
  );
  const previousUserIdRef = useRef<string | null>(null);
  const subscribersRef = useRef<Map<string, Set<() => void>>>(new Map());

  // Parse key to get service info
  const parseKey = (key: string) => {
    const keyParts = key.split("-");
    return {
      serviceField: `service_${keyParts[2]}`,
      serviceId: keyParts[1],
    };
  };

  // Load from Supabase
  const loadFromSupabase = useCallback(
    async <T,>(key: string): Promise<T | null> => {
      if (!user?.id) return null;

      const { serviceId, serviceField } = parseKey(key);

      try {
        const table =
          serviceField === "service_authorization"
            ? "service_authorizations"
            : "services";

        const { data, error } = await supabase
          .from(table)
          .select(serviceField)
          .eq("user_id", user.id)
          .eq("service_id", serviceId)
          .single();

        if (error) {
          if (error.code === "PGRST116") return null;
          console.error("Error loading from Supabase:", error);
          return null;
        }

        return data[serviceField] as T;
      } catch (err) {
        console.error("Error loading from Supabase:", err);
        return null;
      }
    },
    [user?.id, supabase],
  );

  // Save to Supabase
  const saveToSupabase = useCallback(
    async <T,>(key: string, value: T): Promise<boolean> => {
      if (!user?.id) return false;

      const { serviceId, serviceField } = parseKey(key);

      try {
        const table =
          serviceField === "service_authorization"
            ? "service_authorizations"
            : "services";

        const { error } = await supabase.from(table).upsert(
          {
            [serviceField]: value,
            service_id: serviceId,
            user_id: user.id,
          },
          { onConflict: "user_id,service_id" },
        );

        if (error) {
          console.error("Error saving to Supabase:", error);
          return false;
        }

        return true;
      } catch (err) {
        console.error("Error saving to Supabase:", err);
        return false;
      }
    },
    [user?.id, supabase],
  );

  // Notify all subscribers of a key
  const notifySubscribers = (key: string) => {
    const subscribers = subscribersRef.current.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => callback());
    }
  };

  // Initialize a key
  const initializeKey = useCallback(
    async <T,>(key: string, defaultValue: T) => {
      if (initializedKeys.has(key)) return;

      setLoadingKeys((prev) => new Set(prev).add(key));

      if (isAuthenticated && user) {
        const supabaseValue = await loadFromSupabase<T>(key);
        setStorage((prev) =>
          new Map(prev).set(key, supabaseValue ?? defaultValue),
        );
        previousUserIdRef.current = user.id;
      } else {
        const localValue = localStorage.getItem(key);
        const parsedValue = localValue ? JSON.parse(localValue) : defaultValue;
        setStorage((prev) => new Map(prev).set(key, parsedValue));
        previousUserIdRef.current = null;
      }

      setLoadingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });

      setInitializedKeys((prev) => new Set(prev).add(key));
      notifySubscribers(key);
    },
    [isAuthenticated, user, loadFromSupabase, initializedKeys],
  );

  // Handle user changes
  useEffect(() => {
    if (authLoading) return;

    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    if (currentUserId !== previousUserId) {
      const handleUserChange = async () => {
        for (const key of initializedKeys) {
          if (isAuthenticated && user) {
            const supabaseValue = await loadFromSupabase(key);
            if (supabaseValue !== null) {
              setStorage((prev) => new Map(prev).set(key, supabaseValue));
              notifySubscribers(key);
            }
          } else {
            const localValue = localStorage.getItem(key);
            if (localValue) {
              setStorage((prev) =>
                new Map(prev).set(key, JSON.parse(localValue)),
              );
              notifySubscribers(key);
            }
          }
        }
        previousUserIdRef.current = currentUserId;
      };

      handleUserChange();
    }
  }, [isAuthenticated, user, authLoading, initializedKeys, loadFromSupabase]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user) {
        setTimeout(async () => {
          for (const key of initializedKeys) {
            const supabaseValue = await loadFromSupabase(key);
            if (supabaseValue !== null) {
              setStorage((prev) => new Map(prev).set(key, supabaseValue));
              notifySubscribers(key);
            }
          }
        }, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuthenticated, user, initializedKeys, loadFromSupabase]);

  const getValue = useCallback(
    <T,>(key: string, defaultValue: T): StorageValue<T> => {
      if (!initializedKeys.has(key)) {
        initializeKey(key, defaultValue);
      }

      return {
        isLoading: loadingKeys.has(key),
        value: storage.get(key) ?? defaultValue,
      };
    },
    [storage, loadingKeys, initializedKeys, initializeKey],
  );

  const setValue = useCallback(
    async <T,>(key: string, valueOrUpdater: T | ((prev: T) => T)) => {
      const currentValue = storage.get(key);
      const newValue =
        typeof valueOrUpdater === "function"
          ? (valueOrUpdater as (prev: T) => T)(currentValue)
          : valueOrUpdater;

      setStorage((prev) => new Map(prev).set(key, newValue));
      notifySubscribers(key);

      if (isAuthenticated && user) {
        await saveToSupabase(key, newValue);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    },
    [storage, isAuthenticated, user, saveToSupabase],
  );

  const refresh = useCallback(
    async (key: string) => {
      if (!isAuthenticated || !user) return;

      const supabaseValue = await loadFromSupabase(key);
      if (supabaseValue !== null) {
        setStorage((prev) => new Map(prev).set(key, supabaseValue));
        notifySubscribers(key);
      }
    },
    [isAuthenticated, user, loadFromSupabase],
  );

  const providerValues: UserStorageContextType = useMemo(
    () => ({
      getValue,
      refresh,
      setValue,
      subscribersRef,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <UserStorageContext.Provider value={providerValues}>
      {children}
    </UserStorageContext.Provider>
  );
}
