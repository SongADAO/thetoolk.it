import { ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/components/service/ServiceForm";
import type { HLSFiles } from "@/lib/video/hls";
import type { StorageServiceAccount } from "@/services/storage/types";

interface StorageServiceContextType {
  accounts: StorageServiceAccount[];
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  credentialsId: string;
  disconnect: () => void;
  error: string;
  fields: ServiceFormField[];
  hasAuthorizationStep: boolean;
  hasHostedCredentials: boolean;
  icon: ReactNode;
  id: string;
  initial: ServiceFormState;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  isUsable: boolean;
  label: string;
  mode: "server" | "browser";
  processError: string;
  processProgress: number;
  processStatus: string;
  resetProcessState: () => void;
  saveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
  storeFile: (file: File, serviceLabel: string) => Promise<string>;
  storeHLSFolder: (
    hlsFiles: HLSFiles,
    folderName: string,
    serviceLabel: string,
  ) => Promise<string>;
  storeJson: (data: object, serviceLabel: string) => Promise<string>;
  storeVideo: (video: File, serviceLabel: string) => Promise<string>;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const storageServiceContextDefault = {
  accounts: [],
  authorizationExpiresAt: "",
  authorize: () => {},
  brandColor: "",
  credentialsId: "",
  disconnect: () => {},
  error: "",
  fields: [],
  hasAuthorizationStep: false,
  hasHostedCredentials: false,
  icon: null,
  id: "",
  initial: {},
  isAuthorized: false,
  isComplete: false,
  isEnabled: false,
  isLoading: true,
  isProcessing: false,
  isUsable: false,
  label: "",
  mode: "browser" as "server" | "browser",
  processError: "",
  processProgress: 0,
  processStatus: "",
  resetProcessState: () => {},
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
  storeFile: async (file: File, serviceLabel: string) => Promise.resolve(""),
  storeHLSFolder: async (
    hlsFiles: HLSFiles,
    folderName: string,
    serviceLabel: string,
  ) => Promise.resolve(""),
  storeJson: async (data: object, serviceLabel: string) => Promise.resolve(""),
  storeVideo: async (video: File, serviceLabel: string) => Promise.resolve(""),
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export { storageServiceContextDefault, type StorageServiceContextType };
