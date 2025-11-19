import { FaServer, FaUsersGear } from "react-icons/fa6";

import { InstructionsButton } from "@/components/poster/InstructionsButton";
import { PosterSettingsMenu } from "@/components/poster/PosterSettingsMenu";
import { PostForm } from "@/components/poster/PostForm";
import { PostProgress } from "@/components/service/post/PostProgress";
import { PostSwitches } from "@/components/service/post/PostSwitches";
import { StorageProgress } from "@/components/service/storage/StorageProgress";
import { StorageSwitches } from "@/components/service/storage/StorageSwitches";
import { CreatePostProvider } from "@/contexts/CreatePostProvider";

interface PosterProps {
  mode: "server" | "browser";
}

function Poster({ mode }: Readonly<PosterProps>) {
  const showInstructions = mode === "browser";
  const showStorageSwitches = mode === "browser";

  return (
    <div>
      <div className="grid gap-4 p-2 lg:grid-cols-2 lg:p-4 xl:grid-cols-[1fr_1fr_525px] 2xl:grid-cols-[1fr_1fr_620px]">
        <div>
          <section className="rounded bg-gray-100">
            <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
              <h1 className="font-bold">Create Post</h1>
              <div className="flex gap-2 lg:hidden">
                {showInstructions ? <InstructionsButton /> : null}
                {showStorageSwitches ? (
                  <PosterSettingsMenu
                    icon={<FaServer className="size-6" />}
                    label="Storage Settings"
                  >
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      <StorageSwitches mode={mode} />
                    </div>
                  </PosterSettingsMenu>
                ) : null}
                <PosterSettingsMenu
                  icon={<FaUsersGear className="size-6" />}
                  label="Post Settings"
                >
                  <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                    <PostSwitches mode={mode} />
                  </div>
                </PosterSettingsMenu>
              </div>
            </div>
            <div className="p-4">
              <CreatePostProvider>
                <PostForm />
              </CreatePostProvider>
            </div>
          </section>
        </div>

        <div>
          <div className="flex flex-col gap-4 md:sticky md:top-0">
            <section className="rounded bg-gray-100">
              <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
                <h2 className="font-bold">Active Storage Services</h2>
                <div className="hidden gap-2 lg:flex xl:hidden">
                  {showInstructions ? <InstructionsButton /> : null}
                  {showStorageSwitches ? (
                    <PosterSettingsMenu
                      icon={<FaServer className="size-6" />}
                      label="Storage Settings"
                    >
                      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                        <StorageSwitches mode={mode} />
                      </div>
                    </PosterSettingsMenu>
                  ) : null}
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <StorageProgress mode={mode} />
                </div>
              </div>
            </section>
            <section className="rounded bg-gray-100">
              <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
                <h2 className="font-bold">Active Posting Services</h2>
                <div className="hidden gap-2 lg:flex xl:hidden">
                  {showInstructions ? <InstructionsButton /> : null}
                  <PosterSettingsMenu
                    icon={<FaUsersGear className="size-6" />}
                    label="Post Settings"
                  >
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                      <PostSwitches mode={mode} />
                    </div>
                  </PosterSettingsMenu>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <PostProgress mode={mode} />
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="flex flex-col gap-4">
            {showStorageSwitches ? (
              <section className="rounded bg-gray-100">
                <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
                  <h2 className="font-bold">Storage Service Settings</h2>
                  {showInstructions ? <InstructionsButton /> : null}
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                    <StorageSwitches mode={mode} />
                  </div>
                </div>
              </section>
            ) : null}
            <section className="rounded bg-gray-100">
              <div className="flex items-center justify-between gap-2 bg-gray-300 p-2 pl-4">
                <h2 className="font-bold">Posting Service Settings</h2>
                {showInstructions ? <InstructionsButton /> : null}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                  <PostSwitches mode={mode} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Poster };
