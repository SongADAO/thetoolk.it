"use client";

import { POST_CONTEXTS } from "@/app/components/service/post/contexts";
import { PostServiceSettings } from "@/app/components/service/post/PostServiceSettings";

export function PostSettings() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {POST_CONTEXTS.map((context) => (
          <div className="flex flex-col gap-1" key={context.id}>
            <PostServiceSettings context={context.context} />
          </div>
        ))}
      </div>
    </div>
  );
}
