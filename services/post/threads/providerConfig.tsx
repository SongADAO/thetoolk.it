/* eslint-disable sort-keys */

import { FaThreads } from "react-icons/fa6";

import type { ServiceConfig } from "@/services/post/ServiceConfig";
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
} from "@/services/post/threads/auth";
import { ThreadsContext } from "@/services/post/threads/Context";
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
  type OauthCredentials,
} from "@/services/post/types";

export const threadsProviderConfig: ServiceConfig<OauthCredentials> = {
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
  Context: ThreadsContext,
  defaultCredentials: defaultOauthCredentials,
  defaultAuthorization: defaultOauthAuthorization,
  defaultExpiration: defaultOauthExpiration,
  authModule: {
    exchangeCodeForTokens,
    getAccounts,
    getAuthorizationUrl,
    getAuthorizationUrlHosted,
    getRedirectUri,
    hasCompleteAuthorization,
    hasCompleteCredentials,
    needsRefreshTokenRenewal,
    refreshAccessToken,
    refreshAccessTokenHosted,
    shouldHandleAuthRedirect,
    disconnectHosted,
    getCredentialsId,
    getAuthorizationExpiresAt,
  },
  postModule: {
    createPost,
    VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION,
  },
};
