import { ReactNode, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { YoutubeTokens } from "@/app/services/youtube/types";
import {
  exchangeCodeForTokens,
  getAuthorizationUrl,
  hasTokenExpired,
  refreshAccessToken,
} from "@/app/services/youtube/youtube-auth";
import { YoutubeContext } from "@/app/services/youtube/YoutubeContext";

interface Props {
  children: ReactNode;
}

export function YoutubeProvider({ children }: Readonly<Props>) {
  const [clientId, setClientId] = useLocalStorage(
    "thetoolkit-youtube-client-id",
    "",
    { initializeWithValue: true },
  );

  const [clientSecret, setClientSecret] = useLocalStorage(
    "thetoolkit-youtube-client-secret",
    "",
    { initializeWithValue: true },
  );

  const [accessToken, setAccessToken] = useState("");

  const [refreshToken, setRefreshToken] = useState("");

  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);

  const [error, setError] = useState("");

  function getRedirectUri() {
    return window.location.href;
  }

  function authorize() {
    const authUrl = getAuthorizationUrl(clientId, getRedirectUri());

    window.location.href = authUrl;
  }

  async function exchangeCode(code: string): Promise<YoutubeTokens | null> {
    try {
      const tokens = await exchangeCodeForTokens(
        code,
        clientId,
        clientSecret,
        getRedirectUri(),
      );

      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      setTokenExpiry(new Date(tokens.expires_at));

      setError("");

      console.log("Tokens obtained successfully");

      return tokens;
    } catch (err: unknown) {
      console.error("Token exchange error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to exchange code for tokens: ${errMessage}`);

      return null;
    }
  }

  async function refreshTokens(): Promise<YoutubeTokens | null> {
    try {
      const tokens = await refreshAccessToken(
        clientId,
        clientSecret,
        getRedirectUri(),
      );

      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      setTokenExpiry(new Date(tokens.expires_at));

      setError("");

      console.log("Access token refreshed successfully");

      return tokens;
    } catch (err: unknown) {
      console.error("Token refresh error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to refresh token: ${errMessage}`);

      return null;
    }
  }

  // Get valid access token (refresh if needed)
  async function getValidAccessToken(): Promise<string> {
    if (hasTokenExpired(tokenExpiry)) {
      console.log("Token expired or about to expire, refreshing...");
      const newTokens = await refreshTokens();

      if (!newTokens) {
        throw new Error("Failed to refresh token");
      }

      return newTokens.access_token;
    }

    if (!accessToken) {
      throw new Error("No access token available. Please authorize first.");
    }

    return accessToken;
  }

  const providerValues = useMemo(
    () => {
      return {
        authorize,
        clientId,
        clientSecret,
        error,
        exchangeCode,
        getValidAccessToken,
        setClientId,
        setClientSecret,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientId, clientSecret, accessToken, refreshToken, tokenExpiry, error],
  );

  return (
    <YoutubeContext.Provider value={providerValues}>
      {children}
    </YoutubeContext.Provider>
  );
}
