"use client";

import { ReactNode, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import {
  exchangeCodeForTokens,
  getAuthorizationUrl,
  hasTokenExpired,
  refreshAccessToken,
  shouldHandleCodeAndScope,
} from "@/app/services/youtube/auth";
import { YoutubeContext } from "@/app/services/youtube/Context";
import { YoutubeTokens } from "@/app/services/youtube/types";

interface Props {
  children: ReactNode;
}

export function YoutubeProvider({ children }: Readonly<Props>) {
  const [isEnabled, setIsEnabled] = useLocalStorage(
    "thetoolkit-youtube-is-enabled",
    false,
    { initializeWithValue: false },
  );

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

  const [accessToken, setAccessToken] = useLocalStorage(
    "thetoolkit-youtube-access-token",
    "",
    { initializeWithValue: true },
  );

  const [refreshToken, setRefreshToken] = useLocalStorage(
    "thetoolkit-youtube-refresh-token",
    "",
    { initializeWithValue: true },
  );

  const [accessTokenExpiry, setAccessTokenExpiry] = useLocalStorage(
    "thetoolkit-youtube-access-token-expiry",
    "",
    { initializeWithValue: true },
  );

  const [refreshTokenExpiry, setRefreshTokenExpiry] = useLocalStorage(
    "thetoolkit-youtube-refresh-token-expiry",
    "",
    { initializeWithValue: true },
  );

  const isComplete = clientId !== "" && clientSecret !== "";

  const isAuthorized =
    accessToken !== "" &&
    refreshToken !== "" &&
    accessTokenExpiry !== "" &&
    refreshTokenExpiry !== "" &&
    !hasTokenExpired(refreshTokenExpiry);

  const configId = `${clientId}-${clientSecret}`;

  const [error, setError] = useState("");

  function getRedirectUri() {
    const url = new URL(window.location.href);
    const baseUrl = url.origin + url.pathname;

    return baseUrl;
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
      setAccessTokenExpiry(tokens.access_token_expires_at);
      setRefreshToken(tokens.refresh_token);
      setRefreshTokenExpiry(tokens.refresh_token_expires_at);

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
      setAccessTokenExpiry(tokens.access_token_expires_at);
      setRefreshToken(tokens.refresh_token);
      setRefreshTokenExpiry(tokens.refresh_token_expires_at);

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
    if (hasTokenExpired(accessTokenExpiry)) {
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

  async function initAuthCodes(code: string | null, scope: string | null) {
    try {
      if (code && scope && shouldHandleCodeAndScope(code, scope)) {
        await exchangeCode(code);

        // window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
    }
  }

  const providerValues = useMemo(
    () => {
      return {
        authorize,
        clientId,
        clientSecret,
        configId,
        error,
        exchangeCode,
        getValidAccessToken,
        initAuthCodes,
        isAuthorized,
        isComplete,
        isEnabled,
        setClientId,
        setClientSecret,
        setIsEnabled,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      accessToken,
      clientId,
      clientSecret,
      configId,
      error,
      isAuthorized,
      isComplete,
      isEnabled,
      refreshToken,
      accessTokenExpiry,
      refreshTokenExpiry,
    ],
  );

  return (
    <YoutubeContext.Provider value={providerValues}>
      {children}
    </YoutubeContext.Provider>
  );
}
