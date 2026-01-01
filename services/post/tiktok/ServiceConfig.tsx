import { FaTiktok } from "react-icons/fa6";

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
} from "@/services/post/tiktok/auth";
import {
  createPost,
  TEXT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/tiktok/post";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
} from "@/services/post/types";

export const tiktokServiceConfig: ServiceConfig = {
  /* eslint-disable sort-keys */
  id: "tiktok",
  label: "Tiktok",
  brandColor: "tiktok",
  icon: <FaTiktok className="size-6" />,
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
    TEXT_MAX_LENGTH,
    TITLE_MAX_LENGTH,
    VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION,
    createPost,
  },
};
