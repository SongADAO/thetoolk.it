import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/ServiceContext";

const FacebookContext = createContext<ServiceContextType>(
  serviceContextDefault,
);

export { FacebookContext };
