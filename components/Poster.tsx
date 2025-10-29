import Link from "next/link";
import { FaCircleQuestion, FaServer, FaUsersGear } from "react-icons/fa6";

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
      <div className="px-2 pt-2 lg:hidden">
        <div className="flex items-end justify-end rounded bg-gray-200 px-4 py-2">
          <div className="flex gap-2">
            {showInstructions ? (
              <Link
                className="flex inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-500 px-4 py-2 text-white outline-none hover:bg-gray-800"
                href="/instructions"
                target="_blank"
                title="Instructions"
              >
                <FaCircleQuestion />
              </Link>
            ) : null}
            {showStorageSettings ? (
              <ServiceSettingsMenu icon={<FaServer />} label="Storage Settings">
                <StorageSettings />
              </ServiceSettingsMenu>
            ) : null}
            <ServiceSettingsMenu icon={<FaUsersGear />} label="Post Settings">
              <PostSettings />
            </ServiceSettingsMenu>
          </div>
        </div>
      </div>
      <div className="grid gap-4 p-2 lg:grid-cols-2 lg:p-4 2xl:grid-cols-[1fr_1fr_620px]">
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
                <div className="hidden gap-2 lg:flex 2xl:hidden">
                  {showInstructions ? (
                    <Link
                      className="flex inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-500 px-4 py-2 text-white outline-none hover:bg-gray-800"
                      href="/instructions"
                      target="_blank"
                      title="Instructions"
                    >
                      <FaCircleQuestion />
                    </Link>
                  ) : null}
                  {showStorageSettings ? (
                    <ServiceSettingsMenu
                      icon={<FaServer />}
                      label="Storage Settings"
                    >
                      <StorageSettings />
                    </ServiceSettingsMenu>
                  ) : null}
                </div>
              </div>
              <StoreProgress />
            </section>
            <section className="rounded bg-gray-100 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3>Active Posting Services</h3>
                <div className="hidden gap-2 lg:flex 2xl:hidden">
                  {showInstructions ? (
                    <Link
                      className="flex inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-500 px-4 py-2 text-white outline-none hover:bg-gray-800"
                      href="/instructions"
                      target="_blank"
                      title="Instructions"
                    >
                      <FaCircleQuestion />
                    </Link>
                  ) : null}
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
          <div className="flex flex-col gap-2">
            {showStorageSettings ? (
              <section className="rounded bg-gray-100 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3>Storage Service Settings</h3>
                  {showInstructions ? (
                    <Link
                      className="hidden inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-500 px-4 py-2 text-white outline-none hover:bg-gray-800 2xl:flex"
                      href="/instructions"
                      target="_blank"
                      title="Instructions"
                    >
                      <FaCircleQuestion />
                    </Link>
                  ) : null}
                </div>
                <StorageSettings />
              </section>
            ) : null}
            <section className="rounded bg-gray-100 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3>Posting Service Settings</h3>
                {showInstructions ? (
                  <Link
                    className="hidden inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-500 px-4 py-2 text-white outline-none hover:bg-gray-800 2xl:flex"
                    href="/instructions"
                    target="_blank"
                    title="Instructions"
                  >
                    <FaCircleQuestion />
                  </Link>
                ) : null}
              </div>
              <PostSettings />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Poster };
