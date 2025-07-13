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
  storeFile: (file: File) => Promise<string>;
  storeJson: (data: object) => Promise<string>;
  storeVideo: (video: File) => Promise<string>;
}

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
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
  storeFile: async (file: File) => "",
  storeJson: async (data: object) => "",
  storeVideo: async (video: File) => "",
};
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

export { serviceContextDefault, type ServiceContextType };
