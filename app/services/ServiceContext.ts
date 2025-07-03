import { ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import {
  defaultOauthCredentials,
  type OauthAuthorization,
} from "@/app/services/types";

interface ServiceContextType {
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  configId: string;
  error: string;
  exchangeCode: (code: string) => Promise<OauthAuthorization | null>;
  fields: ServiceFormField[];
  getValidAccessToken: () => Promise<string>;
  icon: ReactNode | undefined;
  initAuthCodes: (code: string | null, scope: string | null) => Promise<void>;
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
  authorizationExpiresAt: "",
  authorize: () => {},
  brandColor: "",
  configId: "",
  error: "",
  exchangeCode: async (code: string) => null,
  fields: [],
  getValidAccessToken: async () => "",
  icon: undefined,
  initAuthCodes: async (code: string | null, scope: string | null) => {},
  initial: {},
  isAuthorized: false,
  isComplete: false,
  isEnabled: false,
  label: "",
  saveData: (formState: ServiceFormState) =>
    Object.fromEntries(
      Object.entries(defaultOauthCredentials).map(([key, value]) => [
        key,
        value,
      ]),
    ),
  setIsEnabled: (isEnabled: boolean) => {},
};
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

export { serviceContextDefault, type ServiceContextType };
