import { AuthorizeSuccess } from "@/components/poster/AuthorizeSuccess";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";
import { PostProviders } from "@/services/post/PostProviders";
import { StorageProviders } from "@/services/storage/StorageProviders";

export default function AuthorizeSuccessPage() {
  return (
    <UserStorageProvider mode="browser">
      <StorageProviders mode="browser">
        <PostProviders mode="browser">
          <AuthorizeSuccess />
        </PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
