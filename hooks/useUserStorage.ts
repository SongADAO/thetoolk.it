import { use, useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { AuthContext } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

/**
 * Custom hook that uses Supabase database when user is authenticated,
 * falls back to localStorage when not authenticated
 */
export function useUserStorage<T>(
  key: string,
  defaultValue: T,
  options?: { initializeWithValue?: boolean },
): [T, (value: T | ((prevValue: T) => T)) => void] {
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

  const keyParts = key.split("-");
  const serviceId = keyParts[1];
  const serviceField = `service_${keyParts[2]}`;

  // Load data from Supabase
  const loadFromSupabase = useCallback(async (): Promise<T | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from("services")
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
      return data?.[String(serviceField)] as T;
      /* eslint-enable @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/ban-ts-comment */
    } catch (error) {
      console.error("Error loading from Supabase:", error);
      return null;
    }
  }, [user?.id, key, supabase]);

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
        const { error } = await supabase.from("services").upsert(
          {
            [serviceField]: newValue,
            service_id: serviceId,
            // updated_at: new Date().toISOString(),
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
    [user?.id, key, supabase],
  );

  // Migrate data from localStorage to Supabase when user logs in
  // const migrateToSupabase = useCallback(async () => {
  //   if (!user?.id) return;

  //   try {
  //     // Check if data already exists in Supabase
  //     const existingData = await loadFromSupabase();

  //     if (existingData === null) {
  //       // No data in Supabase, migrate from localStorage
  //       const success = await saveToSupabase(localValue);
  //       if (success) {
  //         console.log(`Migrated ${key} to Supabase`);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error during migration:", error);
  //   }
  // }, [user?.id, localValue, key, loadFromSupabase, saveToSupabase]);

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
          // await migrateToSupabase();
        } else {
          setValue(supabaseValue);
        }
      } else {
        // Not authenticated, use localStorage
        setValue(localValue);
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
    // migrateToSupabase,
  ]);

  // Handle auth state changes
  // useEffect(() => {
  //   if (!hasInitialized || authLoading) return;

  //   const handleAuthChange = async () => {
  //     if (isAuthenticated && user) {
  //       // User just logged in - migrate data if needed
  //       await migrateToSupabase();

  //       // Load fresh data from Supabase
  //       const supabaseValue = await loadFromSupabase();
  //       if (supabaseValue !== null) {
  //         setValue(supabaseValue);
  //       }
  //     } else {
  //       // User logged out - use localStorage value
  //       setValue(localValue);
  //     }
  //   };

  //   handleAuthChange();
  // }, [
  //   isAuthenticated,
  //   user,
  //   hasInitialized,
  //   authLoading,
  //   localValue,
  //   loadFromSupabase,
  //   migrateToSupabase,
  // ]);

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
        // const success = await saveToSupabase(newValue);
        // if (!success) {
        //   // If Supabase save fails, at least save to localStorage as backup
        //   setLocalValue(newValue);
        // }
      } else {
        // Save to localStorage
        setLocalValue(newValue);
      }
    },
    [value, isAuthenticated, user, saveToSupabase, setLocalValue],
  );

  // Return the loading state during initialization
  if (isLoading && !hasInitialized) {
    return [defaultValue, updateValue];
  }

  return [value, updateValue];
}
