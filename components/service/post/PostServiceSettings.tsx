import { Context } from "react";

import { ServiceFormWithContext } from "@/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/components/service/ServiceSwitchWithContext";
import type { PostServiceContextType } from "@/services/post/PostServiceContext";

interface Props {
  readonly context: Context<PostServiceContextType>;
}

export function PostServiceSettings({ context }: Props) {
  return (
    <ServiceSwitchWithContext
      context={context}
      form={<ServiceFormWithContext context={context} />}
    />
  );
}
