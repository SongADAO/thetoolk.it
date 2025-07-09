import { FaServer, FaUsersGear } from "react-icons/fa6";

import { PostSettings } from "@/app/components/PostSettings";
import { SettingsMenuItem } from "@/app/components/SettingsMenuItem";
import { StorageSettings } from "@/app/components/StorageSettings";

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
