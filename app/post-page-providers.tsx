"use client";

import { ReactNode } from "react";

import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";

interface Props {
  mode: "self" | "hosted";
  children: ReactNode;
}

export function PostPageProviders({ children, mode }: Readonly<Props>) {
  return (
    <UserStorageProvider mode={mode}>
      <StorageProviders mode={mode}>
        <PostProviders mode={mode}>{children}</PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
