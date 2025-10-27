import { Suspense } from "react";

import { PostProviders } from "@/components/service/post/PostProviders";
import { PostRedirectHandlers } from "@/components/service/post/PostRedirectHandlers";
import { StorageProviders } from "@/components/service/storage/StorageProviders";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";

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
