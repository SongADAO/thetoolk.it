"use client";

import { ReactNode, useMemo, useState } from "react";
import { FaAws } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import type { HLSFiles } from "@/app/lib/hls-converter";
import {
  getCredentialsId,
  hasCompleteCredentials,
} from "@/app/services/storage/amazons3/auth";
import { AmazonS3Context } from "@/app/services/storage/amazons3/Context";
import {
  uploadFile,
  uploadHLSFolder,
  uploadJson,
  uploadVideo,
} from "@/app/services/storage/amazons3/store";
import {
  type AmazonS3Credentials,
  defaultAmazonS3Credentials,
  type ServiceAccount,
} from "@/app/services/storage/types";

interface Props {
  children: ReactNode;
}

export function AmazonS3Provider({ children }: Readonly<Props>) {
  const label = "AmazonS3";

  const brandColor = "amazons3";

  const icon = <FaAws className="size-6" />;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-amazons3-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<AmazonS3Credentials>(
    "thetoolkit-amazons3-credentials",
    defaultAmazonS3Credentials,
    { initializeWithValue: true },
  );

  const credentialsId = getCredentialsId(credentials);

  const isComplete = hasCompleteCredentials(credentials);

  const hasAuthorizationStep = false;

  const isAuthorized = isComplete;

  const isUsable = isEnabled && isComplete && isAuthorized;

  const authorizationExpiresAt = "0";

  const accounts: ServiceAccount[] = [];

  function authorize() {
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
      error,
      fields,
      hasAuthorizationStep,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isStoring,
      isUsable,
      label,
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
      error,
      hasAuthorizationStep,
      icon,
      initial,
      isAuthorized,
      isComplete,
      isEnabled,
      isStoring,
      isUsable,
      label,
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
