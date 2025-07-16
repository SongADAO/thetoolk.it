import { Context } from "react";

import { ServiceFormWithContext } from "@/app/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/app/components/service/ServiceSwitchWithContext";
import type { PostServiceContextType } from "@/app/services/post/PostServiceContext";

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
