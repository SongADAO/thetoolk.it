"use client";

import { ReactNode, useMemo, useState } from "react";
import { FaYoutube } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  type OauthAuthorization,
  type OauthCredentials,
  type ServiceAccount,
} from "@/app/services/types";
import {
  exchangeCodeForTokens,
  getAuthorizationUrl,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  hasTokenExpired,
  refreshAccessToken,
  shouldHandleCodeAndScope,
} from "@/app/services/youtube/auth";
import { YoutubeContext } from "@/app/services/youtube/Context";

interface Props {
  children: ReactNode;
}

export function YoutubeProvider({ children }: Readonly<Props>) {
  const label = "YouTube";

  const brandColor = "youtube";

  const icon = <FaYoutube className="size-6" />;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-youtube-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<OauthCredentials>(
    "thetoolkit-youtube-credentials",
    defaultOauthCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useLocalStorage<OauthAuthorization>(
    "thetoolkit-youtube-authorization",
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

  const fields: ServiceFormField[] = [
    {
      label: "Client ID",
      name: "clientId",
      placeholder: "Client ID",
    },
    {
      label: "Client Secret",
      name: "clientSecret",
      placeholder: "Client Secret",
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
    <YoutubeContext.Provider value={providerValues}>
      {children}
    </YoutubeContext.Provider>
  );
}
