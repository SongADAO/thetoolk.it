import { createContext } from "react";

import { YoutubeTokens } from "@/app/services/youtube/types";

interface YoutubeContextType {
  authorize: () => void;
  clientId: string;
  clientSecret: string;
  error: string;
  exchangeCode: (code: string) => Promise<YoutubeTokens | null>;
  getValidAccessToken: () => Promise<string>;
  setClientId: (clientId: string) => void;
  setClientSecret: (clientSecret: string) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
const YoutubeContext = createContext<YoutubeContextType>({
  authorize: () => {},
  clientId: "",
  clientSecret: "",
  error: "",
  exchangeCode: async (code: string) => null,
  getValidAccessToken: async () => "",
  setClientId: (clientId: string) => {},
  setClientSecret: (clientSecret: string) => {},
});
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

export { YoutubeContext };
