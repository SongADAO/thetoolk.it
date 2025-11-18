import { Suspense } from "react";

import { PostRedirectHandlers } from "@/components/service/post/PostRedirectHandlers";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";
import { PostProviders } from "@/services/post/PostProviders";
import { StorageProviders } from "@/services/storage/StorageProviders";

export default function Authorize() {
  return (
    <UserStorageProvider mode="self">
      <StorageProviders mode="self">
        <PostProviders mode="self">
          <Suspense>
            <PostRedirectHandlers />
          </Suspense>
        </PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
