"use client";

import { ReactNode, useMemo, useState } from "react";
import { FaAws } from "react-icons/fa6";
import { useLocalStorage } from "usehooks-ts";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import {
  getCredentialsId,
  hasCompleteCredentials,
} from "@/app/services/storage/amazons3/auth";
import { AmazonS3Context } from "@/app/services/storage/amazons3/Context";
import {
  type AmazonS3Credentials,
  defaultAmazonS3Credentials,
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

  const providerValues = useMemo(
    () => ({
      brandColor,
      credentialsId,
      error,
      fields,
      icon,
      initial,
      isComplete,
      isEnabled,
      label,
      saveData,
      setIsEnabled,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      brandColor,
      credentialsId,
      credentials,
      error,
      icon,
      initial,
      isComplete,
      isEnabled,
      label,
    ],
  );

  return (
    <AmazonS3Context.Provider value={providerValues}>
      {children}
    </AmazonS3Context.Provider>
  );
}
