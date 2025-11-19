"use client";

import { ServiceFormWithContext } from "@/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/components/service/ServiceSwitchWithContext";
import { POST_CONTEXTS } from "@/services/post/contexts";

interface PostSwitchesProps {
  mode: "hosted" | "browser";
}

function PostSwitches({ mode }: Readonly<PostSwitchesProps>) {
  return (
    <>
      {POST_CONTEXTS.filter((context) => context.modes.includes(mode)).map(
        (context) => (
          <ServiceSwitchWithContext
            context={context.context}
            form={<ServiceFormWithContext context={context.context} />}
            key={context.id}
          />
        ),
      )}
    </>
  );
}

export { PostSwitches };
