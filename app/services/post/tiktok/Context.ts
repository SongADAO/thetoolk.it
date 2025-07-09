import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/post/ServiceContext";

const TiktokContext = createContext<ServiceContextType>(serviceContextDefault);

export { TiktokContext };
