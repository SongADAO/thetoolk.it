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

  return <ServiceProgress {...contextValue} />;
}
