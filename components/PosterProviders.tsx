"use client";

import { ReactNode } from "react";

import { UserStorageProvider } from "@/contexts/UserStorageProvider";
import { PostProviders } from "@/services/post/PostProviders";
import { StorageProviders } from "@/services/storage/StorageProviders";

interface Props {
  mode: "self" | "hosted";
  children: ReactNode;
}

export function PosterProviders({ children, mode }: Readonly<Props>) {
  return (
    <UserStorageProvider mode={mode}>
      <StorageProviders mode={mode}>
        <PostProviders mode={mode}>{children}</PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
