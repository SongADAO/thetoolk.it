import { use, useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { AuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

/**
 * Custom hook that uses Supabase database when user is authenticated,
 * falls back to localStorage when not authenticated.
 * Automatically refreshes data when:
 * - User returns to the page (visibility change)
 * - User changes (different user logs in)
 */
export function useUserStorage<T>(
  key: string,
  defaultValue: T,
  options?: { initializeWithValue?: boolean },
): [T, (value: T | ((prevValue: T) => T)) => void, () => Promise<void>] {
  const { user, isAuthenticated, loading: authLoading } = use(AuthContext);

  const supabase = createClient();

  // Use localStorage as fallback
  const [localValue, setLocalValue] = useLocalStorage(
    key,
    defaultValue,
    options,
  );

  // State for the current value and loading state
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Track the current user ID to detect user changes
  const previousUserIdRef = useRef<string | null>(null);

  const keyParts = key.split("-");
  const serviceId = keyParts[1];
  const serviceField = `service_${keyParts[2]}`;

  // Load data from Supabase
  const loadFromSupabase = useCallback(async (): Promise<T | null> => {
    if (!user?.id) return null;

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
        if (error.code === "PGRST116") {
          // No rows found - this is fine, return null
          return null;
        }
        console.error("Error loading from Supabase:", error);
        return null;
      }

      /* eslint-disable @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/ban-ts-comment */
      // @ts-expect-error
      return data[String(serviceField)] as T;
      /* eslint-enable @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/ban-ts-comment */
    } catch (error) {
      console.error("Error loading from Supabase:", error);
      return null;
    }
  }, [user?.id, serviceField, serviceId, supabase]);

  // Save data to Supabase
  const saveToSupabase = useCallback(
    async (newValue: T): Promise<boolean> => {
      if (!user?.id) return false;

      try {
        console.log({
          [serviceField]: newValue,
          service_id: serviceId,
          user_id: user.id,
        });

        const table =
          serviceField === "service_authorization"
            ? "service_authorizations"
            : "services";

        const { error } = await supabase.from(table).upsert(
          {
            [serviceField]: newValue,
            service_id: serviceId,
            user_id: user.id,
          },
          {
            onConflict: "user_id,service_id",
          },
        );

        if (error) {
          console.error("Error saving to Supabase:", error);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error saving to Supabase:", error);
        return false;
      }
    },
    [user?.id, serviceField, serviceId, supabase],
  );

  // Manual refresh function
  const refreshFromSupabase = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user) return;

    try {
      const supabaseValue = await loadFromSupabase();
      if (supabaseValue !== null) {
        setValue(supabaseValue);
      }
    } catch (error) {
      console.error("Error refreshing from Supabase:", error);
    }
  }, [isAuthenticated, user, loadFromSupabase]);

  // Initialize data
  useEffect(() => {
    if (authLoading || hasInitialized) return;

    const initializeData = async () => {
      setIsLoading(true);

      if (isAuthenticated && user) {
        // Try to load from Supabase first
        const supabaseValue = await loadFromSupabase();

        if (supabaseValue === null) {
          // No data in Supabase, use localStorage value and migrate
          // setValue(localValue);
        } else {
          // User logged out - use localStorage value
          setValue(supabaseValue);
        }

        // Track the current user ID
        previousUserIdRef.current = user.id;
      } else {
        // Not authenticated, use localStorage
        setValue(localValue);
        previousUserIdRef.current = null;
      }

      setIsLoading(false);
      setHasInitialized(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    initializeData();
  }, [
    isAuthenticated,
    user,
    authLoading,
    hasInitialized,
    localValue,
    loadFromSupabase,
  ]);

  // Handle user changes (different user logs in)
  useEffect(() => {
    if (!hasInitialized || authLoading) return;

    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;
    console.log("Current user ID:", currentUserId);
    console.log("Previous user ID:", previousUserId);
    // Check if user has changed (different user ID)
    if (currentUserId !== previousUserId) {
      const handleUserChange = async () => {
        if (isAuthenticated && user) {
          // Different user logged in - load their data from Supabase
          const supabaseValue = await loadFromSupabase();
          if (supabaseValue === null) {
            // No data in Supabase, use localStorage value and migrate
            // setValue(localValue);
          } else {
            // User logged out - use localStorage value
            setValue(supabaseValue);
          }
        } else {
          // User logged out - use localStorage value
          setValue(localValue);
        }

        // Update the tracked user ID
        previousUserIdRef.current = currentUserId;
      };

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleUserChange();
    }
  }, [
    isAuthenticated,
    user,
    hasInitialized,
    authLoading,
    localValue,
    loadFromSupabase,
    defaultValue,
  ]);

  // Handle page visibility changes (user returns to tab)
  useEffect(() => {
    if (!hasInitialized) return;

    const handleVisibilityChange = () => {
      // Only refresh when page becomes visible and user is authenticated
      if (!document.hidden && isAuthenticated && user) {
        // Small delay to ensure any auth state is stable
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          refreshFromSupabase();
        }, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // eslint-disable-next-line @typescript-eslint/consistent-return
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasInitialized, isAuthenticated, user, refreshFromSupabase]);

  // Handle window focus (additional safety for when user returns)
  useEffect(() => {
    if (!hasInitialized) return;

    const handleFocus = () => {
      if (isAuthenticated && user) {
        // Small delay to avoid excessive calls
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          refreshFromSupabase();
        }, 100);
      }
    };

    window.addEventListener("focus", handleFocus);

    // eslint-disable-next-line @typescript-eslint/consistent-return
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [hasInitialized, isAuthenticated, user, refreshFromSupabase]);

  // Update function
  const updateValue = useCallback(
    async (newValueOrUpdater: T | ((prevValue: T) => T)) => {
      const newValue =
        typeof newValueOrUpdater === "function"
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            (newValueOrUpdater as (prevValue: T) => T)(value)
          : newValueOrUpdater;

      // Update local state immediately for responsive UI
      setValue(newValue);

      if (isAuthenticated && user) {
        // Save to Supabase
        await saveToSupabase(newValue);
      } else {
        // Save to localStorage
        setLocalValue(newValue);
      }
    },
    [value, isAuthenticated, user, saveToSupabase, setLocalValue],
  );

  // Return the loading state during initialization
  if (isLoading && !hasInitialized) {
    return [defaultValue, updateValue, refreshFromSupabase];
  }

  return [value, updateValue, refreshFromSupabase];
}
