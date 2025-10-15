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
  disconnectHosted,
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getAuthorizationUrlHosted,
  getCredentialsId,
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
  defaultOauthExpiration,
  type OauthAuthorization,
  type OauthExpiration,
  type PostProps,
  type ServiceAccount,
} from "@/services/post/types";

interface Props {
  children: ReactNode;
}

export function BlueskyProvider({ children }: Readonly<Props>) {
  const { isAuthenticated, loading: authLoading } = use(AuthContext);

  const label = "Bluesky";

  const brandColor = "bluesky";

  const icon = <FaBluesky className="size-6" />;

  const hasAuthorizationStep = true;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled, isEnabledLoading] = useUserStorage<boolean>(
    "thetoolkit-bluesky-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials, isCredentialsLoading] =
    useUserStorage<BlueskyCredentials>(
      "thetoolkit-bluesky-credentials",
      defaultBlueskyCredentials,
      { initializeWithValue: false },
    );

  const [authorization, setAuthorization, isAuthorizationLoading] =
    useUserStorage<OauthAuthorization>(
      "thetoolkit-bluesky-authorization",
      defaultOauthAuthorization,
      { initializeWithValue: false },
    );

  const [expiration, setExpiration, isExpirationLoading] =
    useUserStorage<OauthExpiration>(
      "thetoolkit-bluesky-expiration",
      defaultOauthExpiration,
      { initializeWithValue: false },
    );

  const [accounts, setAccounts, isAccountsLoading] = useUserStorage<
    ServiceAccount[]
  >("thetoolkit-bluesky-accounts", [], { initializeWithValue: false });

  const loading =
    authLoading ||
    isEnabledLoading ||
    isCredentialsLoading ||
    isAuthorizationLoading ||
    isExpirationLoading ||
    isAccountsLoading;

  const hasAuthenticatedCredentials = true;

  const credentialsId = getCredentialsId(credentials);

  const isCompleteOwnCredentials = hasCompleteCredentials(credentials);

  // const isComplete = isAuthenticated || isCompleteOwnCredentials;
  const isComplete = isCompleteOwnCredentials;

  const isAuthorized = hasCompleteAuthorization(expiration);

  const authorizationExpiresAt = getAuthorizationExpiresAt(expiration);

  const isUsable = isEnabled && isComplete && isAuthorized;

  const mode = isAuthenticated ? "hosted" : "self";

  async function exchangeCode(code: string, iss: string, state: string) {
    try {
      const newAuthorization = await exchangeCodeForTokens(
        code,
        iss,
        state,
        credentials,
        window.location.origin,
      );
      setAuthorization(newAuthorization.authorization);
      setExpiration(newAuthorization.expiration);

      const newAccounts = await getAccounts(
        credentials,
        newAuthorization.authorization.accessToken,
        window.location.origin,
      );
      setAccounts(newAccounts);

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

  async function refreshTokens(): Promise<OauthAuthorization> {
    if (mode === "hosted") {
      await refreshAccessTokenHosted();

      console.log("Access token refreshed successfully");

      // TODO: pull access token dates from supabase

      return authorization;
    }

    const newAuthorization = await refreshAccessToken(
      credentials,
      authorization,
      window.location.origin,
    );

    setAuthorization(newAuthorization.authorization);
    setExpiration(newAuthorization.expiration);

    console.log("Access token refreshed successfully");

    return newAuthorization.authorization;
  }

  async function renewRefreshTokenIfNeeded() {
    try {
      setError("");

      if (needsRefreshTokenRenewal(expiration)) {
        console.log(`${label}: Refresh token will expire soon, refreshing...`);

        await refreshTokens();
      }
    } catch (err: unknown) {
      console.error("Token refresh error:", err);

      const errMessage = err instanceof Error ? err.message : "Unknown error";

      setError(`Failed to auto refresh token: ${errMessage}`);
      // Ignore errors here, will be surfaced when trying to post.
    }
  }

  async function getValidAccessToken(): Promise<string> {
    if (DEBUG_POST) {
      return "test-token";
    }

    const newAuthorization = await refreshTokens();

    return newAuthorization.accessToken;
  }

  async function authorize() {
    const authUrl =
      mode === "hosted"
        ? await getAuthorizationUrlHosted(credentials)
        : await getAuthorizationUrl(credentials, window.location.origin);
    window.open(authUrl, "_blank");
  }

  async function disconnect() {
    setExpiration(defaultOauthExpiration);
    setAccounts([]);
    if (mode === "hosted") {
      await disconnectHosted();
    } else {
      setAuthorization(defaultOauthAuthorization);
    }
  }

  const [isHandlingAuth, setIsHandlingAuth] = useState(false);
  const [hasCompletedAuth, setHasCompletedAuth] = useState(false);

  async function handleAuthRedirect(searchParams: URLSearchParams) {
    try {
      if (shouldHandleAuthRedirect(searchParams)) {
        setIsHandlingAuth(true);

        await exchangeCode(
          searchParams.get("code") ?? "",
          searchParams.get("iss") ?? "",
          searchParams.get("state") ?? "",
        );

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
    videoUrl,
  }: Readonly<PostProps>): Promise<string | null> {
    if (!isEnabled || !isComplete || !isAuthorized || isPosting) {
      return null;
    }

    try {
      const accessToken = await getValidAccessToken();

      return await createPost({
        accessToken: mode === "hosted" ? "hosted" : accessToken,
        credentials,
        requestUrl: window.location.origin,
        setIsPosting,
        setPostError,
        setPostProgress,
        setPostStatus,
        text,
        title,
        video,
        videoUrl,
      });
    } catch (err: unknown) {
      console.error("Post error:", err);
      const errMessage =
        err instanceof Error ? err.message : "unspecified error";
      setPostError(`Post failed: ${errMessage}`);
      setPostStatus("Post failed");
      setPostProgress(0);
      setIsPosting(false);
    }

    return null;
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
  ];

  const initial: ServiceFormState = {
    serviceUrl: credentials.serviceUrl,
    username: credentials.username,
  };

  function saveData(formState: ServiceFormState): ServiceFormState {
    setCredentials({
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
  }, [expiration.refreshTokenExpiresAt, loading]);

  const providerValues = useMemo(
    () => ({
      VIDEO_MAX_DURATION,
      VIDEO_MAX_FILESIZE,
      accounts,
      authorizationExpiresAt,
      authorize,
      brandColor,
      credentialsId,
      disconnect,
      error,
      fields,
      handleAuthRedirect,
      hasAuthenticatedCredentials,
      hasAuthorizationStep,
      hasCompletedAuth,
      icon,
      VIDEO_MIN_DURATION,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isHandlingAuth,
      isPosting,
      isUsable,
      label,
      loading,
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
      disconnect,
      error,
      hasAuthenticatedCredentials,
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
      loading,
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
