import { createContext } from "react";

interface StorageValue<T> {
  value: T;
  isLoading: boolean;
}

interface UserStorageContextType {
  getValue: <T>(key: string, defaultValue: T) => StorageValue<T>;
  refresh: (key: string) => Promise<void>;
  setValue: <T>(key: string, value: T | ((prev: T) => T)) => Promise<void>;
  subscribersRef: { current: Map<string, Set<() => void>> };
}

const UserStorageContext = createContext<UserStorageContextType>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getValue: (key, defaultValue) => ({ isLoading: true, value: defaultValue }),
  refresh: async () => Promise.resolve(),
  setValue: async () => Promise.resolve(),
  subscribersRef: { current: new Map() },
});

export { UserStorageContext };
export type { UserStorageContextType };
