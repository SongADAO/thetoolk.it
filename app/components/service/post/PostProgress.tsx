"use client";

import { POST_CONTEXTS } from "@/app/components/service/post/contexts";
import { ServicePostProgressWithContext } from "@/app/components/service/ServicePostProgressWithContext";

export function PostProgress() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {POST_CONTEXTS.map((context) => (
        <ServicePostProgressWithContext
          context={context.context}
          key={context.id}
        />
      ))}
    </div>
  );
}
