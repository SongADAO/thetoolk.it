import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/storage/ServiceContext";

const AmazonS3Context = createContext<ServiceContextType>(
  serviceContextDefault,
);

export { AmazonS3Context };
