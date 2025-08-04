"use client";

import { NeynarContextProvider, Theme } from "@neynar/react";
import { ReactNode, useMemo, useState } from "react";
import { SiFarcaster } from "react-icons/si";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/components/service/ServiceForm";
import {
  // getAccounts,
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
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
  type OauthAuthorization,
  type OauthCredentials,
  type PostProps,
  type ServiceAccount,
} from "@/services/post/types";

interface Props {
  children: ReactNode;
}

export function NeynarProvider({ children }: Readonly<Props>) {
  const label = "Farcaster";

  const brandColor = "farcaster";

  const icon = <SiFarcaster className="size-6" />;

  const hasAuthorizationStep = true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-neynar-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<OauthCredentials>(
    "thetoolkit-neynar-credentials",
    defaultOauthCredentials,
    { initializeWithValue: true },
  );

  const [authorization, setAuthorization] = useLocalStorage<OauthAuthorization>(
    "thetoolkit-neynar-authorization",
    defaultOauthAuthorization,
    { initializeWithValue: true },
  );

  const [accounts, setAccounts] = useLocalStorage<ServiceAccount[]>(
    "thetoolkit-neynar-accounts",
    [],
    { initializeWithValue: true },
  );

  const credentialsId = getCredentialsId(credentials);

  const isComplete = hasCompleteCredentials(credentials);

  const isAuthorized = hasCompleteAuthorization(authorization);

  const authorizationExpiresAt = getAuthorizationExpiresAt(authorization);

  const isUsable = isEnabled && isComplete && isAuthorized;

  async function authorize() {}

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
    userId,
    videoHSLUrl,
  }: Readonly<PostProps>): Promise<string | null> {
    if (!isEnabled || !isComplete || !isAuthorized || isPosting) {
      return null;
    }

    return await createPost({
      credentials,
      setIsPosting,
      setPostError,
      setPostProgress,
      setPostStatus,
      text,
      title,
      userId,
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

  // useEffect(() => {
  //   // eslint-disable-next-line @typescript-eslint/no-floating-promises
  //   renewRefreshTokenIfNeeded();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [authorization.refreshTokenExpiresAt]);

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
    <NeynarContext.Provider value={providerValues}>
      <NeynarContextProvider
        key={credentials.clientId}
        settings={{
          clientId: credentials.clientId,
          defaultTheme: Theme.Light,
          eventsCallbacks: {
            onAuthSuccess: ({ user }) => {
              console.log("onAuthSuccess");
              setAuthorization({
                accessToken: user.signer_uuid,
                accessTokenExpiresAt: new Date(
                  Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                refreshToken: user.signer_uuid,
                refreshTokenExpiresAt: new Date(
                  Date.now() + 100 * 365 * 24 * 60 * 60 * 1000,
                ).toISOString(),
              });
              setAccounts([
                {
                  id: user.signer_uuid,
                  username: user.username,
                },
              ]);
            },
            onSignout: () => () => {
              console.log("onSignout");
              setAuthorization(defaultOauthAuthorization);
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
