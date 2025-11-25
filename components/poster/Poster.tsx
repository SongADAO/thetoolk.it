import { FaServer, FaUsersGear } from "react-icons/fa6";

import { Box } from "@/components/general/Box";
import { BoxHeader } from "@/components/general/BoxHeader";
import { BoxMain } from "@/components/general/BoxMain";
import { BoxSwitches } from "@/components/general/BoxSwitches";
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
    <article className="grid gap-4 p-2 lg:grid-cols-2 lg:p-4 xl:grid-cols-[1fr_1fr_525px] 2xl:grid-cols-[1fr_1fr_620px]">
      <div>
        <Box>
          <BoxHeader>
            <h1 className="font-bold">Create Post</h1>
            <div className="flex gap-2 lg:hidden">
              {showInstructions ? <InstructionsButton /> : null}

              {showStorageSwitches ? (
                <PosterSettingsMenu
                  icon={<FaServer className="size-6" />}
                  label="Storage Settings"
                >
                  <BoxSwitches>
                    <StorageSwitches mode={mode} />
                  </BoxSwitches>
                </PosterSettingsMenu>
              ) : null}

              <PosterSettingsMenu
                icon={<FaUsersGear className="size-6" />}
                label="Post Settings"
              >
                <BoxSwitches>
                  <PostSwitches mode={mode} />
                </BoxSwitches>
              </PosterSettingsMenu>
            </div>
          </BoxHeader>
          <BoxMain>
            <CreatePostProvider>
              <PostForm />
            </CreatePostProvider>
          </BoxMain>
        </Box>
      </div>

      <div>
        <div className="flex flex-col gap-4 md:sticky md:top-4">
          <Box>
            <BoxHeader>
              <h2 className="font-bold">Active Storage Services</h2>
              <div className="hidden gap-2 lg:flex xl:hidden">
                {showInstructions ? <InstructionsButton /> : null}

                {showStorageSwitches ? (
                  <PosterSettingsMenu
                    icon={<FaServer className="size-6" />}
                    label="Storage Settings"
                  >
                    <BoxSwitches>
                      <StorageSwitches mode={mode} />
                    </BoxSwitches>
                  </PosterSettingsMenu>
                ) : null}
              </div>
            </BoxHeader>
            <BoxMain>
              <div className="grid grid-cols-2 gap-2">
                <StorageProgress mode={mode} />
              </div>
            </BoxMain>
          </Box>
          <Box>
            <BoxHeader>
              <h2 className="font-bold">Active Posting Services</h2>
              <div className="hidden gap-2 lg:flex xl:hidden">
                {showInstructions ? <InstructionsButton /> : null}

                <PosterSettingsMenu
                  icon={<FaUsersGear className="size-6" />}
                  label="Post Settings"
                >
                  <BoxSwitches>
                    <PostSwitches mode={mode} />
                  </BoxSwitches>
                </PosterSettingsMenu>
              </div>
            </BoxHeader>
            <BoxMain>
              <div className="grid grid-cols-2 gap-2">
                <PostProgress mode={mode} />
              </div>
            </BoxMain>
          </Box>
        </div>
      </div>

      <div className="hidden xl:block">
        <div className="flex flex-col gap-4">
          {showStorageSwitches ? (
            <Box>
              <BoxHeader>
                <h2 className="font-bold">Storage Service Settings</h2>

                {showInstructions ? <InstructionsButton /> : null}
              </BoxHeader>
              <BoxMain>
                <BoxSwitches>
                  <StorageSwitches mode={mode} />
                </BoxSwitches>
              </BoxMain>
            </Box>
          ) : null}

          <Box>
            <BoxHeader>
              <h2 className="font-bold">Posting Service Settings</h2>

              {showInstructions ? <InstructionsButton /> : null}
            </BoxHeader>
            <BoxMain>
              <BoxSwitches>
                <PostSwitches mode={mode} />
              </BoxSwitches>
            </BoxMain>
          </Box>
        </div>
      </div>
    </article>
  );
}

export { Poster };
