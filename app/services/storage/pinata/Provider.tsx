"use client";

import { ReactNode, useMemo, useState } from "react";
import { GiPinata } from "react-icons/gi";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import {
  getCredentialsId,
  hasCompleteCredentials,
} from "@/app/services/storage/pinata/auth";
import { PinataContext } from "@/app/services/storage/pinata/Context";
import {
  uploadFile,
  uploadJson,
  uploadVideo,
} from "@/app/services/storage/pinata/store";
import {
  defaultPinataCredentials,
  type PinataCredentials,
  type ServiceAccount,
} from "@/app/services/storage/types";

interface Props {
  children: ReactNode;
}

export function PinataProvider({ children }: Readonly<Props>) {
  const label = "Pinata";

  const brandColor = "pinata";

  const icon = <GiPinata className="size-6" />;

  const [error, setError] = useState("");

  const [isEnabled, setIsEnabled] = useLocalStorage<boolean>(
    "thetoolkit-pinata-enabled",
    false,
    { initializeWithValue: false },
  );

  const [credentials, setCredentials] = useLocalStorage<PinataCredentials>(
    "thetoolkit-pinata-credentials",
    defaultPinataCredentials,
    { initializeWithValue: true },
  );

  const credentialsId = getCredentialsId(credentials);

  const isComplete = hasCompleteCredentials(credentials);

  const hasAuthorizationStep = false;

  const isAuthorized = isComplete;

  const authorizationExpiresAt = "0";

  const accounts: ServiceAccount[] = [];

  function authorize() {
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
  ];

  const initial: ServiceFormState = {
    apiKey: credentials.apiKey,
    apiSecret: credentials.apiSecret,
    jwt: credentials.jwt,
  };

  function saveData(formState: ServiceFormState): ServiceFormState {
    setCredentials({
      apiKey: formState.apiKey,
      apiSecret: formState.apiSecret,
      jwt: formState.jwt,
    });

    return formState;
  }

  const [isStoring, setIsStoring] = useState<boolean>(false);
  const [storeError, setStoreError] = useState<string>("");
  const [storeProgress, setStoreProgress] = useState<number>(0);
  const [storeStatus, setStoreStatus] = useState<string>("");

  async function storeFile(file: File): Promise<string | null> {
    return await uploadFile({
      credentials,
      file,
      setIsStoring,
      setStoreError,
      setStoreProgress,
      setStoreStatus,
    });
  }

  async function storeJson(data: object): Promise<string | null> {
    return await uploadJson({
      credentials,
      data,
      setIsStoring,
      setStoreError,
      setStoreProgress,
      setStoreStatus,
    });
  }

  async function storeVideo(file: File): Promise<string | null> {
    return await uploadVideo({
      credentials,
      file,
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
      label,
      saveData,
      setIsEnabled,
      storeError,
      storeFile,
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
      label,
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
