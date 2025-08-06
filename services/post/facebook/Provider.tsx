"use client";

import { ReactNode, use, useEffect, useMemo, useState } from "react";
import { FaFacebook } from "react-icons/fa6";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/components/service/ServiceForm";
import { DEBUG_POST } from "@/config/constants";
import { AuthContext } from "@/contexts/AuthContext";
import { useUserStorage } from "@/hooks/useUserStorage";
import {
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getCredentialsId,
  getRedirectUri,
  getRedirectUriHosted,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  refreshAccessTokenHosted,
  shouldHandleAuthRedirect,
} from "@/services/post/facebook/auth";
import { FacebookContext } from "@/services/post/facebook/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/facebook/post";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  type OauthAuthorization,
  type OauthCredentials,
  type PostProps,
  type ServiceAccount,
} from "@/services/post/types";

interface Props {
  children: ReactNode;
}

export function FacebookProvider({ children }: Readonly<Props>) {
  const { isAuthenticated, loading } = use(AuthContext);

  const label = "Facebook";

  const brandColor = "facebook";

  const icon = <FaFacebook className="size-6" />;

  const hasAuthorizationStep = true;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useUserStorage<boolean>(
    "thetoolkit-facebook-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useUserStorage<OauthCredentials>(
    "thetoolkit-facebook-credentials",
    defaultOauthCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useUserStorage<OauthAuthorization>(
    "thetoolkit-facebook-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: true },
  );

  const [accounts, setAccounts] = useUserStorage<ServiceAccount[]>(
    "thetoolkit-facebook-accounts",
    [],
    { initializeWithValue: true },
  );

  const credentialsId = getCredentialsId(credentials);

  const isCompleteOwnCredentials = hasCompleteCredentials(credentials);

  const isComplete = isAuthenticated || isCompleteOwnCredentials;

  const isAuthorized = hasCompleteAuthorization(authorization);

  const authorizationExpiresAt = getAuthorizationExpiresAt(authorization);

  const isUsable = isEnabled && isComplete && isAuthorized;

  const mode = isAuthenticated ? "hosted" : "self";

  async function exchangeCode(code: string) {
    try {
      const newAuthorization = await exchangeCodeForTokens(
        code,
        getRedirectUri(),
        credentials,
      );
      setAuthorization(newAuthorization);

      const newAccounts = await getAccounts(newAuthorization.accessToken);
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

    const newAuthorization = await refreshAccessToken(authorization);

    setAuthorization(newAuthorization);

    console.log("Access token refreshed successfully");

    return newAuthorization;
  }

  async function renewRefreshTokenIfNeeded() {
    try {
      setError("");

      if (needsRefreshTokenRenewal(authorization)) {
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

  function authorize() {
    const authUrl =
      mode === "hosted"
        ? getAuthorizationUrl(
            HOSTED_CREDENTIALS.clientId,
            getRedirectUriHosted(),
          )
        : getAuthorizationUrl(credentials.clientId, getRedirectUri());

    window.open(authUrl, "_blank");
  }

  const [isHandlingAuth, setIsHandlingAuth] = useState(false);
  const [hasCompletedAuth, setHasCompletedAuth] = useState(false);

  async function handleAuthRedirect(searchParams: URLSearchParams) {
    try {
      if (shouldHandleAuthRedirect(searchParams)) {
        setIsHandlingAuth(true);

        await exchangeCode(searchParams.get("code") ?? "");

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
    userId,
    videoUrl,
  }: Readonly<PostProps>): Promise<string | null> {
    if (!isEnabled || !isComplete || !isAuthorized || isPosting) {
      return null;
    }

    try {
      const accessToken = await getValidAccessToken();

      return await createPost({
        accessToken: mode === "hosted" ? "hosted" : accessToken,
        setIsPosting,
        setPostError,
        setPostProgress,
        setPostStatus,
        text,
        title,
        userId,
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
    <FacebookContext.Provider value={providerValues}>
      {children}
    </FacebookContext.Provider>
  );
}
