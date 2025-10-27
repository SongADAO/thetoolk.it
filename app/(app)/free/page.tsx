import { Poster } from "@/components/Poster";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";
import { UserStorageProvider } from "@/contexts/UserStorageProvider";

export default function Home() {
  return (
    <div>
      <div>TheToolk.it Free</div>
      <UserStorageProvider mode="self">
        <StorageProviders mode="self">
          <PostProviders mode="self">
            <Poster mode="self" />
          </PostProviders>
        </StorageProviders>
      </UserStorageProvider>
    </div>
  );
}
