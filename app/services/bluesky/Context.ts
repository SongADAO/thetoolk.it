import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/ServiceContext";

const BlueskyContext = createContext<ServiceContextType>(serviceContextDefault);

export { BlueskyContext };
