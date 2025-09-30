import React, { createContext } from "react";

interface StorageValue<T = any> {
  value: T;
  isLoading: boolean;
}

interface UserStorageContextType {
  getValue: <T>(key: string, defaultValue: T) => StorageValue<T>;
  refresh: (key: string) => Promise<void>;
  requestInit: (key: string, defaultValue: any) => void;
  setValue: <T>(key: string, value: T | ((prev: T) => T)) => Promise<void>;
  subscribersRef: React.MutableRefObject<Map<string, Set<() => void>>>;
}

const UserStorageContext = createContext<UserStorageContextType>({
  getValue: () => ({ isLoading: true, value: null }),
  refresh: async () => Promise.resolve(),
  requestInit: () => {},
  setValue: async () => Promise.resolve(),
  subscribersRef: { current: new Map() },
});

export { UserStorageContext };
export type { UserStorageContextType };
