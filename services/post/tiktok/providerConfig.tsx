/* eslint-disable sort-keys */

import { FaTiktok } from "react-icons/fa6";

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
} from "@/services/post/tiktok/auth";
import { TiktokContext } from "@/services/post/tiktok/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/tiktok/post";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
  type OauthCredentials,
} from "@/services/post/types";

export const tiktokConfig: ServiceConfig<OauthCredentials> = {
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
  Context: TiktokContext,
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
