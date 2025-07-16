"use client";

import { ServiceStoreProgressWithContext } from "@/app/components/service/ServiceStoreProgressWithContext";
import { STORAGE_CONTEXTS } from "@/app/components/service/storage/contexts";

export function StoreProgress() {
  return (
    <div>
      {STORAGE_CONTEXTS.map((context) => (
        <div key={context.id}>
          <ServiceStoreProgressWithContext context={context.context} />
        </div>
      ))}
    </div>
  );
}
