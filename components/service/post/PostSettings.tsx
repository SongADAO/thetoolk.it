"use client";

import { ServiceFormWithContext } from "@/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/components/service/ServiceSwitchWithContext";
import { POST_CONTEXTS } from "@/services/post/POST_CONTEXTS";

interface PostSettingsProps {
  mode: "hosted" | "self";
}

function PostSettings({ mode }: Readonly<PostSettingsProps>) {
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

export { PostSettings };
