import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/post/ServiceContext";

const ThreadsContext = createContext<ServiceContextType>(serviceContextDefault);

export { ThreadsContext };
