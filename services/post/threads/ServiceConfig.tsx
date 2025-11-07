import { FaThreads } from "react-icons/fa6";

import type { ServiceConfig } from "@/services/post/ServiceConfig";
import {
  disconnectHosted,
  exchangeCodeForTokens,
  getAccounts,
  getAuthorizationExpiresAt,
  getAuthorizationUrl,
  getAuthorizationUrlHosted,
  getAuthorizeUrl,
  getCredentialsId,
  getRedirectUri,
  hasCompleteAuthorization,
  hasCompleteCredentials,
  HOSTED_CREDENTIALS,
  needsRefreshTokenRenewal,
  refreshAccessToken,
  refreshAccessTokenHosted,
  shouldHandleAuthCallback,
  shouldHandleAuthRedirect,
} from "@/services/post/threads/auth";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/threads/post";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
} from "@/services/post/types";

export const threadsServiceConfig: ServiceConfig = {
  /* eslint-disable sort-keys */
  id: "threads",
  label: "Threads",
  brandColor: "threads",
  icon: <FaThreads className="size-6" />,
  hasAuthorizationStep: true,
  hasHostedCredentials: false,
  fields: [
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
  ],
  authModule: {
    HOSTED_CREDENTIALS,
    disconnectHosted,
    exchangeCodeForTokens,
    getAccounts,
    getAuthorizationExpiresAt,
    getAuthorizationUrl,
    getAuthorizationUrlHosted,
    getAuthorizeUrl,
    getCredentialsId,
    getRedirectUri,
    hasCompleteAuthorization,
    hasCompleteCredentials,
    needsRefreshTokenRenewal,
    refreshAccessToken,
    refreshAccessTokenHosted,
    shouldHandleAuthCallback,
    shouldHandleAuthRedirect,
  },
  defaultAuthorization: defaultOauthAuthorization,
  defaultCredentials: defaultOauthCredentials,
  defaultExpiration: defaultOauthExpiration,
  postModule: {
    VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION,
    createPost,
  },
};
