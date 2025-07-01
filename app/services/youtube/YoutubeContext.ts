import { createContext } from "react";

interface YoutubeContextType {
  clientId: string;
  clientSecret: string;
  setClientId: (clientId: string) => void;
  setClientSecret: (clientSecret: string) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const YoutubeContext = createContext<YoutubeContextType>({
  clientId: "",
  clientSecret: "",
  setClientId: (clientId: string) => {},
  setClientSecret: (clientSecret: string) => {},
});
/* eslint-enable @typescript-eslint/no-unused-vars */

export { YoutubeContext };
