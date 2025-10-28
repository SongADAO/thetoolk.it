"use client";

import { NeynarContextProvider, Theme } from "@neynar/react";
import { ReactNode, use, useMemo, useState } from "react";
import { SiFarcaster } from "react-icons/si";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/components/service/ServiceForm";
import { AuthContext } from "@/contexts/AuthContext";
import { useUserStorage } from "@/hooks/useUserStorage";
import {
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
} from "@/services/post/neynar/auth";
import { NeynarContext } from "@/services/post/neynar/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/neynar/post";
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

export function NeynarProvider({ children, mode }: Readonly<Props>) {
  const { loading: authLoading } = use(AuthContext);

  const id = "neynar";

  const label = "Farcaster";

  const brandColor = "farcaster";

  const icon = <SiFarcaster className="size-6" />;

  const hasAuthorizationStep = true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const loading =
    authLoading ||
    isEnabledLoading ||
    isCredentialsLoading ||
    isAuthorizationLoading ||
    isExpirationLoading ||
    isAccountsLoading;

  const hasHostedCredentials = false;

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

  async function authorize() {}

  function disconnect() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isHandlingAuth, setIsHandlingAuth] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasCompletedAuth, setHasCompletedAuth] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleAuthRedirect(searchParams: URLSearchParams) {}

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
    videoHSLUrl,
  }: Readonly<PostProps>): Promise<string | null> {
    if (!isEnabled || !isComplete || !isAuthorized || isPosting) {
      return null;
    }

    return await createPost({
      accessToken: mode === "hosted" ? "hosted" : authorization.accessToken,
      clientSecret: mode === "hosted" ? "hosted" : credentials.clientSecret,
      setIsPosting,
      setPostError,
      setPostProgress,
      setPostStatus,
      text,
      title,
      videoHSLUrl,
    });
  }

  const fields: ServiceFormField[] = [
    {
      label: "Client ID",
      name: "clientId",
      placeholder: "Client ID",
    },
    {
      label: "API Key",
      name: "clientSecret",
      placeholder: "API Key",
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

  const clientId =
    mode === "hosted" ? HOSTED_CREDENTIALS.clientId : credentials.clientId;

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
    <NeynarContext.Provider value={providerValues}>
      <NeynarContextProvider
        key={clientId}
        settings={{
          clientId,
          defaultTheme: Theme.Light,
          eventsCallbacks: {
            onAuthSuccess: ({ user }) => {
              console.log("onAuthSuccess");
              setAuthorization({
                accessToken: user.signer_uuid,
                refreshToken: user.signer_uuid,
              });
              setExpiration({
                accessTokenExpiresAt: new Date(
                  Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                refreshTokenExpiresAt: new Date(
                  Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
                ).toISOString(),
              });
              setAccounts([
                {
                  id: user.username,
                  username: user.username,
                },
              ]);
            },
            onSignout: () => () => {
              console.log("onSignout");
              setAuthorization(defaultOauthAuthorization);
              setExpiration(defaultOauthExpiration);
              setAccounts([]);
            },
          },
        }}
      >
        {children}
      </NeynarContextProvider>
    </NeynarContext.Provider>
  );
}
