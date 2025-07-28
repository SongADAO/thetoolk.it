import { createContext } from "react";

import {
  storageServiceContextDefault,
  type StorageServiceContextType,
} from "@/services/storage/StorageServiceContext";

const PinataContext = createContext<StorageServiceContextType>(
  storageServiceContextDefault,
);

export { PinataContext };
