"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { FaInstagram } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import {
  exchangeCodeForTokens,
  getAuthorizationUrl,
  getInstagramAccounts,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  hasTokenExpired,
  refreshAccessToken,
  shouldHandleCodeAndState,
} from "@/app/services/instagram/auth";
import { InstagramContext } from "@/app/services/instagram/Context";
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

export function InstagramProvider({ children }: Readonly<Props>) {
  const label = "Instagram";

  const brandColor = "instagram";

  const icon = <FaInstagram className="size-6" />;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-instagram-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<OauthCredentials>(
    "thetoolkit-instagram-credentials",
    defaultOauthCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useLocalStorage<OauthAuthorization>(
    "thetoolkit-instagram-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: true },
  );

  const [accounts, setAccounts] = useState<ServiceAccount[]>([]);

  const configId = JSON.stringify(credentials);

  const isComplete = hasCompleteCredentials(credentials);

  const isAuthorized = hasCompleteAuthorization(authorization);

  const authorizationExpiresAt = authorization.refreshTokenExpiresAt;

  function authorize() {
    const authUrl = getAuthorizationUrl(credentials.clientId, getRedirectUri());

    window.location.href = authUrl;
  }

  async function exchangeCode(
    code: string,
  ): Promise<OauthAuthorization | null> {
    try {
      const newAuthorization = await exchangeCodeForTokens(
        code,
        credentials.clientId,
        credentials.clientSecret,
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
        credentials.clientId,
        credentials.clientSecret,
        getRedirectUri(),
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

  async function initAuthCodes(code: string | null, state: string | null) {
    try {
      if (code && state && shouldHandleCodeAndState(code, state)) {
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

  async function initAccounts(): Promise<ServiceAccount[]> {
    try {
      const instagramAccounts = await getInstagramAccounts(
        authorization.accessToken,
      );

      setAccounts(instagramAccounts);

      return instagramAccounts;
    } catch (err: unknown) {
      console.error("Token exchange error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to get instagram accounts: ${errMessage}`);

      setAccounts([]);

      return [];
    }
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    initAccounts();
  }, [authorization.accessToken]);

  const providerValues = useMemo(
    () => ({
      accounts,
      authorizationExpiresAt,
      authorize,
      brandColor,
      configId,
      error,
      exchangeCode,
      fields,
      getValidAccessToken,
      icon,
      initAuthCodes,
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
      configId,
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
    <InstagramContext.Provider value={providerValues}>
      {children}
    </InstagramContext.Provider>
  );
}
