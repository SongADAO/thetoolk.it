/* eslint-disable sort-keys */

import { FaYoutube } from "react-icons/fa6";

import type { ServiceConfig } from "@/services/post/ServiceConfig";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
} from "@/services/post/types";
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
} from "@/services/post/youtube/auth";
import { YoutubeContext } from "@/services/post/youtube/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/youtube/post";

export const youtubeProviderConfig: ServiceConfig = {
  id: "youtube",
  label: "YouTube",
  brandColor: "youtube",
  icon: <FaYoutube className="size-6" />,
  hasAuthorizationStep: true,
  hasHostedCredentials: false,
  fields: [
    {
      label: "Client ID",
      name: "clientId",
      placeholder: "Client ID",
    },
    {
      label: "Client Secret",
      name: "clientSecret",
      placeholder: "Client Secret",
    },
  ],
  Context: YoutubeContext,
  defaultAuthorization: defaultOauthAuthorization,
  defaultCredentials: defaultOauthCredentials,
  defaultExpiration: defaultOauthExpiration,
  authModule: {
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
  },
  postModule: {
    createPost,
    VIDEO_MAX_DURATION,
    VIDEO_MAX_FILESIZE,
    VIDEO_MIN_DURATION,
  },
};
