"use client";

import { ComponentProps, Context, ReactNode, use } from "react";

import { ServiceSwitch } from "@/components/service/ServiceSwitch";

type ServiceSwitchProps = ComponentProps<typeof ServiceSwitch>;
type ServiceSwitchContextProps = Omit<ServiceSwitchProps, "form">;

interface Props<T extends ServiceSwitchContextProps> {
  readonly context: Context<T>;
  readonly form: ReactNode;
}

export function ServiceSwitchWithContext<T extends ServiceSwitchContextProps>({
  context,
  form,
}: Props<T>) {
  const contextValue = use(context);

  return <ServiceSwitch {...contextValue} form={form} />;
}
