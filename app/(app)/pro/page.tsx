"use client";

import type { Metadata } from "next";

import { Poster } from "@/components/Poster";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";
import { UpgradeModal } from "@/components/UpgradeModal";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";

export const metadata: Metadata = {
  alternates: {
    canonical: "/pro",
  },
  description:
    "TheToolk.it Pro Edition offers advanced features and full access to all tools. Upgrade now to enhance your experience and unlock the full potential of TheToolk.it.",
  title: "TheToolk.it Pro",
};

export default function ProPage() {
  return (
    <div>
      <UserStorageProvider mode="hosted">
        <StorageProviders mode="hosted">
          <PostProviders mode="hosted">
            <Poster mode="hosted" />
          </PostProviders>
        </StorageProviders>
      </UserStorageProvider>

      <UpgradeModal />
    </div>
  );
}
