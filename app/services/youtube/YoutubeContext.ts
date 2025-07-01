import { createContext } from "react";

import { YoutubeTokens } from "@/app/services/youtube/types";

interface YoutubeContextType {
  authorize: () => void;
  clientId: string;
  clientSecret: string;
  configId: string;
  error: string;
  exchangeCode: (code: string) => Promise<YoutubeTokens | null>;
  getValidAccessToken: () => Promise<string>;
  initAuthCodes: (code: string | null, scope: string | null) => Promise<void>;
  isComplete: boolean;
  isEnabled: boolean;
  setClientId: (clientId: string) => void;
  setClientSecret: (clientSecret: string) => void;
  setIsEnabled: (isEnabled: boolean) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
const YoutubeContext = createContext<YoutubeContextType>({
  authorize: () => {},
  clientId: "",
  clientSecret: "",
  configId: "",
  error: "",
  exchangeCode: async (code: string) => null,
  getValidAccessToken: async () => "",
  initAuthCodes: async (code: string | null, scope: string | null) => {},
  isComplete: false,
  isEnabled: false,
  setClientId: (clientId: string) => {},
  setClientSecret: (clientSecret: string) => {},
  setIsEnabled: (isEnabled: boolean) => {},
});
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

export { YoutubeContext };
