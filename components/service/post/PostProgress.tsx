"use client";

import { ServiceProgressWithContext } from "@/components/service/ServiceProgressWithContext";
import { POST_CONTEXTS } from "@/services/post/contexts";

interface PostProgressProps {
  mode: "hosted" | "browser";
}

function PostProgress({ mode }: Readonly<PostProgressProps>) {
  return (
    <>
      {POST_CONTEXTS.filter((context) => context.modes.includes(mode)).map(
        (context) => (
          <ServiceProgressWithContext
            context={context.context}
            key={context.id}
          />
        ),
      )}
    </>
  );
}

export { PostProgress };
