"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { FaBluesky } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  needsAccessTokenRenewal,
  needsRefreshTokenRenewal,
  refreshAccessToken,
} from "@/app/services/post/bluesky/auth";
import { BlueskyContext } from "@/app/services/post/bluesky/Context";
import { createPost } from "@/app/services/post/threads/post";
import {
  type BlueskyCredentials,
  defaultBlueskyCredentials,
  defaultOauthAuthorization,
  type OauthAuthorization,
  type PostProps,
  type ServiceAccount,
} from "@/app/services/post/types";

interface Props {
  children: ReactNode;
}

export function BlueskyProvider({ children }: Readonly<Props>) {
  const label = "Bluesky";

  const brandColor = "bluesky";

  const icon = <FaBluesky className="size-6" />;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-bluesky-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<BlueskyCredentials>(
    "thetoolkit-bluesky-credentials",
    defaultBlueskyCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useLocalStorage<OauthAuthorization>(
    "thetoolkit-bluesky-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: true },
  );

  const [accounts, setAccounts] = useLocalStorage<ServiceAccount[]>(
    "thetoolkit-bluesky-accounts",
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

  async function renewRefreshTokenIfNeeded(): Promise<OauthAuthorization | null> {
    if (needsRefreshTokenRenewal(authorization)) {
      console.log(`${label}: Refresh token will expire soon, refreshing...`);
      return await refreshTokens();
    }

    return null;
  }

  // Get valid access token (refresh if needed)

  async function getValidAccessToken(): Promise<string> {
    if (needsAccessTokenRenewal(authorization)) {
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

      setError(`Failed to get bluesky accounts: ${errMessage}`);

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

  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [postError, setPostError] = useState<string>("");
  const [postProgress, setPostProgress] = useState<number>(0);
  const [postStatus, setPostStatus] = useState<string>("");

  async function post({
    text,
    userId,
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
      userId,
      videoUrl,
    });
  }

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
    <BlueskyContext.Provider value={providerValues}>
      {children}
    </BlueskyContext.Provider>
  );
}
