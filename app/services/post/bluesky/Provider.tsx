"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { FaBluesky } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import { DEBUG_MODE } from "@/app/config/constants";
import {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  needsRefreshTokenRenewal,
  refreshAccessToken,
} from "@/app/services/post/bluesky/auth";
import { BlueskyContext } from "@/app/services/post/bluesky/Context";
import { createPost } from "@/app/services/post/bluesky/post";
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

  const hasAuthorizationStep = true;

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

  async function getValidAccessToken(): Promise<string> {
    if (DEBUG_MODE) {
      return "test-token";
    }

    const newAuthorization = await refreshTokens();

    if (!newAuthorization?.accessToken) {
      throw new Error("Failed to get valid access token");
    }

    return newAuthorization.accessToken;
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

  const [isHandlingAuth, setIsHandlingAuth] = useState(false);
  const [hasCompletedAuth, setHasCompletedAuth] = useState(false);

  async function handleAuthRedirect(searchParams: URLSearchParams) {}

  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [postError, setPostError] = useState<string>("");
  const [postProgress, setPostProgress] = useState<number>(0);
  const [postStatus, setPostStatus] = useState<string>("");

  async function post({
    title,
    text,
    username,
    video,
  }: Readonly<PostProps>): Promise<string | null> {
    if (!isEnabled || !isComplete || !isAuthorized || isPosting) {
      return null;
    }

    return await createPost({
      accessToken: await getValidAccessToken(),
      credentials,
      setIsPosting,
      setPostError,
      setPostProgress,
      setPostStatus,
      text,
      title,
      username,
      video,
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
      hasAuthorizationStep,
      hasCompletedAuth,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isHandlingAuth,
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
      hasAuthorizationStep,
      hasCompletedAuth,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isHandlingAuth,
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
