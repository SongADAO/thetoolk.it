import { Context, ReactNode } from "react";

import type { ServiceFormField } from "@/components/service/ServiceForm";
import type { PostServiceContextType } from "@/services/post/PostServiceContext";

interface ServiceConfig<TCredentials> {
  // Identity
  id: string;
  label: string;
  brandColor: string;
  icon: ReactNode;

  // Features
  hasAuthorizationStep: boolean;
  hasHostedCredentials: boolean;

  // Form fields
  fields: ServiceFormField[];

  // Context
  Context: Context<PostServiceContextType>;

  // Default values
  defaultCredentials: TCredentials;
  defaultAuthorization: any;
  defaultExpiration: any;

  // Auth module functions
  authModule: {
    exchangeCodeForTokens: any;
    getAccounts: any;
    getAuthorizationUrl: any;
    getAuthorizationUrlHosted: any;
    getRedirectUri: any;
    hasCompleteAuthorization: any;
    hasCompleteCredentials: any;
    needsRefreshTokenRenewal: any;
    refreshAccessToken: any;
    refreshAccessTokenHosted: any;
    shouldHandleAuthRedirect: any;
    disconnectHosted: any;
    getCredentialsId: any;
    getAuthorizationExpiresAt: any;
  };

  // Post module
  postModule: {
    createPost: any;
    VIDEO_MAX_DURATION: number;
    VIDEO_MAX_FILESIZE: number;
    VIDEO_MIN_DURATION: number;
  };
}

export type { ServiceConfig };
