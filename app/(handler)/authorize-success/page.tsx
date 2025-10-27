import { AuthorizeSuccess } from "@/components/AuthorizeSuccess";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";

export default function AuthorizeSuccessPage() {
  return (
    <StorageProviders mode="self">
      <PostProviders mode="self">
        <AuthorizeSuccess />
      </PostProviders>
    </StorageProviders>
  );
}
