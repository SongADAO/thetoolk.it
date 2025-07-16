"use client";

import { ServiceStoreProgressWithContext } from "@/app/components/service/ServiceStoreProgressWithContext";
import { STORAGE_CONTEXTS } from "@/app/components/service/storage/contexts";

export function StoreProgress() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {STORAGE_CONTEXTS.map((context) => (
        <div key={context.id}>
          <ServiceStoreProgressWithContext context={context.context} />
        </div>
      ))}
    </div>
  );
}
