import { Context } from "react";

import { ServiceFormWithContext } from "@/app/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/app/components/service/ServiceSwitchWithContext";
import type { ServiceContextType } from "@/app/services/storage/ServiceContext";

interface Props {
  readonly context: Context<ServiceContextType>;
}

export function StorageServiceSettings({ context }: Props) {
  return (
    <ServiceSwitchWithContext
      context={context}
      form={<ServiceFormWithContext context={context} />}
    />
  );
}
