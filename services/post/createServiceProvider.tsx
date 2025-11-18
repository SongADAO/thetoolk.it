import { Context, ReactNode, use, useMemo, useState } from "react";

import type { ServiceFormState } from "@/components/service/ServiceForm";
import { DEBUG_POST } from "@/config/constants";
import { AuthContext } from "@/contexts/AuthContext";
import type { PostServiceContextType } from "@/services/post/PostServiceContext";
import type { ServiceConfig } from "@/services/post/ServiceConfig";
import type {
  OauthCredentials,
  PostServicePostProps,
} from "@/services/post/types";
import {
  useOAuthFlow,
  usePostingState,
  useServiceStorage,
  useTokenRefresh,
} from "@/services/post/useServiceHooks";

interface CreateServiceProviderProps {
  children: ReactNode;
  mode: "hosted" | "self";
}

/**
 * Factory function that creates a service provider component
 */
function createServiceProvider(
  configContext: Context<PostServiceContextType>,
  config: ServiceConfig,
) {
  return function ServiceProvider({
    children,
    mode,
  }: Readonly<CreateServiceProviderProps>) {
    const { loading: authLoading } = use(AuthContext);

    const [error, setError] = useState("");

    const storage = useServiceStorage(
      config.id,
      config.defaultCredentials,
      config.defaultAuthorization,
      config.defaultExpiration,
    );

    const oauth = useOAuthFlow(
      storage.credentials,
      storage.authorization,
      storage.expiration,
      storage.codeVerifier,
      mode,
      config.authModule,
      config.defaultAuthorization,
      config.defaultExpiration,
      storage.setAuthorization,
      storage.setExpiration,
      storage.setAccounts,
      setError,
    );

    useTokenRefresh(
      storage.expiration,
      storage.loading,
      authLoading,
      config.label,
      config.authModule.needsRefreshTokenRenewal,
      oauth.refreshTokens,
      setError,
    );

    const posting = usePostingState();

    const loading = Boolean(authLoading || storage.loading);

    const credentialsId = config.authModule.getCredentialsId(
      storage.credentials,
    );

    const isCompleteOwnCredentials = config.authModule.hasCompleteCredentials(
      storage.credentials,
    );

    const isHostedWithoutCredsComplete = Boolean(
      mode === "hosted" && !config.hasHostedCredentials,
    );

    const isHostedWithCredsComplete = Boolean(
      mode === "hosted" &&
        config.hasHostedCredentials &&
        isCompleteOwnCredentials,
    );

    const isSelfComplete = Boolean(mode === "self" && isCompleteOwnCredentials);

    const isComplete = Boolean(
      isHostedWithoutCredsComplete ||
        isHostedWithCredsComplete ||
        isSelfComplete,
    );

    const isAuthorized = config.authModule.hasCompleteAuthorization(
      storage.expiration,
    );

    const authorizationExpiresAt = config.authModule.getAuthorizationExpiresAt(
      storage.expiration,
    );

    const isUsable = Boolean(storage.isEnabled && isComplete && isAuthorized);

    // Helper functions
    async function getValidAccessToken(): Promise<string> {
      if (DEBUG_POST) {
        return "test-token";
      }

      const newAuthorization = await oauth.refreshTokens();

      return newAuthorization.accessToken;
    }

    async function post({
      options,
      privacy,
      text,
      title,
      userId,
      video,
      videoHSLUrl,
      videoUrl,
    }: Readonly<PostServicePostProps>): Promise<string | null> {
      if (
        !storage.isEnabled ||
        !isComplete ||
        !isAuthorized ||
        posting.isProcessing
      ) {
        return null;
      }

      try {
        const accessToken = await getValidAccessToken();

        return await config.postModule.createPost({
          accessToken: mode === "hosted" ? "hosted" : accessToken,
          credentials: storage.credentials,
          options,
          privacy,
          requestUrl: window.location.origin,
          setIsProcessing: posting.setIsProcessing,
          setProcessError: posting.setProcessError,
          setProcessProgress: posting.setProcessProgress,
          setProcessStatus: posting.setProcessStatus,
          text,
          title,
          userId,
          video,
          videoHSLUrl,
          videoUrl,
        });
      } catch (err: unknown) {
        console.error("Post error:", err);
        const errMessage =
          err instanceof Error ? err.message : "unspecified error";
        posting.setProcessError(`Post failed: ${errMessage}`);
        posting.setProcessStatus("Post failed");
        posting.setProcessProgress(0);
        posting.setIsProcessing(false);
      }

      return null;
    }

    function isCredentialKey(key: string): key is keyof OauthCredentials {
      return key in storage.credentials;
    }

    const initial: ServiceFormState = config.fields.reduce<ServiceFormState>(
      (acc, field) => {
        if (isCredentialKey(field.name)) {
          acc[field.name] = storage.credentials[field.name];
        }
        return acc;
      },
      {},
    );

    function saveData(formState: ServiceFormState): ServiceFormState {
      const updatedCredentials = { ...storage.credentials };

      config.fields.forEach((field) => {
        if (isCredentialKey(field.name)) {
          updatedCredentials[field.name] = formState[field.name];
        }
      });

      storage.setCredentials(updatedCredentials);

      return formState;
    }

    async function authorize() {
      await oauth.authorize(storage.setCodeVerifier);
    }

    async function handleAuthRedirect(searchParams: URLSearchParams) {
      await oauth.handleAuthRedirect(
        searchParams,
        config.authModule.shouldHandleAuthRedirect,
      );
    }

    const providerValues = useMemo(
      () => ({
        VIDEO_MAX_DURATION: config.postModule.VIDEO_MAX_DURATION,
        VIDEO_MAX_FILESIZE: config.postModule.VIDEO_MAX_FILESIZE,
        VIDEO_MIN_DURATION: config.postModule.VIDEO_MIN_DURATION,
        accounts: storage.accounts,
        authorizationExpiresAt,
        authorize,
        brandColor: config.brandColor,
        credentialsId,
        disconnect: oauth.disconnect,
        error,
        fields: config.fields,
        handleAuthRedirect,
        hasAuthorizationStep: config.hasAuthorizationStep,
        hasCompletedAuth: oauth.hasCompletedAuth,
        hasHostedCredentials: config.hasHostedCredentials,
        icon: config.icon,
        id: config.id,
        initial,
        isAuthorized,
        isComplete,
        isEnabled: storage.isEnabled,
        isHandlingAuth: oauth.isHandlingAuth,
        isProcessing: posting.isProcessing,
        isUsable,
        label: config.label,
        loading,
        mode,
        post,
        processError: posting.processError,
        processProgress: posting.processProgress,
        processStatus: posting.processStatus,
        resetProcessState: posting.resetProcessState,
        saveData,
        setIsEnabled: storage.setIsEnabled,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        config.brandColor,
        config.hasAuthorizationStep,
        config.hasHostedCredentials,
        config.icon,
        config.label,
        config.postModule.VIDEO_MAX_DURATION,
        config.postModule.VIDEO_MAX_FILESIZE,
        config.postModule.VIDEO_MIN_DURATION,
        credentialsId,
        error,
        initial,
        isAuthorized,
        isComplete,
        isUsable,
        loading,
        oauth.disconnect,
        oauth.hasCompletedAuth,
        oauth.isHandlingAuth,
        posting.isProcessing,
        posting.processError,
        posting.processProgress,
        posting.processStatus,
        posting.resetProcessState,
        storage.accounts,
        storage.authorization,
        storage.credentials,
        storage.isEnabled,
      ],
    );

    return (
      <configContext.Provider value={providerValues}>
        {children}
      </configContext.Provider>
    );
  };
}

export { createServiceProvider };
