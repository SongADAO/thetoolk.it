import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import { useUserStorage } from "@/hooks/useUserStorage";
import type {
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthCredentials,
  OauthExpiration,
  ServiceAccount,
} from "@/services/post/types";

/**
 * Hook for managing service storage (credentials, authorization, expiration, accounts)
 */
function useServiceStorage(
  serviceId: string,
  defaultCredentials: OauthCredentials,
  defaultAuthorization: OauthAuthorization,
  defaultExpiration: OauthExpiration,
) {
  const [isEnabled, setIsEnabled, isEnabledLoading] = useUserStorage<boolean>(
    `thetoolkit-${serviceId}-enabled`,
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials, isCredentialsLoading] =
    useUserStorage<OauthCredentials>(
      `thetoolkit-${serviceId}-credentials`,
      defaultCredentials,
      { initializeWithValue: true },
    );

  const [authorization, setAuthorization, isAuthorizationLoading] =
    useUserStorage<OauthAuthorization>(
      `thetoolkit-${serviceId}-authorization`,
      defaultAuthorization,
      { initializeWithValue: true },
    );

  const [expiration, setExpiration, isExpirationLoading] =
    useUserStorage<OauthExpiration>(
      `thetoolkit-${serviceId}-expiration`,
      defaultExpiration,
      { initializeWithValue: false },
    );

  const [accounts, setAccounts, isAccountsLoading] = useUserStorage<
    ServiceAccount[]
  >(`thetoolkit-${serviceId}-accounts`, [], { initializeWithValue: true });

  const [codeVerifier, setCodeVerifier] = useLocalStorage<string>(
    `thetoolkit-${serviceId}-code-verifier`,
    "",
    { initializeWithValue: true },
  );

  const loading =
    isEnabledLoading ||
    isCredentialsLoading ||
    isAuthorizationLoading ||
    isExpirationLoading ||
    isAccountsLoading;

  return {
    accounts,
    authorization,
    codeVerifier,
    credentials,
    expiration,
    isEnabled,
    loading,
    setAccounts,
    setAuthorization,
    setCodeVerifier,
    setCredentials,
    setExpiration,
    setIsEnabled,
  };
}

/**
 * Hook for managing OAuth flow
 */
