import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/ServiceContext";

const YoutubeContext = createContext<ServiceContextType>(serviceContextDefault);

export { YoutubeContext };
