import { createContext } from "react";

import {
  storageServiceContextDefault,
  type StorageServiceContextType,
} from "@/services/storage/StorageServiceContext";

const AmazonS3Context = createContext<StorageServiceContextType>(
  storageServiceContextDefault,
);

export { AmazonS3Context };
