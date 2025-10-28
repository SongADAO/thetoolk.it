"use client";

import { ReactNode, use, useEffect, useMemo, useState } from "react";
import { FaInstagram } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

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
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  refreshAccessTokenHosted,
  shouldHandleAuthRedirect,
} from "@/services/post/instagram/auth";
import { InstagramContext } from "@/services/post/instagram/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/instagram/post";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
  type OauthAuthorization,
  type OauthCredentials,
  type OauthExpiration,
  type PostProps,
  type ServiceAccount,
} from "@/services/post/types";

interface Props {
  children: ReactNode;
  mode: string;
}

export function InstagramProvider({ children, mode }: Readonly<Props>) {
  const { loading: authLoading } = use(AuthContext);

  const id = "instagram";

  const label = "Instagram";

  const brandColor = "instagram";

  const icon = <FaInstagram className="size-6" />;

  const hasAuthorizationStep = true;

  const hasHostedCredentials = false;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled, isEnabledLoading] = useUserStorage<boolean>(
    `thetoolkit-${id}-enabled`,
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials, isCredentialsLoading] =
    useUserStorage<OauthCredentials>(
      `thetoolkit-${id}-credentials`,
      defaultOauthCredentials,
      { initializeWithValue: true },
    );

  const [authorization, setAuthorization, isAuthorizationLoading] =
    useUserStorage<OauthAuthorization>(
      `thetoolkit-${id}-authorization`,
      defaultOauthAuthorization,
      { initializeWithValue: true },
    );

  const [expiration, setExpiration, isExpirationLoading] =
    useUserStorage<OauthExpiration>(
      `thetoolkit-${id}-expiration`,
      defaultOauthExpiration,
      { initializeWithValue: false },
    );

  const [accounts, setAccounts, isAccountsLoading] = useUserStorage<
    ServiceAccount[]
  >(`thetoolkit-${id}-accounts`, [], { initializeWithValue: true });

  const [codeVerifier, setCodeVerifier] = useLocalStorage<string>(
    `thetoolkit-${id}-code-verifier`,
    "",
    { initializeWithValue: true },
  );

  const loading =
    authLoading ||
    isEnabledLoading ||
    isCredentialsLoading ||
    isAuthorizationLoading ||
    isExpirationLoading ||
    isAccountsLoading;

  const credentialsId = getCredentialsId(credentials);

  const isCompleteOwnCredentials = hasCompleteCredentials(credentials);

  const isComplete =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (mode === "hosted" && !hasHostedCredentials) ||
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (mode === "hosted" && hasHostedCredentials && isCompleteOwnCredentials) ||
    (mode === "self" && isCompleteOwnCredentials);

  const isAuthorized = hasCompleteAuthorization(expiration);

  const authorizationExpiresAt = getAuthorizationExpiresAt(expiration);

  const isUsable = isEnabled && isComplete && isAuthorized;

  async function exchangeCode(code: string, state: string) {
    try {
      const newAuthorization = await exchangeCodeForTokens(
        code,
        state,
        getRedirectUri(),
        codeVerifier,
        credentials,
        "self",
      );
      setAuthorization(newAuthorization.authorization);
      setExpiration(newAuthorization.expiration);

      const newAccounts = await getAccounts(
        newAuthorization.authorization.accessToken,
        "self",
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
      authorization,
      credentials,
      expiration,
      "self",
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
        ? await getAuthorizationUrlHosted()
        : await getAuthorizationUrl(
            credentials.clientId,
            getRedirectUri(),
            setCodeVerifier,
          );

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
    userId,
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
  }, [expiration.refreshTokenExpiresAt, loading]);

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
      disconnect,
      error,
      fields,
      handleAuthRedirect,
      hasAuthorizationStep,
      hasCompletedAuth,
      hasHostedCredentials,
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
      mode,
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
      hasAuthorizationStep,
      hasCompletedAuth,
      hasHostedCredentials,
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
    <InstagramContext.Provider value={providerValues}>
      {children}
    </InstagramContext.Provider>
  );
}
