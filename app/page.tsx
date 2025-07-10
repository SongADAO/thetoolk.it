import { PostForm } from "@/app/components/PostForm";
import { PostProgress } from "@/app/components/PostProgress";
import { PostProviders } from "@/app/components/PostProviders";
import { PostRedirectHandlers } from "@/app/components/PostRedirectHandlers";
import { SettingsMenu } from "@/app/components/SettingsMenu";
import { StorageProviders } from "@/app/components/StorageProviders";

export default function Home() {
  return (
    <PostProviders>
      <StorageProviders>
        <div>
          <header>TheToolk.it</header>
          <main>
            <SettingsMenu />
            <PostForm />
            <PostProgress />
          </main>
          <footer>TheToolk.it</footer>
        </div>

        <PostRedirectHandlers />
      </StorageProviders>
    </PostProviders>
  );
}
