import { Context } from "react";

import { ServiceAuthorizeWithContext } from "@/app/components/service/ServiceAuthorizeWithContext";
import { ServiceFormWithContext } from "@/app/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/app/components/service/ServiceSwitchWithContext";
import type { ServiceContextType } from "@/app/services/post/ServiceContext";

interface Props {
  readonly context: Context<ServiceContextType>;
}

export function PostServiceSettings({ context }: Props) {
  return (
    <>
      <ServiceSwitchWithContext
        context={context}
        form={<ServiceFormWithContext context={context} />}
      />
      <ServiceAuthorizeWithContext context={context} />
    </>
  );
}
