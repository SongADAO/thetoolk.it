"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { SiFarcaster } from "react-icons/si";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
// import {
//   exchangeCodeForTokens,
//   getAccounts,
//   getAuthorizationExpiresAt,
//   getCredentialsId,
//   hasCompleteAuthorization,
//   hasCompleteCredentials,
//   hasTokenExpired,
//   needsTokenRefresh,
//   refreshAccessToken,
// } from "@/app/services/neynar/auth";
import { NeynarContext } from "@/app/services/neynar/Context";
import {
  defaultNeynarCredentials,
  defaultOauthAuthorization,
  type NeynarCredentials,
  type OauthAuthorization,
  type ServiceAccount,
} from "@/app/services/types";

interface Props {
  children: ReactNode;
}

export function NeynarProvider({ children }: Readonly<Props>) {
  const label = "Farcaster";

  const brandColor = "neynar";

  const icon = <SiFarcaster className="size-6" />;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-neynar-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<NeynarCredentials>(
    "thetoolkit-neynar-credentials",
    defaultNeynarCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useLocalStorage<OauthAuthorization>(
    "thetoolkit-neynar-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: true },
  );

  const [accounts, setAccounts] = useLocalStorage<ServiceAccount[]>(
    "thetoolkit-neynar-accounts",
    [],
    { initializeWithValue: true },
  );

  const credentialsId = getCredentialsId(credentials);

  const isComplete = hasCompleteCredentials(credentials);

  const isAuthorized = hasCompleteAuthorization(authorization);

  const authorizationExpiresAt = getAuthorizationExpiresAt(authorization);

  async function exchangeCode(): Promise<OauthAuthorization | null> {
    try {
      const newAuthorization = await exchangeCodeForTokens(credentials);

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  async function initAccounts(accessToken: string): Promise<ServiceAccount[]> {
    try {
      const newAccounts = await getAccounts(
        credentials.serviceUrl,
        credentials.username,
        accessToken,
      );

      setAccounts(newAccounts);

      return newAccounts;
    } catch (err: unknown) {
      console.error("Token exchange error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to get neynar accounts: ${errMessage}`);

      setAccounts([]);

      return [];
    }
  }

  async function authorize() {
    const newAuthorization = await exchangeCode();
    if (newAuthorization) {
      await initAccounts(newAuthorization.accessToken);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleAuthRedirect(searchParams: URLSearchParams) {}

  const fields: ServiceFormField[] = [
    {
      label: "Service URL",
      name: "serviceUrl",
      placeholder: "https://bsky.social",
    },
    {
      label: "Username",
      name: "username",
      placeholder: "johndoe.bsky.social",
    },
    {
      label: "App Password",
      name: "appPassword",
      placeholder: "xxxx-xxxx-xxxx-xxxx",
    },
  ];

  const initial: ServiceFormState = {
    appPassword: credentials.appPassword,
    serviceUrl: credentials.serviceUrl,
    username: credentials.username,
  };

  function saveData(formState: ServiceFormState): ServiceFormState {
    setCredentials({
      appPassword: formState.appPassword,
      serviceUrl: formState.serviceUrl,
      username: formState.username,
    });

    return formState;
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    refreshTokensIfNeeded();
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
    <NeynarContext.Provider value={providerValues}>
      {children}
    </NeynarContext.Provider>
  );
}
