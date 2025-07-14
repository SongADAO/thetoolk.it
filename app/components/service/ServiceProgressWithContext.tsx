"use client";

import { ComponentProps, Context, use } from "react";

import { ServiceProgress } from "@/app/components/service/ServiceProgress";

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
    isPosting: contextValue.isPosting,
    label: contextValue.label,
    postError: contextValue.postError,
    postProgress: contextValue.postProgress,
    postStatus: contextValue.postStatus,
  };

  return <ServiceProgress {...props} />;
}
