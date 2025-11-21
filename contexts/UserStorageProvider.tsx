"use client";

import {
  type ReactNode,
  use,
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

// Constants
const BATCH_LOAD_DEBOUNCE_MS = 50;
const VISIBILITY_REFRESH_DELAY_MS = 100;

// Types
interface StorageValue<T> {
  value: T;
  isLoading: boolean;
}

interface ParsedKey {
  serviceField: string;
  serviceId: string;
}

type StorageMap = Map<string, unknown>;
type PendingKeysMap = Map<string, unknown>;

// Utility Functions
const parseKey = (key: string): ParsedKey => {
  const keyParts = key.split("-");
  return {
    serviceField: `service_${keyParts[2]}`,
    serviceId: keyParts[1],
  };
};

export function UserStorageProvider({
  children,
  mode,
}: {
  readonly children: ReactNode;
  readonly mode: "server" | "browser";
}) {
  const { user, isAuthenticated, loading: authLoading } = use(AuthContext);

  // State
  const [storage, setStorage] = useState<StorageMap>(new Map());
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [initializedKeys, setInitializedKeys] = useState<Set<string>>(
    new Set(),
  );
  const [initTrigger, setInitTrigger] = useState(0);

  // Refs
  const pendingKeysRef = useRef<PendingKeysMap>(new Map());
  const previousUserIdRef = useRef<string | null>(null);
  const subscribersRef = useRef<Map<string, Set<() => void>>>(new Map());
  const hasLoadedBatch = useRef(false);
  const initializedKeysRef = useRef<Set<string>>(new Set());
  const storageRef = useRef<StorageMap>(new Map());

  // Keep refs in sync with state
  storageRef.current = storage;
  initializedKeysRef.current = initializedKeys;

  // Storage Handlers - abstracted to reduce duplication
  const serverStorageHandler = useMemo(
    () => ({
      async load(keys: PendingKeysMap): Promise<Map<string, unknown>> {
        if (!user?.id || keys.size === 0) return new Map();

        const result = new Map<string, unknown>();

        try {
          const serviceIds = Array.from(
            new Set(
              Array.from(keys.keys()).map((key) => parseKey(key).serviceId),
            ),
          );

          if (serviceIds.length === 0) return new Map();

          const params = new URLSearchParams({
            service_ids: serviceIds.join(","),
          });

          const response = await fetch(
            `/api/user/services/get/?${params.toString()}`,
            {
              headers: { "Content-Type": "application/json" },
              method: "GET",
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Could not load service data: ${errorData.error_description ?? errorData.error}`,
            );
          }

          const servicesData = await response.json();

          for (const [key, defaultValue] of keys.entries()) {
            const { serviceId, serviceField } = parseKey(key);
            let value = defaultValue;

            if (serviceField !== "service_authorization") {
              const serviceRecord = servicesData?.find(
                (record: { service_id: string }) =>
                  record.service_id === serviceId,
              );
              if (serviceRecord?.[serviceField] !== undefined) {
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

      async save(key: string, value: unknown): Promise<boolean> {
        if (!user?.id) return false;

        const { serviceId, serviceField } = parseKey(key);

        if (serviceField === "service_authorization") {
          return false;
        }

        try {
          const response = await fetch(`/api/user/services/update/`, {
            body: JSON.stringify({ serviceField, serviceId, value }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `Could not save service data: ${errorData.error_description ?? errorData.error}`,
            );
          }

          return true;
        } catch (err) {
          console.error("Error saving to Supabase:", err);
          return false;
        }
      },
    }),
    [user?.id],
  );

  const browserStorageHandler = useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      async load(keys: PendingKeysMap): Promise<Map<string, unknown>> {
        const localData = new Map<string, unknown>();
        keys.forEach((defaultValue, key) => {
          const localValue = localStorage.getItem(key);
          localData.set(
            key,
            localValue ? JSON.parse(localValue) : defaultValue,
          );
        });
        return localData;
      },

      // eslint-disable-next-line @typescript-eslint/require-await
      async save(key: string, value: unknown): Promise<boolean> {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      },
    }),
    [],
  );

  const storageHandler =
    mode === "server" ? serverStorageHandler : browserStorageHandler;

  // Helper to update storage and notify subscribers
  const updateStorageAndNotify = useCallback((data: Map<string, unknown>) => {
    setStorage((prev) => {
      const next = new Map(prev);
      data.forEach((value, key) => {
        next.set(key, value);
      });
      return next;
    });

    queueMicrotask(() => {
      data.forEach((_, key) => {
        const subscribers = subscribersRef.current.get(key);
        if (subscribers) {
          subscribers.forEach((callback) => callback());
        }
      });
    });
  }, []);

  // Notify all subscribers of a key
  const notifySubscribers = useCallback((key: string) => {
    const subscribers = subscribersRef.current.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => callback());
    }
  }, []);

  // Batch initialization effect
  useEffect(() => {
    if (authLoading || hasLoadedBatch.current) return undefined;

    const timeoutId = setTimeout(() => {
      if (pendingKeysRef.current.size === 0) return;

      const initializePendingKeys = async () => {
        const keysToInit = new Map(pendingKeysRef.current);
        pendingKeysRef.current.clear();
        hasLoadedBatch.current = true;

        console.log(`Batch loading ${keysToInit.size} keys`);

        // Mark all keys as loading
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          keysToInit.forEach((_, key) => next.add(key));
          return next;
        });

        // Load data based on mode
        let batchData = new Map<string, unknown>();
        if (mode === "server" && isAuthenticated && user) {
          batchData = await storageHandler.load(keysToInit);
          previousUserIdRef.current = user.id;
        } else {
          batchData = await storageHandler.load(keysToInit);
          previousUserIdRef.current = null;
        }

        // Update storage
        setStorage((prev) => {
          const next = new Map(prev);
          batchData.forEach((value, key) => {
            next.set(key, value);
          });
          return next;
        });

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

        // Notify subscribers
        queueMicrotask(() => {
          batchData.forEach((_, key) => {
            notifySubscribers(key);
          });
        });
      };

      initializePendingKeys().catch((err: unknown) => {
        console.error("Error initializing pending keys:", err);
      });
    }, BATCH_LOAD_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    authLoading,
    initTrigger,
    isAuthenticated,
    user,
    storageHandler,
    notifySubscribers,
    mode,
  ]);

  // Handle user changes
  useEffect(() => {
    if (authLoading) return undefined;

    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    if (currentUserId !== previousUserId) {
      const handleUserChange = async () => {
        hasLoadedBatch.current = false;

        // Capture keys to reload BEFORE clearing state
        const keysToReload = new Map<string, unknown>();
        initializedKeysRef.current.forEach((key) => {
          keysToReload.set(key, storageRef.current.get(key));
        });

        if (mode === "server") {
          // If logging out or changing user reset to initial state
          if (previousUserId) {
            setStorage(new Map());
            setLoadingKeys(new Set());
            setInitializedKeys(new Set());
            pendingKeysRef.current.clear();
            previousUserIdRef.current = currentUserId;

            // Notify all subscribers that their values have been reset
            queueMicrotask(() => {
              subscribersRef.current.forEach((subscribers) => {
                subscribers.forEach((callback) => callback());
              });
            });
          }
        }

        if (mode === "browser" || (isAuthenticated && user)) {
          const batchData = await storageHandler.load(keysToReload);
          updateStorageAndNotify(batchData);

          // Restore initialized keys after loading
          setInitializedKeys(new Set(keysToReload.keys()));
        }

        previousUserIdRef.current = currentUserId;
      };

      handleUserChange().catch((err: unknown) => {
        console.error("Error handling user change:", err);
      });
    }

    return undefined;
  }, [
    isAuthenticated,
    user,
    authLoading,
    storageHandler,
    updateStorageAndNotify,
    mode,
  ]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && initializedKeysRef.current.size > 0) {
        setTimeout(() => {
          const refreshData = async () => {
            const keysToRefresh = new Map<string, unknown>();
            initializedKeysRef.current.forEach((key) => {
              keysToRefresh.set(key, storageRef.current.get(key));
            });

            if (mode === "browser" || (isAuthenticated && user)) {
              const batchData = await storageHandler.load(keysToRefresh);
              updateStorageAndNotify(batchData);
            }
          };

          refreshData().catch((err: unknown) => {
            console.error("Error refreshing data on visibility change:", err);
          });
        }, VISIBILITY_REFRESH_DELAY_MS);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [isAuthenticated, user, storageHandler, updateStorageAndNotify, mode]);

  // Context API methods
  const getValue = useCallback(
    <T,>(key: string, defaultValue: T): StorageValue<T> => {
      const storedValue = storage.get(key);
      return {
        isLoading: loadingKeys.has(key) || !initializedKeys.has(key),
        // Type assertion is safe here: caller specifies T and provides matching defaultValue
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        value: (storedValue ?? defaultValue) as T,
      };
    },
    [storage, loadingKeys, initializedKeys],
  );

  const requestInit = useCallback(
    (key: string, defaultValue: unknown) => {
      const wasEmpty = pendingKeysRef.current.size === 0;
      if (!initializedKeys.has(key) && !pendingKeysRef.current.has(key)) {
        pendingKeysRef.current.set(key, defaultValue);
        if (wasEmpty) {
          setInitTrigger((prev) => prev + 1);
        }
      }
    },
    [initializedKeys],
  );

  const setValue = useCallback(
    async <T,>(
      key: string,
      valueOrUpdater: T | ((prev: T) => T),
    ): Promise<void> => {
      // Type assertion is safe here: caller specifies T when calling setValue
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const currentValue = storage.get(key) as T;

      // Determine the new value
      // If valueOrUpdater is a function, treat it as an updater
      // Note: To store a function value, wrap it: setValue(key, () => myFunction)
      const newValue: T =
        typeof valueOrUpdater === "function"
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            (valueOrUpdater as (prev: T) => T)(currentValue)
          : valueOrUpdater;

      // Update in-memory storage
      setStorage((prev) => new Map(prev).set(key, newValue));
      notifySubscribers(key);

      // Persist to backend
      if (mode === "browser" || (isAuthenticated && user)) {
        await storageHandler.save(key, newValue);
      }
    },
    [storage, isAuthenticated, user, storageHandler, notifySubscribers, mode],
  );

  const refresh = useCallback(
    async (key: string): Promise<void> => {
      if (mode === "server" && (!isAuthenticated || !user)) return;

      const keysToRefresh = new Map([[key, storage.get(key)]]);
      const batchData = await storageHandler.load(keysToRefresh);

      const value = batchData.get(key);
      if (value !== undefined) {
        setStorage((prev) => new Map(prev).set(key, value));
        notifySubscribers(key);
      }
    },
    [isAuthenticated, user, storage, storageHandler, notifySubscribers, mode],
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
