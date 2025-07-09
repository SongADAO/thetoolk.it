import { createContext } from "react";

import {
  serviceContextDefault,
  type ServiceContextType,
} from "@/app/services/storage/ServiceContext";

const PinataContext = createContext<ServiceContextType>(serviceContextDefault);

export { PinataContext };
