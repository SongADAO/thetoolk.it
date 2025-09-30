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
  const pendingKeysRef = useRef<Map<string, any>>(new Map());
  const previousUserIdRef = useRef<string | null>(null);
  const subscribersRef = useRef<Map<string, Set<() => void>>>(new Map());
  const [initTrigger, setInitTrigger] = useState(0);
  const hasLoadedBatch = useRef(false);

  // Parse key to get service info
  const parseKey = (key: string) => {
    const keyParts = key.split("-");
    return {
      serviceField: `service_${keyParts[2]}`,
      serviceId: keyParts[1],
    };
  };

  // Load ALL data from Supabase in a single batch
  const loadAllFromSupabase = useCallback(
    async (keys: Map<string, any>): Promise<Map<string, any>> => {
      if (!user?.id || keys.size === 0) return new Map();

      const result = new Map<string, any>();

      try {
        // Get all unique service IDs from keys
        const serviceIds = Array.from(
          new Set(
            Array.from(keys.keys()).map((key) => parseKey(key).serviceId),
          ),
        );

        // Don't query if there are no service IDs
        if (serviceIds.length === 0) return new Map();

        // Fetch all services data in one query
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", user.id)
          .in("service_id", serviceIds);

        if (servicesError) {
          console.error("Error loading services from Supabase:", servicesError);
        }

        // Fetch all service authorizations in one query
        const { data: authData, error: authError } = await supabase
          .from("service_authorizations")
          .select("*")
          .eq("user_id", user.id)
          .in("service_id", serviceIds);

        if (authError) {
          console.error(
            "Error loading authorizations from Supabase:",
            authError,
          );
        }

        // Map the fetched data back to keys
        for (const [key, defaultValue] of keys.entries()) {
          const { serviceId, serviceField } = parseKey(key);

          let value = defaultValue;

          if (serviceField === "service_authorization") {
            const authRecord = authData?.find(
              (record) => record.service_id === serviceId,
            );
            if (authRecord && authRecord[serviceField] !== undefined) {
              value = authRecord[serviceField];
            }
          } else {
            const serviceRecord = servicesData?.find(
              (record) => record.service_id === serviceId,
            );
            if (serviceRecord && serviceRecord[serviceField] !== undefined) {
              value = serviceRecord[serviceField];
            }
          }

          result.set(key, value);
        }

        return result;
      } catch (err) {
        console.error("Error loading from Supabase:", err);
        return new Map();
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
  const notifySubscribers = useCallback((key: string) => {
    const subscribers = subscribersRef.current.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => callback());
    }
  }, []);

  // Handle pending key initialization - batch fetch all at once with debounce
  useEffect(() => {
    if (authLoading || hasLoadedBatch.current) return;

    // Debounce to allow all initial keys to accumulate
    const timeoutId = setTimeout(async () => {
      if (pendingKeysRef.current.size === 0) return;

      const initializePendingKeys = async () => {
        const keysToInit = new Map(pendingKeysRef.current);
        pendingKeysRef.current.clear();
        hasLoadedBatch.current = true;

        console.log(`Batch loading ${keysToInit.size} keys from Supabase`);

        // Mark all keys as loading
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          keysToInit.forEach((_, key) => next.add(key));
          return next;
        });

        if (isAuthenticated && user) {
          // Batch fetch all data at once
          const batchData = await loadAllFromSupabase(keysToInit);

          // Update storage with all fetched data
          setStorage((prev) => {
            const next = new Map(prev);
            batchData.forEach((value, key) => {
              next.set(key, value);
            });
            return next;
          });

          previousUserIdRef.current = user.id;
        } else {
          // Load from localStorage for each key
          const localData = new Map<string, any>();
          keysToInit.forEach((defaultValue, key) => {
            const localValue = localStorage.getItem(key);
            localData.set(
              key,
              localValue ? JSON.parse(localValue) : defaultValue,
            );
          });

          setStorage((prev) => {
            const next = new Map(prev);
            localData.forEach((value, key) => {
              next.set(key, value);
            });
            return next;
          });

          previousUserIdRef.current = null;
        }

        // Clear loading state and mark as initialized
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          keysToInit.forEach((_, key) => next.delete(key));
          return next;
        });

        setInitializedKeys((prev) => {
          const next = new Set(prev);
          keysToInit.forEach((_, key) => next.add(key));
          return next;
        });

        // Notify all subscribers
        keysToInit.forEach((_, key) => notifySubscribers(key));
      };

      await initializePendingKeys();
    }, 50); // 50ms debounce to collect all initial keys

    return () => clearTimeout(timeoutId);
  }, [
    authLoading,
    initTrigger,
    isAuthenticated,
    user,
    loadAllFromSupabase,
    notifySubscribers,
  ]);

  // Handle user changes
  useEffect(() => {
    if (authLoading) return;

    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    if (currentUserId !== previousUserId) {
      const handleUserChange = async () => {
        hasLoadedBatch.current = false;

        // Collect all initialized keys with their default values
        const keysToReload = new Map<string, any>();
        initializedKeys.forEach((key) => {
          keysToReload.set(key, storage.get(key));
        });

        if (isAuthenticated && user) {
          const batchData = await loadAllFromSupabase(keysToReload);
          setStorage((prev) => {
            const next = new Map(prev);
            batchData.forEach((value, key) => {
              next.set(key, value);
            });
            return next;
          });

          // Notify subscribers AFTER state update completes
          queueMicrotask(() => {
            batchData.forEach((_, key) => {
              notifySubscribers(key);
            });
          });
        } else {
          initializedKeys.forEach((key) => {
            const localValue = localStorage.getItem(key);
            if (localValue) {
              setStorage((prev) => {
                const next = new Map(prev);
                next.set(key, JSON.parse(localValue));
                return next;
              });
            }
          });

          // Notify subscribers AFTER state update completes
          queueMicrotask(() => {
            initializedKeys.forEach((key) => {
              notifySubscribers(key);
            });
          });
        }

        previousUserIdRef.current = currentUserId;
      };

      handleUserChange();
    }
  }, [
    isAuthenticated,
    user,
    authLoading,
    initializedKeys,
    storage,
    loadAllFromSupabase,
    notifySubscribers,
  ]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        !document.hidden &&
        isAuthenticated &&
        user &&
        initializedKeys.size > 0
      ) {
        setTimeout(async () => {
          const keysToRefresh = new Map<string, any>();
          initializedKeys.forEach((key) => {
            keysToRefresh.set(key, storage.get(key));
          });

          const batchData = await loadAllFromSupabase(keysToRefresh);
          setStorage((prev) => {
            const next = new Map(prev);
            batchData.forEach((value, key) => {
              next.set(key, value);
            });
            return next;
          });

          // Notify subscribers AFTER state update completes
          queueMicrotask(() => {
            batchData.forEach((_, key) => {
              notifySubscribers(key);
            });
          });
        }, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [
    isAuthenticated,
    user,
    initializedKeys,
    storage,
    loadAllFromSupabase,
    notifySubscribers,
  ]);

  const getValue = useCallback(
    <T,>(key: string, defaultValue: T): StorageValue<T> => ({
      isLoading: loadingKeys.has(key) || !initializedKeys.has(key),
      value: storage.get(key) ?? defaultValue,
    }),
    [storage, loadingKeys, initializedKeys],
  );

  const requestInit = useCallback(
    (key: string, defaultValue: any) => {
      const wasEmpty = pendingKeysRef.current.size === 0;
      if (!initializedKeys.has(key) && !pendingKeysRef.current.has(key)) {
        pendingKeysRef.current.set(key, defaultValue);
        // Only trigger once when going from empty to having keys
        if (wasEmpty) {
          setInitTrigger((prev) => prev + 1);
        }
      }
    },
    [initializedKeys],
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
    [storage, isAuthenticated, user, saveToSupabase, notifySubscribers],
  );

  const refresh = useCallback(
    async (key: string) => {
      if (!isAuthenticated || !user) return;

      const keysToRefresh = new Map([[key, storage.get(key)]]);
      const batchData = await loadAllFromSupabase(keysToRefresh);

      const value = batchData.get(key);
      if (value !== undefined) {
        setStorage((prev) => new Map(prev).set(key, value));
        notifySubscribers(key);
      }
    },
    [isAuthenticated, user, storage, loadAllFromSupabase, notifySubscribers],
  );

  const providerValues: UserStorageContextType = useMemo(
    () => ({
      getValue,
      refresh,
      requestInit,
      setValue,
      subscribersRef,
    }),
    [getValue, setValue, refresh, requestInit],
  );

  return (
    <UserStorageContext.Provider value={providerValues}>
      {children}
    </UserStorageContext.Provider>
  );
}
