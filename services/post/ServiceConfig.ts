import { Context, ReactNode } from "react";

import type { ServiceFormField } from "@/components/service/ServiceForm";
import type { PostServiceContextType } from "@/services/post/PostServiceContext";
import type {
  CreatePostProps,
  OauthAuthorization,
  OauthAuthorizationAndExpiration,
  OauthCredentials,
  OauthExpiration,
  ServiceAccount,
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

  // Context
  Context: Context<PostServiceContextType>;

  // Default values
  defaultCredentials: OauthCredentials;
  defaultAuthorization: OauthAuthorization;
  defaultExpiration: OauthExpiration;

  // Auth module functions
  authModule: {
    disconnectHosted: () => Promise<OauthAuthorization>;
    exchangeCodeForTokens: (
      code: string,
      iss: string,
      state: string,
      redirectUri: string,
      codeVerifier: string,
      credentials: OauthCredentials,
      requestUrl: string,
      mode: "hosted" | "self",
    ) => Promise<OauthAuthorizationAndExpiration>;
    getAccounts: (
      credentials: OauthCredentials,
      token: string,
      requestUrl: string,
      mode: "hosted" | "self",
    ) => Promise<ServiceAccount[]>;
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
      clientId: string,
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
      mode: "hosted" | "self",
    ) => Promise<OauthAuthorizationAndExpiration>;
    refreshAccessTokenHosted: () => Promise<OauthAuthorization>;
    shouldHandleAuthRedirect: (searchParams: URLSearchParams) => boolean;
  };

  // Post module
  postModule: {
    createPost: (props: CreatePostProps) => Promise<string | null>;
    VIDEO_MAX_DURATION: number;
    VIDEO_MAX_FILESIZE: number;
    VIDEO_MIN_DURATION: number;
  };
}

export type { ServiceConfig };
