"use client";

import { POST_CONTEXTS } from "@/app/components/service/post/contexts";
import { ServicePostProgressWithContext } from "@/app/components/service/ServicePostProgressWithContext";

export function PostProgress() {
  return (
    <div>
      {POST_CONTEXTS.map((context) => (
        <div key={context.id}>
          <ServicePostProgressWithContext context={context.context} />
        </div>
      ))}
    </div>
  );
}
