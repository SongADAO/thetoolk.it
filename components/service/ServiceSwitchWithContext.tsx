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

  const props: ServiceSwitchProps = {
    accounts: contextValue.accounts,
    authorizationExpiresAt: contextValue.authorizationExpiresAt,
    authorize: contextValue.authorize,
    brandColor: contextValue.brandColor,
    credentialsId: contextValue.credentialsId,
    disconnect: contextValue.disconnect,
    form,
    hasAuthorizationStep: contextValue.hasAuthorizationStep,
    hasHostedCredentials: contextValue.hasHostedCredentials,
    icon: contextValue.icon,
    isAuthorized: contextValue.isAuthorized,
    isComplete: contextValue.isComplete,
    isEnabled: contextValue.isEnabled,
    label: contextValue.label,
    mode: contextValue.mode,
    setIsEnabled: contextValue.setIsEnabled,
  };

  return <ServiceSwitch {...props} />;
}
