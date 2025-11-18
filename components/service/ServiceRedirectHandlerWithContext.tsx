"use client";

import { ComponentProps, Context, use } from "react";

import { ServiceRedirectHandler } from "@/components/service/ServiceRedirectHandler";

type ServiceRedirectHandlerProps = ComponentProps<
  typeof ServiceRedirectHandler
>;

interface Props<T extends ServiceRedirectHandlerProps> {
  readonly context: Context<T>;
}

export function ServiceRedirectHandlerWithContext<
  T extends ServiceRedirectHandlerProps,
>({ context }: Props<T>) {
  const contextValue = use(context);

  return <ServiceRedirectHandler {...contextValue} />;
}
