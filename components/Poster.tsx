import { FaServer, FaUsersGear } from "react-icons/fa6";

import { InstructionsButton } from "@/components/InstructionsButton";
import { PostForm } from "@/components/PostForm";
import { PostProgress } from "@/components/service/post/PostProgress";
import { PostSettings } from "@/components/service/post/PostSettings";
import { ServiceSettingsMenu } from "@/components/service/ServiceSettingsMenu";
import { StorageSettings } from "@/components/service/storage/StorageSettings";
import { StoreProgress } from "@/components/service/storage/StoreProgress";
import { PostProvider } from "@/services/PostProvider";

interface PosterProps {
  mode: "hosted" | "self";
}

function Poster({ mode }: Readonly<PosterProps>) {
  const showInstructions = mode === "self";
  const showStorageSettings = mode === "self";

  return (
    <div>
      <div className="grid gap-4 p-2 lg:grid-cols-2 lg:p-4 xl:grid-cols-[1fr_1fr_525px] 2xl:grid-cols-[1fr_1fr_620px]">
        <div>
          <section className="rounded bg-gray-100">
            <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
              <h1 className="font-bold">Create Post</h1>
              <div className="flex gap-2 lg:hidden">
                {showInstructions ? <InstructionsButton /> : null}
                {showStorageSettings ? (
                  <ServiceSettingsMenu
                    icon={<FaServer className="size-6" />}
                    label="Storage Settings"
                  >
                    <StorageSettings />
                  </ServiceSettingsMenu>
                ) : null}
                <ServiceSettingsMenu
                  icon={<FaUsersGear className="size-6" />}
                  label="Post Settings"
                >
                  <PostSettings mode={mode} />
                </ServiceSettingsMenu>
              </div>
            </div>
            <div className="p-4">
              <PostProvider>
                <PostForm />
              </PostProvider>
            </div>
          </section>
        </div>

        <div>
          <div className="flex flex-col gap-4">
            <section className="rounded bg-gray-100">
              <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
                <h2 className="font-bold">Active Storage Services</h2>
                <div className="hidden gap-2 lg:flex xl:hidden">
                  {showInstructions ? <InstructionsButton /> : null}
                  {showStorageSettings ? (
                    <ServiceSettingsMenu
                      icon={<FaServer className="size-6" />}
                      label="Storage Settings"
                    >
                      <StorageSettings />
                    </ServiceSettingsMenu>
                  ) : null}
                </div>
              </div>
              <div className="p-4">
                <StoreProgress />
              </div>
            </section>
            <section className="rounded bg-gray-100">
              <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
                <h2 className="font-bold">Active Posting Services</h2>
                <div className="hidden gap-2 lg:flex xl:hidden">
                  {showInstructions ? <InstructionsButton /> : null}
                  <ServiceSettingsMenu
                    icon={<FaUsersGear className="size-6" />}
                    label="Post Settings"
                  >
                    <PostSettings mode={mode} />
                  </ServiceSettingsMenu>
                </div>
              </div>
              <div className="p-4">
                <PostProgress mode={mode} />
              </div>
            </section>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="flex flex-col gap-4">
            {showStorageSettings ? (
              <section className="rounded bg-gray-100">
                <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
                  <h2 className="font-bold">Storage Service Settings</h2>
                  {showInstructions ? <InstructionsButton /> : null}
                </div>
                <div className="p-4">
                  <StorageSettings />
                </div>
              </section>
            ) : null}
            <section className="rounded bg-gray-100">
              <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
                <h2 className="font-bold">Posting Service Settings</h2>
                {showInstructions ? <InstructionsButton /> : null}
              </div>
              <div className="p-4">
                <PostSettings mode={mode} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Poster };
