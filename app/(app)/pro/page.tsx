"use client";

import { Poster } from "@/components/Poster";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";
import { UpgradeModal } from "@/components/UpgradeModal";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";

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
