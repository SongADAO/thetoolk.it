"use client";

import { ReactNode, use, useEffect, useMemo, useState } from "react";
import { FaBluesky } from "react-icons/fa6";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/components/service/ServiceForm";
import { DEBUG_POST } from "@/config/constants";
import { AuthContext } from "@/contexts/AuthContext";
import { useUserStorage } from "@/hooks/useUserStorage";
import {
  exchangeCodeForTokens,
  exchangeCodeForTokensHosted,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getAuthorizationUrlHosted,
  getCredentialsId,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  refreshAccessTokenHosted,
  shouldHandleAuthRedirect,
} from "@/services/post/bluesky/auth";
import { BlueskyContext } from "@/services/post/bluesky/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/bluesky/post";
import {
  type BlueskyCredentials,
  defaultBlueskyCredentials,
  defaultOauthAuthorization,
  type OauthAuthorization,
  type PostProps,
  type ServiceAccount,
} from "@/services/post/types";

interface Props {
  children: ReactNode;
}

export function BlueskyProvider({ children }: Readonly<Props>) {
  const { isAuthenticated, loading } = use(AuthContext);

  const metadataUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/client-metadata.json`;

  const label = "Bluesky";

  const brandColor = "bluesky";

  const icon = <FaBluesky className="size-6" />;

  const hasAuthorizationStep = true;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useUserStorage<boolean>(
    "thetoolkit-bluesky-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useUserStorage<BlueskyCredentials>(
    "thetoolkit-bluesky-credentials",
    defaultBlueskyCredentials,
    { initializeWithValue: false },
  );

  const [authorization, setAuthorization] = useUserStorage<OauthAuthorization>(
    "thetoolkit-bluesky-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: false },
  );

  const [accounts, setAccounts] = useUserStorage<ServiceAccount[]>(
    "thetoolkit-bluesky-accounts",
    [],
    { initializeWithValue: false },
  );

  const credentialsId = getCredentialsId(credentials);

  const isCompleteOwnCredentials = hasCompleteCredentials(credentials);

  const isComplete = isAuthenticated || isCompleteOwnCredentials;

  const isAuthorized = hasCompleteAuthorization(authorization);

  const authorizationExpiresAt = getAuthorizationExpiresAt(authorization);

  const isUsable = isEnabled && isComplete && isAuthorized;

  const mode = isAuthenticated ? "hosted" : "self";

  async function exchangeCode(code: string, iss: string, state: string) {
    try {
      if (mode === "hosted") {
        throw new Error("host");
        await exchangeCodeForTokensHosted(
          code,
          iss,
          state,
          getRedirectUri(),
          metadataUrl,
          codeVerifier,
          tokenEndpoint,
        );

        // TODO: pull access token dates and accounts from supabase
      } else {
        const newAuthorization = await exchangeCodeForTokens(
          code,
          iss,
          state,
          credentials,
        );
        setAuthorization(newAuthorization);

        const newAccounts = await getAccounts(
          credentials,
          newAuthorization.accessToken,
        );
        setAccounts(newAccounts);
      }

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

  async function refreshTokens() {
    try {
      if (mode === "hosted") {
        await refreshAccessTokenHosted(credentials);

        // TODO: pull access token dates from supabase
      } else {
        const newAuthorization = await refreshAccessToken(
          credentials,
          authorization,
        );

        setAuthorization(newAuthorization);
      }

      setError("");

      console.log("Access token refreshed successfully");
    } catch (err: unknown) {
      console.error("Token refresh error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to refresh token: ${errMessage}`);
    }
  }

  async function renewRefreshTokenIfNeeded() {
    if (needsRefreshTokenRenewal(authorization)) {
      console.log(`${label}: Refresh token will expire soon, refreshing...`);
      await refreshTokens();
    }
  }

  async function getValidAccessToken(): Promise<string> {
    try {
      if (DEBUG_POST) {
        return "test-token";
      }

      const newAuthorization = await refreshAccessToken(
        credentials,
        authorization,
      );

      setAuthorization(newAuthorization);

      setError("");

      return newAuthorization.accessToken;

      console.log("Access token refreshed successfully");
    } catch (err: unknown) {
      console.error("Token refresh error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to refresh token: ${errMessage}`);

      return "";
    }
  }

  async function authorize() {
    const authUrl =
      mode === "hosted"
        ? await getAuthorizationUrlHosted(credentials)
        : await getAuthorizationUrl(credentials);
    window.open(authUrl, "_blank");
  }

  const [isHandlingAuth, setIsHandlingAuth] = useState(false);
  const [hasCompletedAuth, setHasCompletedAuth] = useState(false);

  async function handleAuthRedirect(searchParams: URLSearchParams) {
    try {
      const code = searchParams.get("code");
      const iss = searchParams.get("iss");
      const state = searchParams.get("state");
      console.log("code", code);
      console.log("iss", iss);
      console.log("state", state);

      if (code && iss && state && shouldHandleAuthRedirect(code, iss)) {
        setIsHandlingAuth(true);

        await exchangeCode(code, iss, state);

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

  function resetPostState() {
    setIsPosting(false);
    setPostError("");
    setPostProgress(0);
    setPostStatus("");
  }

  async function post({
    title,
    text,
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
    if (loading) {
      // Wait for user data to load.
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    renewRefreshTokenIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorization.refreshTokenExpiresAt, loading]);

  const providerValues = useMemo(
    () => ({
      VIDEO_MAX_DURATION,
      VIDEO_MAX_FILESIZE,
      VIDEO_MIN_DURATION,
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
      isUsable,
      label,
      post,
      postError,
      postProgress,
      postStatus,
      resetPostState,
      saveData,
      setIsEnabled,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      VIDEO_MAX_DURATION,
      VIDEO_MAX_FILESIZE,
      VIDEO_MIN_DURATION,
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
      isUsable,
      label,
      postError,
      postProgress,
      postStatus,
      resetPostState,
    ],
  );

  return (
    <BlueskyContext.Provider value={providerValues}>
      {children}
    </BlueskyContext.Provider>
  );
}
