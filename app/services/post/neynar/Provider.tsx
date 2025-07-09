"use client";

import { NeynarContextProvider, Theme } from "@neynar/react";
import { ReactNode, useMemo, useState } from "react";
import { SiFarcaster } from "react-icons/si";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import {
  // getAccounts,
  getAuthorizationExpiresAt,
  getCredentialsId,
  hasCompleteAuthorization,
  hasCompleteCredentials,
} from "@/app/services/post/neynar/auth";
import { NeynarContext } from "@/app/services/post/neynar/Context";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  type OauthAuthorization,
  type OauthCredentials,
  type ServiceAccount,
} from "@/app/services/post/types";

interface Props {
  children: ReactNode;
}

export function NeynarProvider({ children }: Readonly<Props>) {
  const label = "Farcaster";

  const brandColor = "neynar";

  const icon = <SiFarcaster className="size-6" />;

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

  // async function exchangeCode(): Promise<OauthAuthorization | null> {
  //   return null;
  // }

  // async function refreshTokens(): Promise<OauthAuthorization | null> {
  //   return null;
  // }

  // async function refreshTokensIfNeeded(): Promise<OauthAuthorization | null> {
  //   return null;
  // }

  // Get valid access token (refresh if needed)

  // async function getValidAccessToken(): Promise<string> {
  //   return "";
  // }

  // async function initAccounts(accessToken: string): Promise<ServiceAccount[]> {
  //   return [];
  // }

  async function authorize() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleAuthRedirect(searchParams: URLSearchParams) {}

  const fields: ServiceFormField[] = [
    {
      label: "Client ID",
      name: "clientId",
      placeholder: "Client ID",
    },
    // {
    //   label: "Client Secret",
    //   name: "clientSecret",
    //   placeholder: "Client Secret",
    // },
  ];

  const initial: ServiceFormState = {
    clientId: credentials.clientId,
    // clientSecret: credentials.clientSecret,
  };

  function saveData(formState: ServiceFormState): ServiceFormState {
    setCredentials({
      clientId: formState.clientId,
      // clientSecret: formState.clientSecret,
      clientSecret: "",
    });

    return formState;
  }

  // useEffect(() => {
  //   // eslint-disable-next-line @typescript-eslint/no-floating-promises
  //   refreshTokensIfNeeded();
  // }, [authorization.accessToken, isAuthorized]);

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
      label,
      saveData,
      setIsEnabled,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      accounts,
      authorization,
      brandColor,
      credentialsId,
      credentials,
      error,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      label,
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
                  accessToken: user.signer_uuid,
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
