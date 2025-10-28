/* eslint-disable sort-keys */

import { FaFacebook } from "react-icons/fa6";

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
} from "@/services/post/facebook/auth";
import { FacebookContext } from "@/services/post/facebook/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/facebook/post";
import type { ServiceConfig } from "@/services/post/ServiceConfig";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
} from "@/services/post/types";

export const facebookProviderConfig: ServiceConfig = {
  id: "facebook",
  label: "Facebook",
  brandColor: "facebook",
  icon: <FaFacebook className="size-6" />,
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
  Context: FacebookContext,
  defaultCredentials: defaultOauthCredentials,
  defaultAuthorization: defaultOauthAuthorization,
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
