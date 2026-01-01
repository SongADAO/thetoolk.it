import { ReactNode } from "react";

import type { ServiceFormField } from "@/components/service/ServiceForm";
import type {
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthCredentials,
  OauthExpiration,
  PostServiceAccount,
  PostServiceCreatePostProps,
} from "@/services/post/types";

interface ServiceConfig {
  // Identity
  id: string;
  label: string;
  brandColor: string;
  icon: ReactNode;

  // Features
  hasAuthorizationStep: boolean;
  hasHostedCredentials: boolean;

  // Form fields
  fields: ServiceFormField[];

  // Default values
  defaultCredentials: OauthCredentials;
  defaultAuthorization: OauthAuthorization;
  defaultExpiration: OauthExpiration;

  // Auth module functions
  authModule: {
    HOSTED_CREDENTIALS: OauthCredentials;
    disconnectHosted: () => Promise<OauthAuthorization>;
    exchangeCodeForTokens: (
      code: string,
      iss: string,
      state: string,
      redirectUri: string,
      codeVerifier: string,
      credentials: OauthCredentials,
      requestUrl: string,
      mode: "server" | "browser",
    ) => Promise<OauthAuthorizationAndExpiration>;
    getAccounts: (
      credentials: OauthCredentials,
      token: string,
      requestUrl: string,
      mode: "server" | "browser",
    ) => Promise<PostServiceAccount[]>;
    getAuthorizationExpiresAt: (expiration: OauthExpiration) => string;
    getAuthorizationUrl: (
      credentials: OauthCredentials,
      redirectUri: string,
      setCodeVerifier: (codeVerifier: string) => void,
      requestUrl: string,
    ) => Promise<string>;
    getAuthorizationUrlHosted: (
      credentials: OauthCredentials,
    ) => Promise<string>;
    getAuthorizeUrl: (
      credentials: OauthCredentials,
      redirectUri: string,
      codeChallenge: string,
    ) => string;
    getCredentialsId: (credentials: OauthCredentials) => string;
    getRedirectUri: () => string;
    hasCompleteAuthorization: (expiration: OauthExpiration) => boolean;
    hasCompleteCredentials: (credentials: OauthCredentials) => boolean;
    needsRefreshTokenRenewal: (expiration: OauthExpiration) => boolean;
    refreshAccessToken: (
      authorization: OauthAuthorization,
      credentials: OauthCredentials,
      expiration: OauthExpiration,
      requestUrl: string,
      mode: "server" | "browser",
    ) => Promise<OauthAuthorizationAndExpiration>;
    refreshAccessTokenHosted: () => Promise<OauthAuthorization>;
    shouldHandleAuthCallback: (searchParams: URLSearchParams) => boolean;
    shouldHandleAuthRedirect: (searchParams: URLSearchParams) => boolean;
  };

  // Post module
  postModule: {
    createPost: (props: PostServiceCreatePostProps) => Promise<string | null>;
    TEXT_MAX_LENGTH: number;
    TITLE_MAX_LENGTH: number;
    VIDEO_MAX_DURATION: number;
    VIDEO_MAX_FILESIZE: number;
    VIDEO_MIN_DURATION: number;
  };
}

export type { ServiceConfig };
