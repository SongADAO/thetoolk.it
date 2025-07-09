import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/post/ServiceContext";

const FacebookContext = createContext<ServiceContextType>(
  serviceContextDefault,
);

export { FacebookContext };
