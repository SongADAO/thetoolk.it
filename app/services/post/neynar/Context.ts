import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/post/ServiceContext";

const NeynarContext = createContext<ServiceContextType>(serviceContextDefault);

export { NeynarContext };
