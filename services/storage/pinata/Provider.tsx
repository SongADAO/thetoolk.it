"use client";

import { ReactNode, use, useMemo, useState } from "react";
import { GiPinata } from "react-icons/gi";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/components/service/ServiceForm";
import { AuthContext } from "@/contexts/AuthContext";
import type { HLSFiles } from "@/lib/hls-converter";
import {
  getCredentialsId,
  hasCompleteCredentials,
} from "@/services/storage/pinata/auth";
import { PinataContext } from "@/services/storage/pinata/Context";
import {
  uploadFile,
  uploadHLSFolder,
  uploadHLSFolderWithPresignedURL,
  uploadJson,
  uploadVideo,
  uploadVideoWithPresignedURL,
} from "@/services/storage/pinata/store";
import {
  defaultPinataCredentials,
  type PinataCredentials,
  type ServiceAccount,
} from "@/services/storage/types";

interface Props {
  children: ReactNode;
  mode: string;
}

export function PinataProvider({ children, mode }: Readonly<Props>) {
  const { isAuthenticated, loading: authLoading } = use(AuthContext);

  const label = "Pinata";

  const brandColor = "pinata";

  const icon = <GiPinata className="size-6" />;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");

  const [isClientEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-pinata-enabled",
    false,
    {
      initializeWithValue: false,
    },
  );

  const [credentials, setCredentials] = useLocalStorage<PinataCredentials>(
    "thetoolkit-pinata-credentials",
    defaultPinataCredentials,
    { initializeWithValue: true },
  );

  const loading = authLoading;

  const hasAuthenticatedCredentials = false;

  const credentialsId = getCredentialsId(credentials);

  const isCompleteOwnCredentials = hasCompleteCredentials(credentials);

  const isComplete = isAuthenticated || isCompleteOwnCredentials;

  const hasAuthorizationStep = false;

  const isAuthorized = isComplete;

  const isEnabled = isAuthenticated || isClientEnabled;

  const isUsable = isEnabled && isComplete && isAuthorized;

  const authorizationExpiresAt = "0";

  const accounts: ServiceAccount[] = [];

  function authorize() {
    // No auth needed.
  }

  function disconnect() {
    // No auth needed.
  }

  const fields: ServiceFormField[] = [
    {
      label: "API Key",
      name: "apiKey",
      placeholder: "API Key",
    },
    {
      label: "API Secret",
      name: "apiSecret",
      placeholder: "API Secret",
    },
    {
      label: "JWT (secret access token)",
      name: "jwt",
      placeholder: "JWT (secret access token)",
    },
    {
      label: "Gateway",
      name: "gateway",
      placeholder: "xxx-xxx-xxx-nnn.mypinata.cloud",
    },
  ];

  const initial: ServiceFormState = {
    apiKey: credentials.apiKey,
    apiSecret: credentials.apiSecret,
    gateway: credentials.gateway,
    jwt: credentials.jwt,
  };

  function saveData(formState: ServiceFormState): ServiceFormState {
    setCredentials({
      apiKey: formState.apiKey,
      apiSecret: formState.apiSecret,
      gateway: formState.gateway,
      jwt: formState.jwt,
    });

    return formState;
  }

  const [isStoring, setIsStoring] = useState<boolean>(false);
  const [storeError, setStoreError] = useState<string>("");
  const [storeProgress, setStoreProgress] = useState<number>(0);
  const [storeStatus, setStoreStatus] = useState<string>("");

  function resetStoreState() {
    setIsStoring(false);
    setStoreError("");
    setStoreProgress(0);
    setStoreStatus("");
  }

  async function storeFile(file: File, serviceLabel: string): Promise<string> {
    if (!isEnabled || !isComplete || !isAuthorized || isStoring) {
      return "";
    }

    return await uploadFile({
      credentials,
      file,
      serviceLabel,
      setIsStoring,
      setStoreError,
      setStoreProgress,
      setStoreStatus,
    });
  }

  async function storeJson(
    data: object,
    serviceLabel: string,
  ): Promise<string> {
    if (!isEnabled || !isComplete || !isAuthorized || isStoring) {
      return "";
    }

    return await uploadJson({
      credentials,
      data,
      serviceLabel,
      setIsStoring,
      setStoreError,
      setStoreProgress,
      setStoreStatus,
    });
  }

  async function storeVideo(file: File, serviceLabel: string): Promise<string> {
    if (!isEnabled || !isComplete || !isAuthorized || isStoring) {
      return "";
    }

    if (mode === "hosted") {
      return await uploadVideoWithPresignedURL({
        file,
        serviceLabel,
        setIsStoring,
        setStoreError,
        setStoreProgress,
        setStoreStatus,
      });
    }

    return await uploadVideo({
      credentials,
      file,
      serviceLabel,
      setIsStoring,
      setStoreError,
      setStoreProgress,
      setStoreStatus,
    });
  }

  async function storeHLSFolder(
    hlsFiles: HLSFiles,
    folderName: string,
    serviceLabel: string,
  ): Promise<string> {
    if (!isEnabled || !isComplete || !isAuthorized || isStoring) {
      return "";
    }

    if (mode === "hosted") {
      return await uploadHLSFolderWithPresignedURL({
        folderName,
        hlsFiles,
        serviceLabel,
        setIsStoring,
        setStoreError,
        setStoreProgress,
        setStoreStatus,
      });
    }

    return await uploadHLSFolder({
      credentials,
      folderName,
      hlsFiles,
      serviceLabel,
      setIsStoring,
      setStoreError,
      setStoreProgress,
      setStoreStatus,
    });
  }

  const providerValues = useMemo(
    () => ({
      accounts,
      authorizationExpiresAt,
      authorize,
      brandColor,
      credentialsId,
      disconnect,
      error,
      fields,
      hasAuthenticatedCredentials,
      hasAuthorizationStep,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isStoring,
      isUsable,
      label,
      loading,
      resetStoreState,
      saveData,
      setIsEnabled,
      storeError,
      storeFile,
      storeHLSFolder,
      storeJson,
      storeProgress,
      storeStatus,
      storeVideo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      accounts,
      authorizationExpiresAt,
      authorize,
      brandColor,
      credentials,
      credentialsId,
      disconnect,
      error,
      hasAuthenticatedCredentials,
      hasAuthorizationStep,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isStoring,
      isUsable,
      label,
      loading,
      resetStoreState,
      storeError,
      storeProgress,
      storeStatus,
    ],
  );

  return (
    <PinataContext.Provider value={providerValues}>
      {children}
    </PinataContext.Provider>
  );
}
