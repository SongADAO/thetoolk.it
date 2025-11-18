"use client";

import { StorageServiceSettings } from "@/components/service/storage/StorageServiceSettings";
import { STORAGE_CONTEXTS } from "@/services/storage/STORAGE_CONTEXTS";

export function StorageSettings() {
  return (
    <>
      {STORAGE_CONTEXTS.map((context) => (
        <StorageServiceSettings context={context.context} key={context.id} />
      ))}
    </>
  );
}
