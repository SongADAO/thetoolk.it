import { ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/components/service/ServiceForm";
import type {
  PostServiceAccount,
  PostServicePostProps,
} from "@/services/post/types";

interface PostServiceContextType {
  TEXT_MAX_LENGTH: number;
  TITLE_MAX_LENGTH: number;
  VIDEO_MAX_DURATION: number;
  VIDEO_MAX_FILESIZE: number;
  VIDEO_MIN_DURATION: number;
  accounts: PostServiceAccount[];
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  credentialsId: string;
  disconnect: () => void;
  error: string;
  fields: ServiceFormField[];
  handleAuthRedirect: (searchParams: URLSearchParams) => Promise<void>;
  hasAuthorizationStep: boolean;
  hasCompletedAuth: boolean;
  hasHostedCredentials: boolean;
  icon: ReactNode;
  id: string;
  initial: ServiceFormState;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  isHandlingAuth: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  isUsable: boolean;
  label: string;
  mode: "server" | "browser";
  post: (props: PostServicePostProps) => Promise<string | null>;
  processError: string;
  processProgress: number;
  processStatus: string;
  resetProcessState: () => void;
  saveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const postServiceContextDefault = {
  TEXT_MAX_LENGTH: 0,
  TITLE_MAX_LENGTH: 0,
  VIDEO_MAX_DURATION: 0,
  VIDEO_MAX_FILESIZE: 0,
  VIDEO_MIN_DURATION: 0,
  accounts: [],
  authorizationExpiresAt: "",
  authorize: () => {},
  brandColor: "",
  credentialsId: "",
  disconnect: () => {},
  error: "",
  fields: [],
  handleAuthRedirect: async () => {},
  hasAuthorizationStep: false,
  hasCompletedAuth: false,
  hasHostedCredentials: false,
  icon: null,
  id: "",
  initial: {},
  isAuthorized: false,
  isComplete: false,
  isEnabled: false,
  isHandlingAuth: false,
  isLoading: true,
  isProcessing: false,
  isUsable: false,
  label: "",
  mode: "browser" as "server" | "browser",
  post: async (props: PostServicePostProps) => Promise.resolve(null),
  processError: "",
  processProgress: 0,
  processStatus: "",
  resetProcessState: () => {},
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export { postServiceContextDefault, type PostServiceContextType };
