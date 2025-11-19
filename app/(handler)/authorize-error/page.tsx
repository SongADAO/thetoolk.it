import type { Metadata } from "next";

import { AuthorizeError } from "@/components/poster/AuthorizeError";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";
import { PostProviders } from "@/services/post/PostProviders";
import { StorageProviders } from "@/services/storage/StorageProviders";

export const metadata: Metadata = {
  alternates: {
    canonical: "/authorize-error",
  },
  description: "There was an error during authorization TheToolk.it",
  title: "Authorize Error - TheToolk.it",
};

export default function AuthorizeErrorPage() {
  return (
    <UserStorageProvider mode="browser">
      <StorageProviders mode="browser">
        <PostProviders mode="browser">
          <AuthorizeError />
        </PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
