"use client";

import { POST_CONTEXTS } from "@/components/service/post/contexts";
import { PostServiceSettings } from "@/components/service/post/PostServiceSettings";

interface PostSettingsProps {
  mode: "hosted" | "self";
}

function PostSettings({ mode }: Readonly<PostSettingsProps>) {
  return (
    <>
      {POST_CONTEXTS.filter((context) => context.modes.includes(mode)).map(
        (context) => (
          <PostServiceSettings context={context.context} key={context.id} />
        ),
      )}
    </>
  );
}

export { PostSettings };
