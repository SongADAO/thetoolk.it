"use client";

import { ReactNode, use, useMemo, useState } from "react";
import { FaAws } from "react-icons/fa6";
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
  type ServiceAccount,
} from "@/services/storage/types";

interface Props {
  children: ReactNode;
  mode: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AmazonS3Provider({ children, mode }: Readonly<Props>) {
  const { loading: authLoading } = use(AuthContext);

  const label = "AmazonS3";

  const brandColor = "amazons3";

  const icon = <FaAws className="size-6" />;

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

  const hasAuthenticatedCredentials = false;

  const credentialsId = getCredentialsId(credentials);

  const isCompleteOwnCredentials = hasCompleteCredentials(credentials);

  const isComplete =
    mode === "hosted" || (mode === "self" && isCompleteOwnCredentials);

  const hasAuthorizationStep = false;

  const isAuthorized = isComplete;

  // TODO: Create S3 hosted version.
  // const isEnabled = mode === "hosted" || (mode === "self" && isClientEnabled);
  const isEnabled =
    // eslint-disable-next-line no-constant-binary-expression, @typescript-eslint/no-unnecessary-condition
    (mode === "hosted" && 0) || (mode === "self" && isClientEnabled);

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

  const initial: ServiceFormState = {
    accessKeyId: credentials.accessKeyId,
    bucket: credentials.bucket,
    region: credentials.region,
    secretAccessKey: credentials.secretAccessKey,
  };

  function saveData(formState: ServiceFormState): ServiceFormState {
    setCredentials({
      accessKeyId: formState.accessKeyId,
      bucket: formState.bucket,
      region: formState.region,
      secretAccessKey: formState.secretAccessKey,
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
      mode,
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
    <AmazonS3Context.Provider value={providerValues}>
      {children}
    </AmazonS3Context.Provider>
  );
}
