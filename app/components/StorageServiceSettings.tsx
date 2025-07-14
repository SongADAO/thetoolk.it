import { Context } from "react";

import { ServiceFormWithContext } from "@/app/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/app/components/service/ServiceSwitchWithContext";
import type { StorageServiceContextType } from "@/app/services/storage/StorageServiceContext";

interface Props {
  readonly context: Context<StorageServiceContextType>;
}

export function StorageServiceSettings({ context }: Props) {
  return (
    <ServiceSwitchWithContext
      context={context}
      form={<ServiceFormWithContext context={context} />}
    />
  );
}
