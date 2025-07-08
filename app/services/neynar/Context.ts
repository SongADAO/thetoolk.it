import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/ServiceContext";

const NeynarContext = createContext<ServiceContextType>(serviceContextDefault);

export { NeynarContext };
