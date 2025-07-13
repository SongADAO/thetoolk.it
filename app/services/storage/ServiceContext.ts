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
  isStoring: boolean;
  label: string;
  saveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
  storeError: string;
  storeFile: (file: File) => Promise<string | null>;
  storeJson: (data: object) => Promise<string | null>;
  storeProgress: number;
  storeStatus: string;
  storeVideo: (video: File) => Promise<string | null>;
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
  isStoring: false,
  label: "",
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
  storeError: "",
  storeFile: async (file: File) => null,
  storeJson: async (data: object) => null,
  storeProgress: 0,
  storeStatus: "",
  storeVideo: async (video: File) => null,
};
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

export { serviceContextDefault, type ServiceContextType };
