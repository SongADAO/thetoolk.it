"use client";

import { ServiceProgressWithContext } from "@/components/service/ServiceProgressWithContext";
import { STORAGE_CONTEXTS } from "@/components/service/storage/contexts";

export function StoreProgress() {
  return (
    <>
      {STORAGE_CONTEXTS.map((context) => (
        <ServiceProgressWithContext
          context={context.context}
          key={context.id}
        />
      ))}
    </>
  );
}
