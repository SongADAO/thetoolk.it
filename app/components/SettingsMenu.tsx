import { FaServer, FaUsersGear } from "react-icons/fa6";

import { PostSettings } from "@/app/components/service/post/PostSettings";
import { StorageSettings } from "@/app/components/service/storage/StorageSettings";
import { SettingsMenuItem } from "@/app/components/SettingsMenuItem";

function SettingsMenu() {
  return (
    <div className="flex gap-4">
      <SettingsMenuItem icon={<FaServer />} label="Storage Settings">
        <StorageSettings />
      </SettingsMenuItem>
      <SettingsMenuItem icon={<FaUsersGear />} label="Post Settings">
        <PostSettings />
      </SettingsMenuItem>
    </div>
  );
}

export { SettingsMenu };
