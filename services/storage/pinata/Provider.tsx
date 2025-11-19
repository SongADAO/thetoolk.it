"use client";

import { ReactNode, use, useMemo, useState } from "react";
import { GiPinata } from "react-icons/gi";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/components/service/ServiceForm";
import { AuthContext } from "@/contexts/AuthContext";
import type { HLSFiles } from "@/lib/video/hls";
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
  type StorageServiceAccount,
} from "@/services/storage/types";

interface Props {
  children: ReactNode;
  mode: "server" | "browser";
}

export function PinataProvider({ children, mode }: Readonly<Props>) {
  const { loading: authLoading } = use(AuthContext);

  const label = "Pinata";

  const brandColor = "pinata";

  const icon = <GiPinata className="size-6" />;

  const hasAuthorizationStep = false;

  const hasHostedCredentials = false;

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

  const credentialsId = getCredentialsId(credentials);

  const isCompleteOwnCredentials = hasCompleteCredentials(credentials);

  const isComplete =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (mode === "server" && !hasHostedCredentials) ||
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (mode === "server" && hasHostedCredentials && isCompleteOwnCredentials) ||
    (mode === "browser" && isCompleteOwnCredentials);

  const isAuthorized = isComplete;

  const isHostedEnabled = mode === "server";
  const isSelfEnabled = mode === "browser" && isClientEnabled;
  const isEnabled = isHostedEnabled || isSelfEnabled;

  const isUsable = isEnabled && isComplete && isAuthorized;

  const authorizationExpiresAt = "0";

  const accounts: StorageServiceAccount[] = [];

  function authorize() {
    // No auth needed.
  }

  function disconnect() {
    // No auth needed.
  }

  function isCredentialKey(key: string): key is keyof typeof credentials {
    return key in credentials;
  }

  const initial: ServiceFormState = fields.reduce<ServiceFormState>(
    (acc, field) => {
      if (isCredentialKey(field.name)) {
        acc[field.name] = credentials[field.name];
      }
      return acc;
    },
    {},
  );

  function saveData(formState: ServiceFormState): ServiceFormState {
    const updatedCredentials = { ...credentials };

    fields.forEach((field) => {
      if (isCredentialKey(field.name)) {
        updatedCredentials[field.name] = formState[field.name];
      }
    });

    setCredentials(updatedCredentials);

    return formState;
  }

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processError, setProcessError] = useState<string>("");
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [processStatus, setProcessStatus] = useState<string>("");

  function resetProcessState() {
    setIsProcessing(false);
    setProcessError("");
    setProcessProgress(0);
    setProcessStatus("");
  }

  async function storeFile(file: File, serviceLabel: string): Promise<string> {
    if (!isEnabled || !isComplete || !isAuthorized || isProcessing) {
      return "";
    }

    return await uploadFile({
      credentials,
      file,
      serviceLabel,
      setIsProcessing,
      setProcessError,
      setProcessProgress,
      setProcessStatus,
    });
  }

  async function storeJson(
    data: object,
    serviceLabel: string,
  ): Promise<string> {
    if (!isEnabled || !isComplete || !isAuthorized || isProcessing) {
      return "";
    }

    return await uploadJson({
      credentials,
      data,
      serviceLabel,
      setIsProcessing,
      setProcessError,
      setProcessProgress,
      setProcessStatus,
    });
  }

  async function storeVideo(file: File, serviceLabel: string): Promise<string> {
    if (!isEnabled || !isComplete || !isAuthorized || isProcessing) {
      return "";
    }

    if (mode === "server") {
      return await uploadVideoWithPresignedURL({
        file,
        serviceLabel,
        setIsProcessing,
        setProcessError,
        setProcessProgress,
        setProcessStatus,
      });
    }

    return await uploadVideo({
      credentials,
      file,
      serviceLabel,
      setIsProcessing,
      setProcessError,
      setProcessProgress,
      setProcessStatus,
    });
  }

  async function storeHLSFolder(
    hlsFiles: HLSFiles,
    folderName: string,
    serviceLabel: string,
  ): Promise<string> {
    if (!isEnabled || !isComplete || !isAuthorized || isProcessing) {
      return "";
    }

    if (mode === "server") {
      return await uploadHLSFolderWithPresignedURL({
        folderName,
        hlsFiles,
        serviceLabel,
        setIsProcessing,
        setProcessError,
        setProcessProgress,
        setProcessStatus,
      });
    }

    return await uploadHLSFolder({
      credentials,
      folderName,
      hlsFiles,
      serviceLabel,
      setIsProcessing,
      setProcessError,
      setProcessProgress,
      setProcessStatus,
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
      hasAuthorizationStep,
      hasHostedCredentials,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isProcessing,
      isUsable,
      label,
      loading,
      mode,
      processError,
      processProgress,
      processStatus,
      resetProcessState,
      saveData,
      setIsEnabled,
      storeFile,
      storeHLSFolder,
      storeJson,
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
      hasAuthorizationStep,
      hasHostedCredentials,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isProcessing,
      isUsable,
      label,
      loading,
      processError,
      processProgress,
      processStatus,
      resetProcessState,
    ],
  );

  return (
    <PinataContext.Provider value={providerValues}>
      {children}
    </PinataContext.Provider>
  );
}
