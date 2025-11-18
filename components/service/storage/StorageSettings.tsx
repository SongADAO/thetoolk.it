"use client";

import { STORAGE_CONTEXTS } from "@/components/service/storage/contexts";
import { StorageServiceSettings } from "@/components/service/storage/StorageServiceSettings";

export function StorageSettings() {
  return (
    <>
      {STORAGE_CONTEXTS.map((context) => (
        <StorageServiceSettings context={context.context} key={context.id} />
      ))}
    </>
  );
}
