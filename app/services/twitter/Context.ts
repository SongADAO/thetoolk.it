import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/ServiceContext";

const TwitterContext = createContext<ServiceContextType>(serviceContextDefault);

export { TwitterContext };
