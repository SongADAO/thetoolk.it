import { createContext } from "react";

import {
  storageServiceContextDefault,
  type StorageServiceContextType,
} from "@/app/services/storage/StorageServiceContext";

const PinataContext = createContext<StorageServiceContextType>(
  storageServiceContextDefault,
);

export { PinataContext };
