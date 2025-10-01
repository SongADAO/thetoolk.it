"use client";

import { ComponentProps, Context, use } from "react";

import { ServicePostProgress } from "@/components/service/ServicePostProgress";

type ServicePostProgressProps = ComponentProps<typeof ServicePostProgress>;

interface Props<T extends ServicePostProgressProps> {
  readonly context: Context<T>;
}

export function ServicePostProgressWithContext<
  T extends ServicePostProgressProps,
>({ context }: Props<T>) {
  const contextValue = use(context);

  const props: ServicePostProgressProps = {
    brandColor: contextValue.brandColor,
    icon: contextValue.icon,
    isEnabled: contextValue.isEnabled,
    isPosting: contextValue.isPosting,
    isUsable: contextValue.isUsable,
    label: contextValue.label,
    postError: contextValue.postError,
    postProgress: contextValue.postProgress,
    postStatus: contextValue.postStatus,
  };

  return <ServicePostProgress {...props} />;
}
