"use client";

import { ComponentProps, Context, ReactNode, use } from "react";

import { ServiceSwitch } from "@/app/components/service/ServiceSwitch";

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

  const props: ServiceSwitchProps = {
    brandColor: contextValue.brandColor,
    credentialsId: contextValue.credentialsId,
    form,
    icon: contextValue.icon,
    isComplete: contextValue.isComplete,
    isEnabled: contextValue.isEnabled,
    label: contextValue.label,
    setIsEnabled: contextValue.setIsEnabled,
  };

  return <ServiceSwitch {...props} />;
}
