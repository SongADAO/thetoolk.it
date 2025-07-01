import { ReactNode, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";

import { YoutubeContext } from "@/app/services/youtube/YoutubeContext";

interface Props {
  children: ReactNode;
}

export function YoutubeProvider({ children }: Readonly<Props>) {
  const [clientId, setClientId] = useLocalStorage(
    "thetoolkit-youtube-client-id",
    "",
    { initializeWithValue: false },
  );

  const [clientSecret, setClientSecret] = useLocalStorage(
    "thetoolkit-youtube-client-secret",
    "",
    { initializeWithValue: false },
  );

  const providerValues = useMemo(
    () => {
      return {
        clientId,
        clientSecret,
        setClientId,
        setClientSecret,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientId, clientSecret],
  );

  return (
    <YoutubeContext.Provider value={providerValues}>
      {children}
    </YoutubeContext.Provider>
  );
}
