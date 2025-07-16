import { PostForm } from "@/app/components/PostForm";
import { PostProgress } from "@/app/components/service/post/PostProgress";
import { PostProviders } from "@/app/components/service/post/PostProviders";
import { PostRedirectHandlers } from "@/app/components/service/post/PostRedirectHandlers";
import { StorageProviders } from "@/app/components/service/storage/StorageProviders";
import { StoreProgress } from "@/app/components/service/storage/StoreProgress";
import { SettingsMenu } from "@/app/components/SettingsMenu";

export default function Home() {
  return (
    <PostProviders>
      <StorageProviders>
        <div>
          <header>
            <div className="flex items-center justify-between bg-gray-200 p-2">
              TheToolk.it
              <SettingsMenu />
            </div>
          </header>
          <main>
            <div className="grid gap-8 p-2 lg:grid-cols-2">
              <div className="lg:order-1">
                <section className="mb-4">
                  <PostForm />
                </section>
              </div>
              <div className="lg:order-0">
                <section className="mb-4">
                  <h3 className="mb-1">Active Storage Services</h3>
                  <StoreProgress />
                </section>

                <section className="mb-4">
                  <h3 className="mb-1">Active Posting Services</h3>
                  <PostProgress />
                </section>
              </div>
            </div>
          </main>
          <footer>
            <div className="flex items-center justify-center gap-2 bg-gray-200 p-2">
              <span>TheToolk.it</span> <span>&copy;2025</span>
            </div>
          </footer>
        </div>

        <PostRedirectHandlers />
      </StorageProviders>
    </PostProviders>
  );
}
