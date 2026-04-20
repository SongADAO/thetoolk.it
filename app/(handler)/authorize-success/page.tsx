import type { Metadata } from "next";

import { AuthorizeSuccess } from "@/components/poster/AuthorizeSuccess";
import { MODE } from "@/config/constants";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";
import { PostProviders } from "@/services/post/PostProviders";
import { StorageProviders } from "@/services/storage/StorageProviders";

export const metadata: Metadata = {
  alternates: {
    canonical: "/authorize-success",
  },
  description: "You have authorized TheToolk.it",
  robots: {
    follow: false,
    index: false,
  },
  title: "Authorization Success - TheToolk.it",
};

export default function AuthorizeSuccessPage() {
  return (
    <UserStorageProvider mode={MODE}>
      <StorageProviders mode={MODE}>
        <PostProviders mode={MODE}>
          <AuthorizeSuccess />
        </PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
