import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/post/ServiceContext";

const TwitterContext = createContext<ServiceContextType>(serviceContextDefault);

export { TwitterContext };
