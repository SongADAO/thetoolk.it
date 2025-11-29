import { AppHeaderUser } from "@/components/layout/AppHeaderUser";
import { AppLogo } from "@/components/layout/AppLogo";
import { MODE } from "@/config/constants";

function AppHeader() {
  return (
    <div className="flex items-center justify-between border-b border-gray-400 p-2 shadow-sm lg:px-4">
      <div>
        <AppLogo />
      </div>
      {MODE === "server" ? <AppHeaderUser /> : null}
    </div>
  );
}

export { AppHeader };
