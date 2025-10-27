import { AuthorizeError } from "@/components/AuthorizeError";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";

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
