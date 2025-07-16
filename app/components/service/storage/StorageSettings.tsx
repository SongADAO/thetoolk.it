"use client";

import { STORAGE_CONTEXTS } from "@/app/components/service/storage/contexts";
import { StorageServiceSettings } from "@/app/components/service/storage/StorageServiceSettings";

export function StorageSettings() {
  return (
    <div>
      <div className="flex flex-col gap-2">
        {STORAGE_CONTEXTS.map((context) => (
          <div className="flex flex-col gap-1" key={context.id}>
            <StorageServiceSettings context={context.context} />
          </div>
        ))}
      </div>
    </div>
  );
}