// eslint-disable-next-line max-params
function useOAuthFlow(
  credentials: OauthCredentials,
  authorization: OauthAuthorization,
  expiration: OauthExpiration,
  codeVerifier: string,
  mode: "hosted" | "self",
  authModule: {
    disconnectHosted: () => Promise<OauthAuthorization>;
    exchangeCodeForTokens: (
      code: string,
      iss: string,
      state: string,
      redirectUri: string,
      codeVerifier: string,
      credentials: OauthCredentials,
      requestUrl: string,
      mode: "hosted" | "self",
    ) => Promise<OauthAuthorizationAndExpiration>;
    getAccounts: (
      credentials: OauthCredentials,
      token: string,
      requestUrl: string,
      mode: "hosted" | "self",
    ) => Promise<ServiceAccount[]>;
    getAuthorizationUrl: (
      credentials: OauthCredentials,
      redirectUri: string,
      setCodeVerifier: (codeVerifier: string) => void,
      requestUrl: string,
    ) => Promise<string>;
    getAuthorizationUrlHosted: (
      credentials: OauthCredentials,
    ) => Promise<string>;
    getRedirectUri: () => string;
    refreshAccessToken: (
      authorization: OauthAuthorization,
      credentials: OauthCredentials,
      expiration: OauthExpiration,
      requestUrl: string,
      mode: "hosted" | "self",
    ) => Promise<OauthAuthorizationAndExpiration>;
    refreshAccessTokenHosted: () => Promise<OauthAuthorization>;
  },
  defaultAuthorization: OauthAuthorization,
  defaultExpiration: OauthExpiration,
  setAuthorization: (auth: OauthAuthorization) => void,
  setExpiration: (exp: OauthExpiration) => void,
  setAccounts: (accounts: ServiceAccount[]) => void,
  setError: (error: string) => void,
) {
  const [isHandlingAuth, setIsHandlingAuth] = useState(false);
  const [hasCompletedAuth, setHasCompletedAuth] = useState(false);

  async function exchangeCode(code: string, iss: string, state: string) {
    try {
      const newAuthorization = await authModule.exchangeCodeForTokens(
        code,
        iss,
        state,
        authModule.getRedirectUri(),
        codeVerifier,
        credentials,
        window.location.origin,
        "self",
      );
      setAuthorization(newAuthorization.authorization);
      setExpiration(newAuthorization.expiration);

      const newAccounts = await authModule.getAccounts(
        credentials,
        newAuthorization.authorization.accessToken,
        window.location.origin,
        "self",
      );
      setAccounts(newAccounts);

      setError("");

      console.log("Tokens obtained successfully");

      return true;
    } catch (err: unknown) {
      console.error("Token exchange error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to exchange code for tokens: ${errMessage}`);

      return false;
    }
  }

  async function refreshTokens(): Promise<OauthAuthorization> {
    if (mode === "hosted") {
      await authModule.refreshAccessTokenHosted();

      console.log("Access token refreshed successfully");

      // TODO: pull access token dates from supabase

      return authorization;
    }

    const newAuthorization = await authModule.refreshAccessToken(
      authorization,
      credentials,
      expiration,
      window.location.origin,
      "self",
    );

    setAuthorization(newAuthorization.authorization);
    setExpiration(newAuthorization.expiration);

    console.log("Access token refreshed successfully");

    return newAuthorization.authorization;
  }

  async function authorize(setCodeVerifier: (verifier: string) => void) {
    const authUrl =
      mode === "hosted"
        ? await authModule.getAuthorizationUrlHosted(credentials)
        : await authModule.getAuthorizationUrl(
            credentials,
            authModule.getRedirectUri(),
            setCodeVerifier,
            window.location.origin,
          );

    window.open(authUrl, "_blank");
  }

  async function disconnect() {
    setExpiration(defaultExpiration);
    setAccounts([]);
    if (mode === "hosted") {
      await authModule.disconnectHosted();
    } else {
      setAuthorization(defaultAuthorization);
    }
  }

  async function handleAuthRedirect(
    searchParams: URLSearchParams,
    shouldHandleAuthRedirect: (params: URLSearchParams) => boolean,
  ) {
    try {
      if (shouldHandleAuthRedirect(searchParams)) {
        setIsHandlingAuth(true);

        await exchangeCode(
          searchParams.get("code") ?? "",
          searchParams.get("iss") ?? "",
          searchParams.get("state") ?? "",
        );

        setHasCompletedAuth(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return {
    authorize,
    disconnect,
    exchangeCode,
    handleAuthRedirect,
    hasCompletedAuth,
    isHandlingAuth,
    refreshTokens,
  };
}

/**
 * Hook for managing token refresh
 */
function useTokenRefresh(
  expiration: OauthExpiration,
  loading: boolean,
  authLoading: boolean,
  label: string,
  needsRefreshTokenRenewal: (exp: OauthExpiration) => boolean,
  refreshTokens: () => Promise<OauthAuthorization>,
  setError: (error: string) => void,
) {
  async function renewRefreshTokenIfNeeded() {
    try {
      setError("");

      if (needsRefreshTokenRenewal(expiration)) {
        console.log(`${label}: Refresh token will expire soon, refreshing...`);

        await refreshTokens();
      }
    } catch (err: unknown) {
      console.error("Token refresh error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to auto refresh token: ${errMessage}`);
      // Ignore errors here, will be surfaced when trying to post.
    }
  }

  useEffect(() => {
    if (loading || authLoading) {
      // Wait for user data to load.
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    renewRefreshTokenIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiration.refreshTokenExpiresAt, loading, authLoading]);

  return { renewRefreshTokenIfNeeded };
}

/**
 * Hook for managing posting state
 */
function usePostingState() {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processError, setProcessError] = useState<string>("");
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [processStatus, setProcessStatus] = useState<string>("");

  function resetPostState() {
    setIsProcessing(false);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("");
  }

  return {
    isProcessing,
    processError,
    processProgress,
    processStatus,
    resetPostState,
    setIsProcessing,
    setProcessError,
    setProcessProgress,
    setProcessStatus,
  };
}

export { useOAuthFlow, usePostingState, useServiceStorage, useTokenRefresh };
