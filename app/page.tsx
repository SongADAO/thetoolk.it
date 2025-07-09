import { PostProviders } from "@/app/components/PostProviders";
import { PostSettings } from "@/app/components/PostSettings";
import { StorageProviders } from "@/app/components/StorageProviders";

export default function Home() {
  return (
    <PostProviders>
      <StorageProviders>
        <div>
          <header>TheToolk.it</header>
          <main>
            <PostSettings />
          </main>
          <footer>TheToolk.it</footer>
        </div>
      </StorageProviders>
    </PostProviders>
  );
}
