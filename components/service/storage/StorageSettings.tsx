"use client";

import { STORAGE_CONTEXTS } from "@/components/service/storage/contexts";
import { StorageServiceSettings } from "@/components/service/storage/StorageServiceSettings";

export function StorageSettings() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {STORAGE_CONTEXTS.map((context) => (
          <div className="flex flex-col gap-1" key={context.id}>
            <StorageServiceSettings context={context.context} />
          </div>
        ))}
      </div>
    </div>
  );
}
