/* eslint-disable sort-keys */

import { FaTwitter } from "react-icons/fa6";

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
} from "@/services/post/twitter/auth";
import { TwitterContext } from "@/services/post/twitter/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/twitter/post";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
} from "@/services/post/types";

export const twitterProviderConfig: ServiceConfig = {
  id: "twitter",
  label: "Twitter",
  brandColor: "twitter",
  icon: <FaTwitter className="size-6" />,
  hasAuthorizationStep: true,
  hasHostedCredentials: false,
  fields: [
    {
      label: "OAuth 2.0 Client ID",
      name: "clientId",
      placeholder: "OAuth 2.0 Client ID",
    },
    {
      label: "OAuth 2.0 Client Secret",
      name: "clientSecret",
      placeholder: "OAuth 2.0 Client Secret",
    },
  ],
  Context: TwitterContext,
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
