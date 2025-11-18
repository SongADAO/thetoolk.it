"use client";

import { ServiceProgressWithContext } from "@/components/service/ServiceProgressWithContext";
import { STORAGE_CONTEXTS } from "@/services/storage/STORAGE_CONTEXTS";

interface StorageProgressProps {
  mode: "hosted" | "self";
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
