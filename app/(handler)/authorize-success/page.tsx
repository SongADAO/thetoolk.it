import { AuthorizeSuccess } from "@/components/AuthorizeSuccess";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";

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
