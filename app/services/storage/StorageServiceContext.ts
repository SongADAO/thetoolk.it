import { ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import type { HLSFiles } from "@/app/lib/hls-converter";
import type { ServiceAccount } from "@/app/services/storage/types";

interface StorageServiceContextType {
  accounts: ServiceAccount[];
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  credentialsId: string;
  error: string;
  fields: ServiceFormField[];
  hasAuthorizationStep: boolean;
  icon: ReactNode;
  initial: ServiceFormState;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  isStoring: boolean;
  isUsable: boolean;
  label: string;
  resetStoreState: () => void;
  saveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
  storeError: string;
  storeFile: (file: File, serviceLabel: string) => Promise<string>;
  storeHLSFolder: (
    hlsFiles: HLSFiles,
    folderName: string,
    serviceLabel: string,
  ) => Promise<string>;
  storeJson: (data: object, serviceLabel: string) => Promise<string>;
  storeProgress: number;
  storeStatus: string;
  storeVideo: (video: File, serviceLabel: string) => Promise<string>;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const storageServiceContextDefault = {
  accounts: [],
  authorizationExpiresAt: "",
  authorize: () => {},
  brandColor: "",
  credentialsId: "",
  error: "",
  fields: [],
  hasAuthorizationStep: false,
  icon: null,
  initial: {},
  isAuthorized: false,
  isComplete: false,
  isEnabled: false,
  isStoring: false,
  isUsable: false,
  label: "",
  resetStoreState: () => {},
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
  storeError: "",
  storeFile: async (file: File, serviceLabel: string) => Promise.resolve(""),
  storeHLSFolder: async (
    hlsFiles: HLSFiles,
    folderName: string,
    serviceLabel: string,
  ) => Promise.resolve(""),
  storeJson: async (data: object, serviceLabel: string) => Promise.resolve(""),
  storeProgress: 0,
  storeStatus: "",
  storeVideo: async (video: File, serviceLabel: string) => Promise.resolve(""),
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export { storageServiceContextDefault, type StorageServiceContextType };
