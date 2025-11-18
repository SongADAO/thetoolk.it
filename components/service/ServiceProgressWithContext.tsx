"use client";

import { ComponentProps, Context, use } from "react";

import { ServiceProgress } from "@/components/service/ServiceProgress";

type ServiceProgressProps = ComponentProps<typeof ServiceProgress>;

interface Props<T extends ServiceProgressProps> {
  readonly context: Context<T>;
}

export function ServiceProgressWithContext<T extends ServiceProgressProps>({
  context,
}: Props<T>) {
  const contextValue = use(context);

  const props: ServiceProgressProps = {
    brandColor: contextValue.brandColor,
    icon: contextValue.icon,
    isEnabled: contextValue.isEnabled,
    isProcessing: contextValue.isProcessing,
    isUsable: contextValue.isUsable,
    label: contextValue.label,
    processError: contextValue.processError,
    processProgress: contextValue.processProgress,
    processStatus: contextValue.processStatus,
  };

  return <ServiceProgress {...props} />;
}
