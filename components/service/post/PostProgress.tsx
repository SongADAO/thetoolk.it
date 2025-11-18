"use client";

import { POST_CONTEXTS } from "@/components/service/post/contexts";
import { ServiceProgressWithContext } from "@/components/service/ServiceProgressWithContext";

interface PostProgressProps {
  mode: "hosted" | "self";
}

function PostProgress({ mode }: Readonly<PostProgressProps>) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {POST_CONTEXTS.filter((context) => context.modes.includes(mode)).map(
        (context) => (
          <ServiceProgressWithContext
            context={context.context}
            key={context.id}
          />
        ),
      )}
    </div>
  );
}

export { PostProgress };
