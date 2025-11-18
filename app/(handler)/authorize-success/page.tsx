import { AuthorizeSuccess } from "@/components/AuthorizeSuccess";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";
import { PostProviders } from "@/services/post/PostProviders";
import { StorageProviders } from "@/services/storage/StorageProviders";

export default function AuthorizeSuccessPage() {
  return (
    <UserStorageProvider mode="self">
      <StorageProviders mode="self">
        <PostProviders mode="self">
          <AuthorizeSuccess />
        </PostProviders>
      </StorageProviders>
    </UserStorageProvider>
  );
}
