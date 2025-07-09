"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { GiPinata } from "react-icons/gi";
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
} from "@/app/services/storage/pinata/auth";
import { PinataContext } from "@/app/services/storage/pinata/Context";
import {
  defaultOauthAuthorization,
  defaultPinataCredentials,
  type OauthAuthorization,
  type PinataCredentials,
  type ServiceAccount,
} from "@/app/services/storage/types";

interface Props {
  children: ReactNode;
}

export function PinataProvider({ children }: Readonly<Props>) {
  const label = "Pinata";

  const brandColor = "pinata";

  const icon = <GiPinata className="size-6" />;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-pinata-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<PinataCredentials>(
    "thetoolkit-pinata-credentials",
    defaultPinataCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useLocalStorage<OauthAuthorization>(
    "thetoolkit-pinata-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: true },
  );

  const [accounts, setAccounts] = useLocalStorage<ServiceAccount[]>(
    "thetoolkit-pinata-accounts",
    [],
    { initializeWithValue: true },
  );

  const credentialsId = getCredentialsId(credentials);

  const isComplete = hasCompleteCredentials(credentials);

  const isAuthorized = hasCompleteAuthorization(authorization);

  const authorizationExpiresAt = getAuthorizationExpiresAt(authorization);

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
      const newAuthorization = await refreshAccessToken(authorization);

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
      const newAccounts = await getAccounts(accessToken);

      setAccounts(newAccounts);

      return newAccounts;
    } catch (err: unknown) {
      console.error("Token exchange error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to get pinata accounts: ${errMessage}`);

      setAccounts([]);

      return [];
    }
  }

  function authorize() {
    const authUrl = getAuthorizationUrl(credentials, getRedirectUri());

    window.location.href = authUrl;
  }

  async function handleAuthRedirect(searchParams: URLSearchParams) {
    try {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      console.log("code", code);
      console.log("state", state);

      if (code && state && shouldHandleAuthRedirect(code, state)) {
        const newAuthorization = await exchangeCode(code);
        if (newAuthorization) {
          await initAccounts(newAuthorization.accessToken);
        }

        // window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
    }
  }

  const fields: ServiceFormField[] = [
    {
      label: "API Key",
      name: "apiKey",
      placeholder: "API Key",
    },
    {
      label: "API Secret",
      name: "apiSecret",
      placeholder: "API Secret",
    },
    {
      label: "JWT (secret access token)",
      name: "jwt",
      placeholder: "JWT (secret access token)",
    },
  ];

  const initial: ServiceFormState = {
    apiKey: credentials.apiKey,
    apiSecret: credentials.apiSecret,
    jwt: credentials.jwt,
  };

  function saveData(formState: ServiceFormState): ServiceFormState {
    setCredentials({
      apiKey: formState.apiKey,
      apiSecret: formState.apiSecret,
      jwt: formState.jwt,
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
    <PinataContext.Provider value={providerValues}>
      {children}
    </PinataContext.Provider>
  );
}
