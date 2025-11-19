"use client";

import { ServiceFormWithContext } from "@/components/service/ServiceFormWithContext";
import { ServiceSwitchWithContext } from "@/components/service/ServiceSwitchWithContext";
import { STORAGE_CONTEXTS } from "@/services/storage/contexts";

interface StorageSwitchesProps {
  mode: "hosted" | "browser";
}

function StorageSwitches({ mode }: Readonly<StorageSwitchesProps>) {
  return (
    <>
      {STORAGE_CONTEXTS.filter((context) => context.modes.includes(mode)).map(
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

export { StorageSwitches };
