"use client";

import { use } from "react";
import { FaServer, FaUsersGear } from "react-icons/fa6";

import { PostForm } from "@/components/PostForm";
import { PostProgress } from "@/components/service/post/PostProgress";
import { PostSettings } from "@/components/service/post/PostSettings";
import { ServiceSettingsMenu } from "@/components/service/ServiceSettingsMenu";
import { StorageSettings } from "@/components/service/storage/StorageSettings";
import { StoreProgress } from "@/components/service/storage/StoreProgress";
import { AuthContext } from "@/contexts/AuthContext";
import { PostProvider } from "@/services/PostProvider";

export default function Home() {
  const { isAuthenticated } = use(AuthContext);

  return (
    <div>
      <div className="px-2 pt-2 lg:hidden">
        <div className="flex items-end justify-end rounded bg-gray-200 px-4 py-2">
          <div className="flex gap-4">
            <ServiceSettingsMenu icon={<FaServer />} label="Storage Settings">
              <StorageSettings />
            </ServiceSettingsMenu>
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
            {isAuthenticated ? null : (
              <section className="rounded bg-gray-100 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3>Storage Service Settings</h3>
                </div>
                <StorageSettings />
              </section>
            )}
            <section className="rounded bg-gray-100 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3>Posting Service Settings</h3>
              </div>
              <PostSettings />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
