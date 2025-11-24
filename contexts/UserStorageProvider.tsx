"use client";

import {
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import useSWR from "swr";

import { AuthContext } from "@/contexts/AuthContext";
import {
  UserStorageContext,
  type UserStorageContextType,
} from "@/contexts/UserStorageContext";

// Types
interface ParsedKey {
  serviceId: string;
  serviceField: string;
}

interface ServiceRecord {
  [key: string]: unknown;
  service_id: string;
}

// Utility Functions
const parseKey = (key: string): ParsedKey => {
  const keyParts = key.split("-");
  return {
    serviceField: `service_${keyParts[2]}`,
    serviceId: keyParts[1],
  };
};

// Fetcher for server mode
const serverFetcher = async (url: string): Promise<ServiceRecord[]> => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Could not load service data: ${errorData.error_description ?? errorData.error}`,
    );
  }

  return response.json();
};

// Browser mode storage handler
const browserStorageHandler = {
  load(key: string, defaultValue: unknown): unknown {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    const localValue = localStorage.getItem(key);
    return localValue ? JSON.parse(localValue) : defaultValue;
  },

  save(key: string, value: unknown): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  },
};

export function UserStorageProvider({
  children,
  mode,
}: {
  readonly children: ReactNode;
  readonly mode: "server" | "browser";
}) {
  const { user, isAuthenticated, isLoading: authIsLoading } = use(AuthContext);

  // SWR for server mode - fetches all services at once
  const {
    data: servicesData,
    mutate,
    isLoading: swrIsLoading,
  } = useSWR<ServiceRecord[]>(
    mode === "server" && isAuthenticated && user
      ? `/api/user/${user.id}/services/get`
      : null,
    serverFetcher,
    {
      // dedupingInterval: 0,
      // 500ms throttle on focus revalidation. Default 5s.
      focusThrottleInterval: 500,
      // Revalidate stale data on mount
      // revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  // Track hydration state for browser mode to prevent hydration errors
  const isHydratedRef = useRef(false);

  // Subscriber management for cross-component reactivity
  const subscribersRef = useRef<Map<string, Set<() => void>>>(new Map());

  // Notify all subscribers of a key
  const notifySubscribers = useCallback((key: string) => {
    const subscribers = subscribersRef.current.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => callback());
    }
  }, []);

  // Notify all subscribers (for all keys)
  const notifyAllSubscribers = useCallback(() => {
    subscribersRef.current.forEach((subscribers) => {
      subscribers.forEach((callback) => callback());
    });
  }, []);

  // Get value for a specific key
  const getValue = useCallback(
    <T,>(key: string, defaultValue: T) => {
      if (mode === "browser") {
        // During SSR or before hydration, return defaultValue to prevent hydration mismatch
        if (!isHydratedRef.current) {
          return {
            isLoading: false,
            value: defaultValue,
          };
        }

        const value = browserStorageHandler.load(key, defaultValue);

        return {
          isLoading: false,
          // Type assertion is safe here: caller specifies T and provides matching defaultValue
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          value: value as T,
        };
      }

      // Server mode: read from SWR cache
      const isLoading = authIsLoading || swrIsLoading;

      if (!servicesData) {
        return {
          isLoading,
          value: defaultValue,
        };
      }

      const { serviceId, serviceField } = parseKey(key);
      const serviceRecord = servicesData.find(
        (record) => record.service_id === serviceId,
      );

      const value = serviceRecord?.[serviceField] ?? defaultValue;

      return {
        isLoading,
        // Type assertion is safe here: caller specifies T and provides matching defaultValue
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        value: value as T,
      };
    },
    [mode, servicesData, authIsLoading, swrIsLoading],
  );

  // Set value for a specific key
  const setValue = useCallback(
    async <T,>(
      key: string,
      valueOrUpdater: T | ((prev: T) => T),
    ): Promise<void> => {
      // Get current value
      // Type assertion is safe here: caller specifies T when calling setValue
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const { value: currentValue } = getValue<T>(key, undefined as T);

      // Determine new value
      // If valueOrUpdater is a function, treat it as an updater
      // Note: To store a function value, wrap it: setValue(key, () => myFunction)
      // Type assertion required for updater pattern - caller ensures function signature matches
      const newValue: T =
        typeof valueOrUpdater === "function"
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            (valueOrUpdater as (prev: T) => T)(currentValue)
          : valueOrUpdater;

      if (mode === "browser") {
        browserStorageHandler.save(key, newValue);
        notifySubscribers(key);

        return;
      }

      if (!user) {
        console.error("User not authenticated. Cannot set value.");
        return;
      }

      // Server mode: optimistic update + persist
      const { serviceId, serviceField } = parseKey(key);

      // Optimistic update
      await mutate(
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          const updatedData = currentData.map((record) =>
            record.service_id === serviceId
              ? { ...record, [serviceField]: newValue }
              : record,
          );

          return updatedData;
        },
        { revalidate: false },
      );

      notifySubscribers(key);

      // Persist to backend
      try {
        const response = await fetch(`/api/user/${user.id}/services/update`, {
          body: JSON.stringify({ serviceField, serviceId, value: newValue }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Could not save service data: ${errorData.error_description ?? errorData.error}`,
          );
        }

        await mutate();
      } catch (err) {
        console.error("Error saving to database:", err);
        await mutate();
      }
    },
    [mode, getValue, mutate, notifySubscribers, user],
  );

  // Refresh a specific key
  const refresh = useCallback(
    async (key: string): Promise<void> => {
      if (mode === "server") {
        await mutate();
        notifySubscribers(key);
      } else {
        // Browser mode: just notify to trigger re-read from localStorage
        notifySubscribers(key);
      }
    },
    [mode, mutate, notifySubscribers],
  );

  // Hydration effect for browser mode
  useEffect(() => {
    if (mode === "browser" && !isHydratedRef.current) {
      isHydratedRef.current = true;
      notifyAllSubscribers();
    }
  }, [mode, notifyAllSubscribers]);

  // Browser mode: listen for focus events to refresh from localStorage
  useEffect(() => {
    if (mode !== "browser") {
      return undefined;
    }

    const handleFocus = () => {
      // Notify all subscribers to re-read from localStorage
      notifyAllSubscribers();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [mode, notifyAllSubscribers]);

  const providerValues: UserStorageContextType = useMemo(
    () => ({
      getValue,
      refresh,
      setValue,
      subscribersRef,
    }),
    [getValue, setValue, refresh],
  );

  return (
    <UserStorageContext.Provider value={providerValues}>
      {children}
    </UserStorageContext.Provider>
  );
}
