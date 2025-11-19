import type { Metadata } from "next";
import { Suspense } from "react";

import { PostRedirectHandlers } from "@/components/service/post/PostRedirectHandlers";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";
import { PostProviders } from "@/services/post/PostProviders";
import { StorageProviders } from "@/services/storage/StorageProviders";

export const metadata: Metadata = {
  alternates: {
    canonical: "/authorize",
  },
  description: "Authorizing TheToolk.it",
  title: "Authorize - TheToolk.it",
};

export default function AuthorizePage() {
  return (
    <UserStorageProvider mode="browser">
      <StorageProviders mode="browser">
        <PostProviders mode="browser">
          <Suspense>
            <PostRedirectHandlers mode="browser" />
          </Suspense>
        </PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
