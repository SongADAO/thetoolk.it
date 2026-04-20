import type { Metadata } from "next";

import { AuthorizeError } from "@/components/poster/AuthorizeError";
import { MODE } from "@/config/constants";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";
import { PostProviders } from "@/services/post/PostProviders";
import { StorageProviders } from "@/services/storage/StorageProviders";

export const metadata: Metadata = {
  alternates: {
    canonical: "/authorize-error",
  },
  description: "There was an error during authorization TheToolk.it",
  robots: {
    follow: false,
    index: false,
  },
  title: "Authorization Error - TheToolk.it",
};

export default function AuthorizeErrorPage() {
  return (
    <UserStorageProvider mode={MODE}>
      <StorageProviders mode={MODE}>
        <PostProviders mode={MODE}>
          <AuthorizeError />
        </PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
