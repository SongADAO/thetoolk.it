import { createContext, ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/ServiceForm";
import { YoutubeTokens } from "@/app/services/youtube/types";

interface YoutubeContextType {
  authorize: () => void;
  brandColor: string;
  clientId: string;
  clientSecret: string;
  configId: string;
  error: string;
  exchangeCode: (code: string) => Promise<YoutubeTokens | null>;
  getValidAccessToken: () => Promise<string>;
  icon: ReactNode | undefined;
  initAuthCodes: (code: string | null, scope: string | null) => Promise<void>;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
  serviceFormFields: ServiceFormField[];
  serviceFormInitial: ServiceFormState;
  setClientId: (clientId: string) => void;
  setClientSecret: (clientSecret: string) => void;
  setIsEnabled: (isEnabled: boolean) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
const YoutubeContext = createContext<YoutubeContextType>({
  authorize: () => {},
  brandColor: "",
  clientId: "",
  clientSecret: "",
  configId: "",
  error: "",
  exchangeCode: async (code: string) => null,
  getValidAccessToken: async () => "",
  icon: undefined,
  initAuthCodes: async (code: string | null, scope: string | null) => {},
  isAuthorized: false,
  isComplete: false,
  isEnabled: false,
  label: "",
  serviceFormFields: [],
  serviceFormInitial: {},
  setClientId: (clientId: string) => {},
  setClientSecret: (clientSecret: string) => {},
  setIsEnabled: (isEnabled: boolean) => {},
});
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

export { YoutubeContext };
