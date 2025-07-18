import { FaServer, FaUsersGear } from "react-icons/fa6";

import { PostForm } from "@/app/components/PostForm";
import { PostProgress } from "@/app/components/service/post/PostProgress";
import { PostSettings } from "@/app/components/service/post/PostSettings";
import { ServiceSettingsMenu } from "@/app/components/service/ServiceSettingsMenu";
import { StorageSettings } from "@/app/components/service/storage/StorageSettings";
import { StoreProgress } from "@/app/components/service/storage/StoreProgress";
import { PostProvider } from "@/app/services/PostProvider";

export default function Home() {
  return (
    <div className="flex min-h-[100vh] flex-col">
      <header>
        <div className="flex items-center justify-between bg-gray-200 p-2">
          <h1>TheToolk.it</h1>
          <div className="flex gap-4 lg:hidden">
            <ServiceSettingsMenu icon={<FaServer />} label="Storage Settings">
              <StorageSettings />
            </ServiceSettingsMenu>
            <ServiceSettingsMenu icon={<FaUsersGear />} label="Post Settings">
              <PostSettings />
            </ServiceSettingsMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="grid gap-4 p-4 lg:grid-cols-2 2xl:grid-cols-[1fr_1fr_620px]">
          <div>
            <section className="rounded bg-gray-100 p-4">
              <PostProvider>
                <PostForm />
              </PostProvider>
            </section>
          </div>

          <div>
            <div className="flex flex-col gap-4">
              <section className="rounded bg-gray-100 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3>Active Storage Services</h3>
                  <div className="hidden lg:block 2xl:hidden">
                    <ServiceSettingsMenu
                      icon={<FaServer />}
                      label="Storage Settings"
                    >
                      <StorageSettings />
                    </ServiceSettingsMenu>
                  </div>
                </div>
                <StoreProgress />
              </section>
              <section className="rounded bg-gray-100 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3>Active Posting Services</h3>
                  <div className="hidden lg:block 2xl:hidden">
                    <ServiceSettingsMenu
                      icon={<FaUsersGear />}
                      label="Post Settings"
                    >
                      <PostSettings />
                    </ServiceSettingsMenu>
                  </div>
                </div>
                <PostProgress />
              </section>
            </div>
          </div>

          <div className="hidden 2xl:block">
            <div className="flex flex-col gap-4">
              <section className="rounded bg-gray-100 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3>Storage Service Settings</h3>
                </div>
                <StorageSettings />
              </section>
              <section className="rounded bg-gray-100 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3>Posting Service Settings</h3>
                </div>
                <PostSettings />
              </section>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <div className="flex items-center justify-center gap-2 bg-gray-200 p-2">
          <span>TheToolk.it</span> <span>&copy;2025</span>
        </div>
      </footer>
    </div>
  );
}
