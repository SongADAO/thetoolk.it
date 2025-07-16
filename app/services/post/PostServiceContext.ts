import { ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import type { PostProps, ServiceAccount } from "@/app/services/post/types";

interface PostServiceContextType {
  accounts: ServiceAccount[];
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  credentialsId: string;
  error: string;
  fields: ServiceFormField[];
  handleAuthRedirect: (searchParams: URLSearchParams) => Promise<void>;
  hasAuthorizationStep: boolean;
  hasCompletedAuth: boolean;
  icon: ReactNode;
  initial: ServiceFormState;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  isHandlingAuth: boolean;
  isPosting: boolean;
  label: string;
  post: (props: PostProps) => Promise<string | null>;
  postError: string;
  postProgress: number;
  postStatus: string;
  saveData: (formState: ServiceFormState) => ServiceFormState;
  setIsEnabled: (isEnabled: boolean) => void;
}

const postServiceContextDefault = {
  accounts: [],
  authorizationExpiresAt: "",
  authorize: () => {},
  brandColor: "",
  credentialsId: "",
  error: "",
  fields: [],
  handleAuthRedirect: async () => {},
  hasAuthorizationStep: false,
  hasCompletedAuth: false,
  icon: null,
  initial: {},
  isAuthorized: false,
  isComplete: false,
  isEnabled: false,
  isHandlingAuth: false,
  isPosting: false,
  label: "",
  post: async (props: PostProps) => null,
  postError: "",
  postProgress: 0,
  postStatus: "",
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
};

export { postServiceContextDefault, type PostServiceContextType };
