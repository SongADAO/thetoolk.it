"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { FaTwitter } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import { createPost } from "@/app/services/post/threads/post";
import {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getCredentialsId,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  needsAccessTokenRenewal,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  shouldHandleAuthRedirect,
} from "@/app/services/post/twitter/auth";
import { TwitterContext } from "@/app/services/post/twitter/Context";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  type OauthAuthorization,
  type OauthCredentials,
  type PostProps,
  type ServiceAccount,
} from "@/app/services/post/types";

interface Props {
  children: ReactNode;
}

export function TwitterProvider({ children }: Readonly<Props>) {
  const label = "Twitter";

  const brandColor = "twitter";

  const icon = <FaTwitter className="size-6" />;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-twitter-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<OauthCredentials>(
    "thetoolkit-twitter-credentials",
    defaultOauthCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useLocalStorage<OauthAuthorization>(
    "thetoolkit-twitter-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: true },
  );

  const [accounts, setAccounts] = useLocalStorage<ServiceAccount[]>(
    "thetoolkit-twitter-accounts",
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

  async function renewRefreshTokenIfNeeded(): Promise<OauthAuthorization | null> {
    if (needsRefreshTokenRenewal(authorization)) {
      console.log(`${label}: Refresh token will expire soon, refreshing...`);
      return await refreshTokens();
    }

    return null;
  }

  async function getValidAccessToken(): Promise<string> {
    const newAuthorization = await refreshTokens();

    if (!newAuthorization) {
      throw new Error("Failed to refresh token");
    }

    return newAuthorization.accessToken;
  }

  async function initAccounts(accessToken: string): Promise<ServiceAccount[]> {
    try {
      const newAccounts = await getAccounts(accessToken);

      setAccounts(newAccounts);

      return newAccounts;
    } catch (err: unknown) {
      console.error("Token exchange error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to get twitter accounts: ${errMessage}`);

      setAccounts([]);

      return [];
    }
  }

  async function authorize() {
    const authUrl = await getAuthorizationUrl(credentials, getRedirectUri());

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

  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [postError, setPostError] = useState<string>("");
  const [postProgress, setPostProgress] = useState<number>(0);
  const [postStatus, setPostStatus] = useState<string>("");

  async function post({
    title,
    text,
    userId,
    video,
    videoUrl,
  }: Readonly<PostProps>): Promise<string | null> {
    if (!isEnabled || !isComplete || !isAuthorized || isPosting) {
      return null;
    }

    return await createPost({
      accessToken: await getValidAccessToken(),
      setIsPosting,
      setPostError,
      setPostProgress,
      setPostStatus,
      text,
      title,
      userId,
      video,
      videoUrl,
    });
  }

  const fields: ServiceFormField[] = [
    {
      label: "OAuth 2.0 Client ID",
      name: "clientId",
      placeholder: "OAuth 2.0 Client ID",
    },
    {
      label: "OAuth 2.0 Client Secret",
      name: "clientSecret",
      placeholder: "OAuth 2.0 Client Secret",
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
    renewRefreshTokenIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorization.refreshTokenExpiresAt]);

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
      isPosting,
      label,
      post,
      postError,
      postProgress,
      postStatus,
      saveData,
      setIsEnabled,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      accounts,
      authorization,
      brandColor,
      credentials,
      credentialsId,
      error,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isPosting,
      label,
      postError,
      postProgress,
      postStatus,
    ],
  );

  return (
    <TwitterContext.Provider value={providerValues}>
      {children}
    </TwitterContext.Provider>
  );
}
