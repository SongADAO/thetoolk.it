import { FaServer, FaUsersGear } from "react-icons/fa6";

import { PostForm } from "@/app/components/PostForm";
import { PostProgress } from "@/app/components/service/post/PostProgress";
import { PostSettings } from "@/app/components/service/post/PostSettings";
import { ServiceSettingsMenu } from "@/app/components/service/ServiceSettingsMenu";
import { StorageSettings } from "@/app/components/service/storage/StorageSettings";
import { StoreProgress } from "@/app/components/service/storage/StoreProgress";

export default function Home() {
  return (
    <div>
      <header>
        <div className="flex items-center justify-between bg-gray-200 p-2">
          <h1>TheToolk.it</h1>
          <div className="flex gap-4">
            <ServiceSettingsMenu icon={<FaServer />} label="Storage Settings">
              <StorageSettings />
            </ServiceSettingsMenu>
            <ServiceSettingsMenu icon={<FaUsersGear />} label="Post Settings">
              <PostSettings />
            </ServiceSettingsMenu>
          </div>
        </div>
      </header>
      <main>
        <div className="grid gap-8 p-2 lg:grid-cols-2 lg:gap-16">
          <div className="lg:order-1">
            <section className="mb-4">
              <PostForm />
            </section>
          </div>
          <div className="pt-4 lg:order-0">
            <section className="mb-8">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="mb-1">Active Storage Services</h3>
                <div className="hidden lg:block">
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

            <section className="mb-8">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="mb-1">Active Posting Services</h3>
                <div className="hidden lg:block">
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
      </main>
      <footer>
        <div className="flex items-center justify-center gap-2 bg-gray-200 p-2">
          <span>TheToolk.it</span> <span>&copy;2025</span>
        </div>
      </footer>
    </div>
  );
}
