"use client";

import { ServiceRedirectHandlerWithContext } from "@/components/service/ServiceRedirectHandlerWithContext";
import { POST_CONTEXTS } from "@/services/post/POST_CONTEXTS";

function PostRedirectHandlers() {
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

export { PostRedirectHandlers };
