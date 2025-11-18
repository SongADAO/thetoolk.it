"use client";

import { ServiceProgressWithContext } from "@/components/service/ServiceProgressWithContext";
import { STORAGE_CONTEXTS } from "@/components/service/storage/contexts";

export function StoreProgress() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {STORAGE_CONTEXTS.map((context) => (
        <ServiceProgressWithContext
          context={context.context}
          key={context.id}
        />
      ))}
    </div>
  );
}
