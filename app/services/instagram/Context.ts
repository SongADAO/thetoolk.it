import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/ServiceContext";

const InstagramContext = createContext<ServiceContextType>(
  serviceContextDefault,
);

export { InstagramContext };
