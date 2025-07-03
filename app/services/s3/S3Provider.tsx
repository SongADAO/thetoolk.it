"use client";

import { ReactNode, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";

import { S3Context } from "@/app/services/s3/S3Context";

interface Props {
  children: ReactNode;
}

export function S3Provider({ children }: Readonly<Props>) {
  const [s3AccessKeyId, setS3AccessKeyId] = useLocalStorage(
    "thetoolkit-s3-access-key-id",
    "",
    { initializeWithValue: false },
  );

  const [s3Bucket, setS3Bucket] = useLocalStorage("thetoolkit-s3-bucket", "", {
    initializeWithValue: false,
  });

  const [s3Region, setS3Region] = useLocalStorage(
    "thetoolkit-s3-region",
    "us-east-1",
    { initializeWithValue: false },
  );

  const [s3SecretAccessKey, setS3SecretAccessKey] = useLocalStorage(
    "thetoolkit-s3-secret-access-key",
    "",
    { initializeWithValue: false },
  );

  const providerValues = useMemo(
    () => ({
      s3AccessKeyId,
      s3Bucket,
      s3Region,
      s3SecretAccessKey,
      setS3AccessKeyId,
      setS3Bucket,
      setS3Region,
      setS3SecretAccessKey,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s3AccessKeyId, s3Bucket, s3Region, s3SecretAccessKey],
  );

  return (
    <S3Context.Provider value={providerValues}>{children}</S3Context.Provider>
  );
}
