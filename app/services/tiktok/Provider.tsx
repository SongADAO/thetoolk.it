"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { FaTiktok } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getCredentialsId,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  hasTokenExpired,
  needsTokenRefresh,
  refreshAccessToken,
  shouldHandleAuthRedirect,
} from "@/app/services/tiktok/auth";
import { TiktokContext } from "@/app/services/tiktok/Context";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  type OauthAuthorization,
  type OauthCredentials,
  type ServiceAccount,
} from "@/app/services/types";

interface Props {
  children: ReactNode;
}

export function TiktokProvider({ children }: Readonly<Props>) {
  const label = "Tiktok";

  const brandColor = "tiktok";

  const icon = <FaTiktok className="size-6" />;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-tiktok-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<OauthCredentials>(
    "thetoolkit-tiktok-credentials",
    defaultOauthCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useLocalStorage<OauthAuthorization>(
    "thetoolkit-tiktok-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: true },
  );

  const [accounts, setAccounts] = useState<ServiceAccount[]>([]);

  const credentialsId = getCredentialsId(credentials);

  const isComplete = hasCompleteCredentials(credentials);

  const isAuthorized = hasCompleteAuthorization(authorization);

  const authorizationExpiresAt = getAuthorizationExpiresAt(authorization);

  function authorize() {
    const authUrl = getAuthorizationUrl(credentials, getRedirectUri());

    window.location.href = authUrl;
  }

  async function exchangeCode(
    code: string,
  ): Promise<OauthAuthorization | null> {
    try {
      const newAuthorization = await exchangeCodeForTokens(
        code,
        credentials,
        getRedirectUri(),
      );

      setAuthorization(newAuthorization);

      setError("");

      console.log("Tokens obtained successfully");

      return newAuthorization;
    } catch (err: unknown) {
      console.error("Token exchange error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to exchange code for tokens: ${errMessage}`);

      return null;
    }
  }

  async function refreshTokens(): Promise<OauthAuthorization | null> {
    try {
      const newAuthorization = await refreshAccessToken(
        credentials,
        authorization,
      );

      setAuthorization(newAuthorization);

      setError("");

      console.log("Access token refreshed successfully");

      return newAuthorization;
    } catch (err: unknown) {
      console.error("Token refresh error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to refresh token: ${errMessage}`);

      return null;
    }
  }

  async function refreshTokensIfNeeded(): Promise<OauthAuthorization | null> {
    if (
      isAuthorized &&
      needsTokenRefresh(authorization.refreshTokenExpiresAt)
    ) {
      console.log("Refresh token will expire within 30 days, refreshing...");
      return await refreshTokens();
    }

    return null;
  }

  // Get valid access token (refresh if needed)
  async function getValidAccessToken(): Promise<string> {
    if (hasTokenExpired(authorization.accessTokenExpiresAt)) {
      console.log("Token expired or about to expire, refreshing...");
      const newAuthorization = await refreshTokens();

      if (!newAuthorization) {
        throw new Error("Failed to refresh token");
      }

      return newAuthorization.accessToken;
    }

    if (!authorization.accessToken) {
      throw new Error("No access token available. Please authorize first.");
    }

    return authorization.accessToken;
  }

  async function initAccounts(): Promise<ServiceAccount[]> {
    try {
      if (!isAuthorized) {
        setAccounts([]);

        return [];
      }

      const accessToken = await getValidAccessToken();
      const newAccounts = await getAccounts(accessToken);

      setAccounts(newAccounts);

      return newAccounts;
    } catch (err: unknown) {
      console.error("Token exchange error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to get tiktok accounts: ${errMessage}`);

      setAccounts([]);

      return [];
    }
  }

  async function handleAuthRedirect(searchParams: URLSearchParams) {
    try {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      console.log("code", code);
      console.log("state", state);

      if (code && state && shouldHandleAuthRedirect(code, state)) {
        await exchangeCode(code);

        // window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
    }
  }

  const fields: ServiceFormField[] = [
    {
      label: "App ID",
      name: "clientId",
      placeholder: "App ID",
    },
    {
      label: "App Secret",
      name: "clientSecret",
      placeholder: "App Secret",
    },
  ];

  const initial: ServiceFormState = {
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  };

  function saveData(formState: ServiceFormState): ServiceFormState {
    setCredentials({
      clientId: formState.clientId,
      clientSecret: formState.clientSecret,
    });

    return formState;
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    refreshTokensIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorization.accessToken, isAuthorized]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    initAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorization.accessToken, isAuthorized]);

  const providerValues = useMemo(
    () => ({
      accounts,
      authorizationExpiresAt,
      authorize,
      brandColor,
      credentialsId,
      error,
      fields,
      handleAuthRedirect,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      label,
      saveData,
      setIsEnabled,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      accounts,
      authorization,
      brandColor,
      credentialsId,
      credentials,
      error,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      label,
    ],
  );

  return (
    <TiktokContext.Provider value={providerValues}>
      {children}
    </TiktokContext.Provider>
  );
}
