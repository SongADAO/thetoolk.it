import { ReactNode } from "react";

import { AmazonS3Provider } from "@/app/services/storage/amazon-s3/Provider";

interface Props {
  children: ReactNode;
}

export function StorageProviders({ children }: Readonly<Props>) {
  return <AmazonS3Provider>{children}</AmazonS3Provider>;
}
