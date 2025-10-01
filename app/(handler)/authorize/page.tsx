import { Suspense } from "react";

import { PostRedirectHandlers } from "@/components/service/post/PostRedirectHandlers";

export default function Authorize() {
  return (
    <Suspense>
      <PostRedirectHandlers />
    </Suspense>
  );
}
