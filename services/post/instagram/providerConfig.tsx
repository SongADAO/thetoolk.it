/* eslint-disable sort-keys */

import { FaInstagram } from "react-icons/fa6";

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
} from "@/services/post/instagram/auth";
import { InstagramContext } from "@/services/post/instagram/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/instagram/post";
import type { ServiceConfig } from "@/services/post/ServiceConfig";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
  type OauthCredentials,
} from "@/services/post/types";

const providerConfig: ServiceConfig<OauthCredentials> = {
  id: "instagram",
  label: "Instagram",
  brandColor: "instagram",
  icon: <FaInstagram className="size-6" />,
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
  Context: InstagramContext,
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

export { providerConfig };
