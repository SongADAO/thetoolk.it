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
  saveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
  storeError: string;
  storeFile: (file: File) => Promise<string | null>;
  storeHLSFolder: (
    hlsFiles: HLSFiles,
    folderName?: string,
  ) => Promise<string | null>;
  storeJson: (data: object) => Promise<string | null>;
  storeProgress: number;
  storeStatus: string;
  storeVideo: (video: File) => Promise<string | null>;
}

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
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
  storeError: "",
  storeFile: async (file: File) => null,
  storeHLSFolder: async (hlsFiles: HLSFiles, folderName?: string) => null,
  storeJson: async (data: object) => null,
  storeProgress: 0,
  storeStatus: "",
  storeVideo: async (video: File) => null,
};

export { storageServiceContextDefault, type StorageServiceContextType };
