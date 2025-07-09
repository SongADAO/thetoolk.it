import { ReactNode } from "react";

import { AmazonS3Provider } from "@/app/services/storage/amazons3/Provider";

interface Props {
  children: ReactNode;
}

export function StorageProviders({ children }: Readonly<Props>) {
  return <AmazonS3Provider>{children}</AmazonS3Provider>;
}
