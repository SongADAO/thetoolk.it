import { ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/components/service/ServiceForm";
import type { PostProps, ServiceAccount } from "@/services/post/types";

interface PostServiceContextType {
  VIDEO_MAX_DURATION: number;
  VIDEO_MAX_FILESIZE: number;
  VIDEO_MIN_DURATION: number;
  accounts: ServiceAccount[];
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
  isPosting: boolean;
  isUsable: boolean;
  label: string;
  loading: boolean;
  mode: "hosted" | "self";
  post: (props: PostProps) => Promise<string | null>;
  postError: string;
  postProgress: number;
  postStatus: string;
  resetPostState: () => void;
  saveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const postServiceContextDefault = {
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
  isPosting: false,
  isUsable: false,
  label: "",
  loading: true,
  mode: "self",
  post: async (props: PostProps) => Promise.resolve(null),
  postError: "",
  postProgress: 0,
  postStatus: "",
  resetPostState: () => {},
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export { postServiceContextDefault, type PostServiceContextType };
