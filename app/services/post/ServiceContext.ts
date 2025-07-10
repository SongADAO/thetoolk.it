import { ReactNode } from "react";

import type {
  ServiceFormField,
  ServiceFormState,
} from "@/app/components/service/ServiceForm";
import type { PostProps, ServiceAccount } from "@/app/services/post/types";

interface ServiceContextType {
  accounts: ServiceAccount[];
  authorizationExpiresAt: string;
  authorize: () => void;
  brandColor: string;
  credentialsId: string;
  error: string;
  fields: ServiceFormField[];
  handleAuthRedirect: (searchParams: URLSearchParams) => Promise<void>;
  icon: ReactNode | undefined;
  initial: ServiceFormState;
  isAuthorized: boolean;
  isComplete: boolean;
  isEnabled: boolean;
  isPosting: boolean;
  label: string;
  post: (props: PostProps) => Promise<string | null>;
  postError: string;
  postProgress: number;
  postStatus: string;
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
  handleAuthRedirect: async () => {},
  icon: undefined,
  initial: {},
  isAuthorized: false,
  isComplete: false,
  isEnabled: false,
  isPosting: false,
  label: "",
  post: async (props: PostProps) => null,
  postError: "",
  postProgress: 0,
  postStatus: "",
  saveData: (formState: ServiceFormState) => ({}),
  setIsEnabled: (isEnabled: boolean) => {},
};
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */

export { serviceContextDefault, type ServiceContextType };
