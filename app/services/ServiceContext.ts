import { ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import type { ServiceAccount } from "@/app/services/types";

interface ServiceContextType {
  accounts: ServiceAccount[];
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  credentialsId: string;
  error: string;
  fields: ServiceFormField[];
  getValidAccessToken: () => Promise<string>;
  handleAuthRedirect: (searchParams: URLSearchParams) => Promise<void>;
  icon: ReactNode | undefined;
  initial: ServiceFormState;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
  saveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
const serviceContextDefault = {
  accounts: [],
  authorizationExpiresAt: "",
  authorize: () => {},
  brandColor: "",
  credentialsId: "",
  error: "",
  fields: [],
  getValidAccessToken: async () => "",
  handleAuthRedirect: async () => {},
  icon: undefined,
  initial: {},
  isAuthorized: false,
  isComplete: false,
  isEnabled: false,
  label: "",
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
};
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

export { serviceContextDefault, type ServiceContextType };
