import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/post/ServiceContext";

const InstagramContext = createContext<ServiceContextType>(
  serviceContextDefault,
);

export { InstagramContext };
