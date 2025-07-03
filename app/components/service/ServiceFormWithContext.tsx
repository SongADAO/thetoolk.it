"use client";

import { ComponentProps, Context, use } from "react";

import { ServiceForm } from "@/app/components/service/ServiceForm";

type ServiceFormProps = ComponentProps<typeof ServiceForm>;

interface Props<T extends ServiceFormProps> {
  readonly context: Context<T>;
}

export function ServiceFormWithContext<T extends ServiceFormProps>({
  context,
}: Props<T>) {
  const contextValue = use(context);

  const props: ServiceFormProps = {
    fields: contextValue.fields,
    initial: contextValue.initial,
    saveData: contextValue.saveData,
  };

  return <ServiceForm {...props} />;
}
