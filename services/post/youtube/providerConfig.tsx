/* eslint-disable sort-keys */

import { FaYoutube } from "react-icons/fa6";

import type { ServiceConfig } from "@/services/post/ServiceConfig";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
  type OauthCredentials,
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

export const youtubeProviderConfig: ServiceConfig<OauthCredentials> = {
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
