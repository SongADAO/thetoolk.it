import { AuthorizeError } from "@/components/AuthorizeError";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";
import { PostProviders } from "@/services/post/PostProviders";
import { StorageProviders } from "@/services/storage/StorageProviders";

export default function AuthorizeErrorPage() {
  return (
    <UserStorageProvider mode="self">
      <StorageProviders mode="self">
        <PostProviders mode="self">
          <AuthorizeError />
        </PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
