"use client";

import { POST_CONTEXTS } from "@/components/service/post/contexts";
import { PostServiceSettings } from "@/components/service/post/PostServiceSettings";

interface PostSettingsProps {
  mode: "hosted" | "self";
}

function PostSettings({ mode }: Readonly<PostSettingsProps>) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {POST_CONTEXTS.filter((context) => context.modes.includes(mode)).map(
          (context) => (
            <div className="flex flex-col gap-1" key={context.id}>
              <PostServiceSettings context={context.context} />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export { PostSettings };
