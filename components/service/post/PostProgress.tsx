"use client";

import { POST_CONTEXTS } from "@/components/service/post/contexts";
import { ServicePostProgressWithContext } from "@/components/service/ServicePostProgressWithContext";

interface PostProgressProps {
  mode: "hosted" | "self";
}

function PostProgress({ mode }: Readonly<PostProgressProps>) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {POST_CONTEXTS.filter((context) => context.modes.includes(mode)).map(
        (context) => (
          <ServicePostProgressWithContext
            context={context.context}
            key={context.id}
          />
        ),
      )}
    </div>
  );
}

export { PostProgress };
