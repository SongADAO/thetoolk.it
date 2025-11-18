"use client";

import { ServiceRedirectHandlerWithContext } from "@/components/service/ServiceRedirectHandlerWithContext";
import { POST_CONTEXTS } from "@/services/post/contexts";

interface PostRedirectHandlersProps {
  mode: "hosted" | "self";
}

function PostRedirectHandlers({ mode }: Readonly<PostRedirectHandlersProps>) {
  return (
    <>
      {POST_CONTEXTS.filter((context) => context.modes.includes(mode)).map(
        (context) => (
          <ServiceRedirectHandlerWithContext
            context={context.context}
            key={context.id}
          />
        ),
      )}
    </>
  );
}

export { PostRedirectHandlers };
