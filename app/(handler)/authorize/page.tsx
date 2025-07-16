import { Suspense } from "react";

import { PostRedirectHandlers } from "@/app/components/service/post/PostRedirectHandlers";

export default function Authorize() {
  return (
    <Suspense>
      <PostRedirectHandlers />
    </Suspense>
  );
}
