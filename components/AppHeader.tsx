import { AppHeaderUser } from "@/components/AppHeaderUser";
import { AppLogo } from "@/components/AppLogo";

function AppHeader() {
  return (
    <div className="flex items-center justify-between bg-gray-200 p-2 lg:px-4">
      <h1>
        <AppLogo />
      </h1>
      <AppHeaderUser />
    </div>
  );
}

export { AppHeader };
