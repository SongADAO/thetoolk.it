"use client";

import { PostServiceSettings } from "@/components/service/post/PostServiceSettings";
import { POST_CONTEXTS } from "@/services/post/POST_CONTEXTS";

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
