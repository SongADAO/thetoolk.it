import { PostProviders } from "@/app/components/PostProviders";
import { PostSettings } from "@/app/components/PostSettings";
import { StorageProviders } from "@/app/components/StorageProviders";
import { StorageSettings } from "@/app/components/StorageSettings";

export default function Home() {
  return (
    <PostProviders>
      <StorageProviders>
        <div>
          <header>TheToolk.it</header>
          <main>
            <StorageSettings />
            <PostSettings />
          </main>
          <footer>TheToolk.it</footer>
        </div>
      </StorageProviders>
    </PostProviders>
  );
}
