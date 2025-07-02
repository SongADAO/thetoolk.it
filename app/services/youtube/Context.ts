import { createContext, ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import {
  defaultCredentials,
  type YoutubeAuthorization,
} from "@/app/services/youtube/types";

interface YoutubeContextType {
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  configId: string;
  error: string;
  exchangeCode: (code: string) => Promise<YoutubeAuthorization | null>;
  getValidAccessToken: () => Promise<string>;
  icon: ReactNode | undefined;
  initAuthCodes: (code: string | null, scope: string | null) => Promise<void>;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  label: string;
  serviceFormFields: ServiceFormField[];
  serviceFormInitial: ServiceFormState;
  serviceFormSaveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
const YoutubeContext = createContext<YoutubeContextType>({
  authorizationExpiresAt: "",
  authorize: () => {},
  brandColor: "",
  configId: "",
  error: "",
  exchangeCode: async (code: string) => null,
  getValidAccessToken: async () => "",
  icon: undefined,
  initAuthCodes: async (code: string | null, scope: string | null) => {},
  isAuthorized: false,
  isComplete: false,
  isEnabled: false,
  label: "",
  serviceFormFields: [],
  serviceFormInitial: {},
  serviceFormSaveData: (formState: ServiceFormState) =>
    Object.fromEntries(
      Object.entries(defaultCredentials).map(([key, value]) => [key, value]),
    ),
  setIsEnabled: (isEnabled: boolean) => {},
});
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

export { YoutubeContext };
