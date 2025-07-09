import { ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";

interface ServiceContextType {
  brandColor: string;
  credentialsId: string;
  error: string;
  fields: ServiceFormField[];
  icon: ReactNode | undefined;
  initial: ServiceFormState;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
  saveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const serviceContextDefault = {
  brandColor: "",
  credentialsId: "",
  error: "",
  fields: [],
  icon: undefined,
  initial: {},
  isComplete: false,
  isEnabled: false,
  label: "",
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export { serviceContextDefault, type ServiceContextType };
