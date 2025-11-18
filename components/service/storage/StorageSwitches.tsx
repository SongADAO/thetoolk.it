"use client";

import { ServiceFormWithContext } from "@/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/components/service/ServiceSwitchWithContext";
import { STORAGE_CONTEXTS } from "@/services/storage/STORAGE_CONTEXTS";

export function StorageSwitches() {
  return (
    <>
      {STORAGE_CONTEXTS.map((context) => (
        <ServiceSwitchWithContext
          context={context.context}
          form={<ServiceFormWithContext context={context.context} />}
          key={context.id}
        />
      ))}
    </>
  );
}
