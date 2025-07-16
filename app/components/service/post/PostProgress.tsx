"use client";

import { POST_CONTEXTS } from "@/app/components/service/post/contexts";
import { ServiceProgressWithContext } from "@/app/components/service/ServiceProgressWithContext";

export function PostProgress() {
  return (
    <div>
      {POST_CONTEXTS.map((context) => (
        <div key={context.id}>
          <ServiceProgressWithContext context={context.context} />
        </div>
      ))}
    </div>
  );
}
