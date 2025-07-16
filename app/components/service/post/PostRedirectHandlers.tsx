"use client";

import { POST_CONTEXTS } from "@/app/components/service/post/contexts";
import { ServiceRedirectHandlerWithContext } from "@/app/components/service/ServiceRedirectHandlerWithContext";

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
