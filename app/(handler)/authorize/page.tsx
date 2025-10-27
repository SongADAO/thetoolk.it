import { Suspense } from "react";

import { PostProviders } from "@/components/service/post/PostProviders";
import { PostRedirectHandlers } from "@/components/service/post/PostRedirectHandlers";
import { StorageProviders } from "@/components/service/storage/StorageProviders";

export default function Authorize() {
  return (
    <StorageProviders mode="self">
      <PostProviders mode="self">
        <Suspense>
          <PostRedirectHandlers />
        </Suspense>
      </PostProviders>
    </StorageProviders>
  );
}
