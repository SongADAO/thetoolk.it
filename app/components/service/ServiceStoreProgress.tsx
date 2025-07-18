import { ReactNode } from "react";

import { ServiceProgress } from "@/app/components/service/ServiceProgress";

interface Props {
  brandColor: string;
  icon: ReactNode;
  isEnabled: boolean;
  isStoring: boolean;
  isUsable: boolean;
  label: string;
  storeError: string;
  storeProgress: number;
  storeStatus: string;
}

function ServiceStoreProgress({
  brandColor,
  icon,
  isEnabled,
  isStoring,
  isUsable,
  label,
  storeError,
  storeProgress,
  storeStatus,
}: Readonly<Props>) {
  return (
    <ServiceProgress
      brandColor={brandColor}
      error={storeError}
      icon={icon}
      isEnabled={isEnabled}
      isProcessing={isStoring}
      isUsable={isUsable}
      label={label}
      progress={storeProgress}
      status={storeStatus}
    />
  );
}

export { ServiceStoreProgress };
