import { ReactNode, use, useMemo, useState } from "react";

import type { ServiceFormState } from "@/components/service/ServiceForm";
import { DEBUG_POST } from "@/config/constants";
import { AuthContext } from "@/contexts/AuthContext";
import type { ServiceConfig } from "@/services/post/ServiceConfig";
import type { OauthCredentials, PostProps } from "@/services/post/types";
import {
  useOAuthFlow,
  usePostingState,
  useServiceStorage,
  useTokenRefresh,
} from "@/services/post/useServiceHooks";

interface CreateServiceProviderProps {
  children: ReactNode;
  mode: string;
}

/**
 * Factory function that creates a service provider component
 */
function createServiceProvider(config: ServiceConfig) {
  return function ServiceProvider({
    children,
    mode,
  }: Readonly<CreateServiceProviderProps>) {
    const { loading: authLoading } = use(AuthContext);

    // State management
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

    // Computed values
    const loading = authLoading || storage.loading;

    const credentialsId = config.authModule.getCredentialsId(
      storage.credentials,
    );

    const isCompleteOwnCredentials = config.authModule.hasCompleteCredentials(
      storage.credentials,
    );

    const isHostedWithoutCredsComplete =
      mode === "hosted" && !config.hasHostedCredentials;

    const isHostedWithCredsComplete =
      mode === "hosted" &&
      config.hasHostedCredentials &&
      isCompleteOwnCredentials;

    const isSelfComplete = mode === "self" && isCompleteOwnCredentials;

    const isComplete =
      isHostedWithoutCredsComplete ||
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      isHostedWithCredsComplete ||
      isSelfComplete;

    const isAuthorized = config.authModule.hasCompleteAuthorization(
      storage.expiration,
    );

    const authorizationExpiresAt = config.authModule.getAuthorizationExpiresAt(
      storage.expiration,
    );

    const isUsable = storage.isEnabled && isComplete && isAuthorized;

    // Helper functions
    async function getValidAccessToken(): Promise<string> {
      if (DEBUG_POST) {
        return "test-token";
      }

      const newAuthorization = await oauth.refreshTokens();

      return newAuthorization.accessToken;
    }

    async function post({
      title,
      text,
      userId,
      video,
      videoHSLUrl,
      videoUrl,
    }: Readonly<PostProps>): Promise<string | null> {
      if (
        !storage.isEnabled ||
        !isComplete ||
        !isAuthorized ||
        posting.isPosting
      ) {
        return null;
      }

      try {
        const accessToken = await getValidAccessToken();

        return await config.postModule.createPost({
          accessToken: mode === "hosted" ? "hosted" : accessToken,
          credentials: storage.credentials,
          requestUrl: window.location.origin,
          setIsPosting: posting.setIsPosting,
          setPostError: posting.setPostError,
          setPostProgress: posting.setPostProgress,
          setPostStatus: posting.setPostStatus,
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
        posting.setPostError(`Post failed: ${errMessage}`);
        posting.setPostStatus("Post failed");
        posting.setPostProgress(0);
        posting.setIsPosting(false);
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
        initial,
        isAuthorized,
        isComplete,
        isEnabled: storage.isEnabled,
        isHandlingAuth: oauth.isHandlingAuth,
        isPosting: posting.isPosting,
        isUsable,
        label: config.label,
        loading,
        mode,
        post,
        postError: posting.postError,
        postProgress: posting.postProgress,
        postStatus: posting.postStatus,
        resetPostState: posting.resetPostState,
        saveData,
        setIsEnabled: storage.setIsEnabled,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        config.postModule.VIDEO_MAX_DURATION,
        config.postModule.VIDEO_MAX_FILESIZE,
        config.postModule.VIDEO_MIN_DURATION,
        storage.accounts,
        storage.authorization,
        config.brandColor,
        storage.credentials,
        credentialsId,
        oauth.disconnect,
        error,
        config.hasAuthorizationStep,
        oauth.hasCompletedAuth,
        config.hasHostedCredentials,
        config.icon,
        initial,
        isAuthorized,
        isComplete,
        storage.isEnabled,
        oauth.isHandlingAuth,
        posting.isPosting,
        isUsable,
        config.label,
        loading,
        posting.postError,
        posting.postProgress,
        posting.postStatus,
        posting.resetPostState,
      ],
    );

    return (
      <config.Context.Provider value={providerValues}>
        {children}
      </config.Context.Provider>
    );
  };
}

export { createServiceProvider };
