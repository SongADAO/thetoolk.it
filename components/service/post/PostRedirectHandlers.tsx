"use client";

import { POST_CONTEXTS } from "@/components/service/post/contexts";
import { ServiceRedirectHandlerWithContext } from "@/components/service/ServiceRedirectHandlerWithContext";

export function PostRedirectHandlers() {
  return (
    <>
      {POST_CONTEXTS.map((context) => (
        <ServiceRedirectHandlerWithContext
          context={context.context}
          key={context.id}
        />
      ))}
    </>
  );
}
