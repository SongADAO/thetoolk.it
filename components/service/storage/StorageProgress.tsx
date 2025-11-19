"use client";

import { ServiceProgressWithContext } from "@/components/service/ServiceProgressWithContext";
import { STORAGE_CONTEXTS } from "@/services/storage/contexts";

interface StorageProgressProps {
  mode: "server" | "browser";
}

function StorageProgress({ mode }: Readonly<StorageProgressProps>) {
  return (
    <>
      {STORAGE_CONTEXTS.filter((context) => context.modes.includes(mode)).map(
        (context) => (
          <ServiceProgressWithContext
            context={context.context}
            key={context.id}
          />
        ),
      )}
    </>
  );
}

export { StorageProgress };
