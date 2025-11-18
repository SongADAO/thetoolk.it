"use client";

import { ServiceProgressWithContext } from "@/components/service/ServiceProgressWithContext";
import { STORAGE_CONTEXTS } from "@/services/storage/STORAGE_CONTEXTS";

export function StorageProgress() {
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
