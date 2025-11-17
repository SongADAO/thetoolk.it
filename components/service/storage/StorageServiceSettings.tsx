import { Context } from "react";

import { ServiceFormWithContext } from "@/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/components/service/ServiceSwitchWithContext";
import type { StorageServiceContextType } from "@/services/storage/StorageServiceContext";

interface Props {
  readonly context: Context<StorageServiceContextType>;
}

function StorageServiceSettings({ context }: Props) {
  return (
    <ServiceSwitchWithContext
      context={context}
      form={<ServiceFormWithContext context={context} />}
    />
  );
}

export { StorageServiceSettings };
