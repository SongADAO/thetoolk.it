import { FaBluesky } from "react-icons/fa6";

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
  shouldHandleAuthRedirect,
} from "@/services/post/bluesky/auth";
import { BlueskyContext } from "@/services/post/bluesky/Context";
import {
  createPost,
  VIDEO_MAX_DURATION,
  VIDEO_MAX_FILESIZE,
  VIDEO_MIN_DURATION,
} from "@/services/post/bluesky/post";
import type { ServiceConfig } from "@/services/post/ServiceConfig";
import {
  defaultOauthAuthorization,
  defaultOauthCredentials,
  defaultOauthExpiration,
} from "@/services/post/types";

export const blueskyProviderConfig: ServiceConfig = {
  /* eslint-disable sort-keys */
  id: "bluesky",
  label: "Bluesky",
  brandColor: "bluesky",
  icon: <FaBluesky className="size-6" />,
  hasAuthorizationStep: true,
  hasHostedCredentials: true,
  fields: [
    {
      label: "Service URL",
      name: "serviceUrl",
      placeholder: "https://bsky.social",
    },
    {
      label: "Username",
      name: "username",
      placeholder: "johndoe.bsky.social",
    },
  ],
  Context: BlueskyContext,
  /* eslint-enable sort-keys */
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
