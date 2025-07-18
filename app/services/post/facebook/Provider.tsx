"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { FaFacebook } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import { DEBUG_POST } from "@/app/config/constants";
import {
  exchangeCodeForTokens,
  getAccountAccessToken,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getCredentialsId,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  shouldHandleAuthRedirect,
} from "@/app/services/post/facebook/auth";
import { FacebookContext } from "@/app/services/post/facebook/Context";
import { createPost } from "@/app/services/post/facebook/post";
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

export function FacebookProvider({ children }: Readonly<Props>) {
  const label = "Facebook";

  const brandColor = "facebook";

  const icon = <FaFacebook className="size-6" />;

  const hasAuthorizationStep = true;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-facebook-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<OauthCredentials>(
    "thetoolkit-facebook-credentials",
    defaultOauthCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useLocalStorage<OauthAuthorization>(
    "thetoolkit-facebook-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: true },
  );

  const [accounts, setAccounts] = useLocalStorage<ServiceAccount[]>(
    "thetoolkit-facebook-accounts",
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

  async function renewRefreshTokenIfNeeded(): Promise<OauthAuthorization | null> {
    if (needsRefreshTokenRenewal(authorization)) {
      console.log(`${label}: Refresh token will expire soon, refreshing...`);
      return await refreshTokens();
    }

    return null;
  }

  async function getValidAccessToken(): Promise<string> {
    if (DEBUG_POST) {
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
      const newAccounts = await getAccounts(accessToken);

      setAccounts(newAccounts);

      return newAccounts;
    } catch (err: unknown) {
      console.error("Token exchange error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to get facebook accounts: ${errMessage}`);

      setAccounts([]);

      return [];
    }
  }

  function authorize() {
    const authUrl = getAuthorizationUrl(credentials, getRedirectUri());
    window.open(authUrl, "_blank");
  }

  const [isHandlingAuth, setIsHandlingAuth] = useState(false);
  const [hasCompletedAuth, setHasCompletedAuth] = useState(false);

  async function handleAuthRedirect(searchParams: URLSearchParams) {
    try {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      console.log("code", code);
      console.log("state", state);

      if (code && state && shouldHandleAuthRedirect(code, state)) {
        setIsHandlingAuth(true);

        const newAuthorization = await exchangeCode(code);
        if (newAuthorization) {
          await initAccounts(newAuthorization.accessToken);
        }

        setHasCompletedAuth(true);
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
    videoUrl,
  }: Readonly<PostProps>): Promise<string | null> {
    if (!isEnabled || !isComplete || !isAuthorized || isPosting) {
      return null;
    }

    return await createPost({
      accessToken: await getAccountAccessToken(
        await getValidAccessToken(),
        userId,
      ),
      setIsPosting,
      setPostError,
      setPostProgress,
      setPostStatus,
      text,
      title,
      userId,
      videoUrl,
    });
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
    <FacebookContext.Provider value={providerValues}>
      {children}
    </FacebookContext.Provider>
  );
}
