"use client";

import { ReactNode, use, useMemo, useState } from "react";
import { FaAws } from "react-icons/fa6";
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
} from "@/services/storage/amazons3/auth";
import { AmazonS3Context } from "@/services/storage/amazons3/Context";
import {
  uploadFile,
  uploadHLSFolder,
  uploadJson,
  uploadVideo,
} from "@/services/storage/amazons3/store";
import {
  type AmazonS3Credentials,
  defaultAmazonS3Credentials,
  type StorageServiceAccount,
} from "@/services/storage/types";

interface Props {
  children: ReactNode;
  mode: "hosted" | "browser";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AmazonS3Provider({ children, mode }: Readonly<Props>) {
  const { loading: authLoading } = use(AuthContext);

  const label = "AmazonS3";

  const brandColor = "amazons3";

  const icon = <FaAws className="size-6" />;

  const hasAuthorizationStep = false;

  const hasHostedCredentials = false;

  const fields: ServiceFormField[] = [
    {
      label: "Access Key ID",
      name: "accessKeyId",
      placeholder: "Access Key ID",
    },
    {
      label: "Secret Access Key",
      name: "secretAccessKey",
      placeholder: "Secret Access Key",
    },
    {
      label: "Region",
      name: "region",
      placeholder: "us-east-1",
    },
    {
      label: "Bucket",
      name: "bucket",
      placeholder: "thetoolkit",
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");

  const [isClientEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-amazons3-enabled",
    false,
    {
      initializeWithValue: false,
    },
  );

  const [credentials, setCredentials] = useLocalStorage<AmazonS3Credentials>(
    "thetoolkit-amazons3-credentials",
    defaultAmazonS3Credentials,
    { initializeWithValue: true },
  );

  const loading = authLoading;

  const credentialsId = getCredentialsId(credentials);

  const isCompleteOwnCredentials = hasCompleteCredentials(credentials);

  const isComplete =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (mode === "hosted" && !hasHostedCredentials) ||
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (mode === "hosted" && hasHostedCredentials && isCompleteOwnCredentials) ||
    (mode === "browser" && isCompleteOwnCredentials);

  const isAuthorized = isComplete;

  // TODO: Create S3 hosted version.
  // const isHostedEnabled = mode === "hosted";
  const isHostedEnabled = false;
  const isSelfEnabled = mode === "browser" && isClientEnabled;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
    <AmazonS3Context.Provider value={providerValues}>
      {children}
    </AmazonS3Context.Provider>
  );
}
