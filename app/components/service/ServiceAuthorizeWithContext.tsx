"use client";

import { ComponentProps, Context, use } from "react";

import { ServiceAuthorize } from "@/app/components/service/ServiceAuthorize";

type ServiceAuthorizeProps = ComponentProps<typeof ServiceAuthorize>;

interface Props<T extends ServiceAuthorizeProps> {
  readonly context: Context<T>;
}

export function ServiceAuthorizeWithContext<T extends ServiceAuthorizeProps>({
  context,
}: Props<T>) {
  const contextValue = use(context);

  const props: ServiceAuthorizeProps = {
    authorizationExpiresAt: contextValue.authorizationExpiresAt,
    authorize: contextValue.authorize,
    icon: contextValue.icon,
    isAuthorized: contextValue.isAuthorized,
    isComplete: contextValue.isComplete,
    isEnabled: contextValue.isEnabled,
    label: contextValue.label,
  };

  return <ServiceAuthorize {...props} />;
}
