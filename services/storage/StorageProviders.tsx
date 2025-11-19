import { ReactNode } from "react";

import { AmazonS3Provider } from "@/services/storage/amazons3/Provider";
import { PinataProvider } from "@/services/storage/pinata/Provider";

interface Props {
  mode: "hosted" | "browser";
  children: ReactNode;
}

export function StorageProviders({ mode, children }: Readonly<Props>) {
  return (
    <AmazonS3Provider mode={mode}>
      <PinataProvider mode={mode}>{children}</PinataProvider>
    </AmazonS3Provider>
  );
}
