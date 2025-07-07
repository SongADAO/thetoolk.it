import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/ServiceContext";

const TiktokContext = createContext<ServiceContextType>(serviceContextDefault);

export { TiktokContext };
