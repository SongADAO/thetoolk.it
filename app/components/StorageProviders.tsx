import { ReactNode } from "react";

import { AmazonS3Provider } from "@/app/services/storage/amazons3/Provider";
import { PinataProvider } from "@/app/services/storage/pinata/Provider";

interface Props {
  children: ReactNode;
}

export function StorageProviders({ children }: Readonly<Props>) {
  return (
    <AmazonS3Provider>
      <PinataProvider>{children}</PinataProvider>
    </AmazonS3Provider>
  );
}
