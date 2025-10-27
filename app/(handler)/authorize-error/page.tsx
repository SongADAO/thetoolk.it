import { AuthorizeError } from "@/components/AuthorizeError";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";

export default function AuthorizeErrorPage() {
  return (
    <StorageProviders mode="self">
      <PostProviders mode="self">
        <AuthorizeError />
      </PostProviders>
    </StorageProviders>
  );
}
