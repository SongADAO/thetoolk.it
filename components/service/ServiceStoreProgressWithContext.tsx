"use client";

import { ComponentProps, Context, use } from "react";

import { ServiceStoreProgress } from "@/components/service/ServiceStoreProgress";

type ServiceStoreProgressProps = ComponentProps<typeof ServiceStoreProgress>;

interface Props<T extends ServiceStoreProgressProps> {
  readonly context: Context<T>;
}

export function ServiceStoreProgressWithContext<
  T extends ServiceStoreProgressProps,
>({ context }: Props<T>) {
  const contextValue = use(context);

  const props: ServiceStoreProgressProps = {
    brandColor: contextValue.brandColor,
    icon: contextValue.icon,
    isEnabled: contextValue.isEnabled,
    isStoring: contextValue.isStoring,
    isUsable: contextValue.isUsable,
    label: contextValue.label,
    storeError: contextValue.storeError,
    storeProgress: contextValue.storeProgress,
    storeStatus: contextValue.storeStatus,
  };

  return <ServiceStoreProgress {...props} />;
}
