import { Poster } from "@/components/Poster";
import { PostProviders } from "@/components/service/post/PostProviders";
import { StorageProviders } from "@/components/service/storage/StorageProviders";

export default function Home() {
  return (
    <div>
      <div>TheToolk.it Free</div>
      <StorageProviders mode="self">
        <PostProviders mode="self">
          <Poster mode="self" />
        </PostProviders>
      </StorageProviders>
    </div>
  );
}
